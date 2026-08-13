import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { avatar, avatarContainer } from './Chatbot.css';
import { darkTheme, lightTheme } from './Theme.css';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import type { StateMachineAnimations, ChatbotProps, ChatbotAction, ActiveForm } from '../types';
import { ChatbotBubble } from './ChatbotBubble';
import { ChatbotForm } from './ChatbotForm';
import { ChatbotLoader } from './ChatbotLoader';
import { useMessageQueue } from '../hooks/useMessageQueue';
import { saveMessage } from '../utils/storage';

const LOTTI_URL = 'https://lottie.host/2f4ad578-fb21-479d-96e6-b2c32378b661/Qw7rkcRRBE.lottie';

export function Chatbot({ commands, onCommandExecute, theme, persistMessages = false, appId = 'default' }: ChatbotProps): ReactNode {
    const [currentTheme] = useState(theme === 'dark' ? darkTheme : lightTheme);
    const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [loaderMessage, setLoaderMessage] = useState('Exécution en cours...');
    const [firstLoad, setFirstLoad] = useState(true);
    const dotLottieRef = useRef<DotLottie | null>(null);

    const { currentMessage, isExiting, showMessage, showMessages, clearQueue, skipCurrent } = useMessageQueue({
        fadeOutDuration: 300,
        delayBetweenMessages: 10,
        onAnimationTrigger: (animation) => {
            updateAvatarAnimation(animation);
        },
    });

    // Persist response messages
    useEffect(() => {
        if (persistMessages && currentMessage) {
            saveMessage(currentMessage, appId);
        }
    }, [currentMessage, persistMessages, appId]);

    const runCommand = useCallback(
        async (action: ChatbotAction, data: Record<string, any>) => {
            updateAvatarAnimation('thinkClick');
            dotLottieRef.current?.setLoop(true);
            showMessage({
                text: loaderMessage,
                type: 'state',
                duration: 500,
            });
            setIsExecuting(true);
            onCommandExecute?.(action.id, data);

            try {
                await action.onExecute(data, { showMessage });
            } catch {
                showMessage({
                    text: 'Une erreur est survenue',
                    type: 'state',
                    duration: 3000,
                    animation: 'alertClick',
                    actions: [
                        {
                            id: `retry-${action.id}`,
                            label: '🔄 Réessayer',
                            onExecute: () => runCommand(action, data),
                        },
                    ],
                });
            } finally {
                dotLottieRef.current?.setLoop(false);
                setIsExecuting(false);
            }
        },
        [onCommandExecute, showMessage],
    );

    const handleActionClick = useCallback(
        (action: ChatbotAction) => {
            if (action.inputs && action.inputs.length > 0) {
                setActiveForm({ actionId: action.id, action });
            } else {
                runCommand(action, {});
            }
        },
        [runCommand],
    );

    const handleFormSubmit = useCallback(
        (data: Record<string, any>) => {
            if (!activeForm) return;
            const { action } = activeForm;
            setActiveForm(null);
            skipCurrent();
            runCommand(action, data);
        },
        [activeForm, skipCurrent, runCommand],
    );

    const handleFormCancel = useCallback(() => {
        setActiveForm(null);
    }, []);

    useEffect(() => {
        const dotLottie = dotLottieRef.current;
        if (!dotLottie) return;

        const handleLoad = () => {
            dotLottie.stateMachineLoad('StateMachine1');
            dotLottie.stateMachineStart();
            if (firstLoad) {
                showMessages([
                    {
                        text: 'Hello !',
                        type: 'state',
                        duration: 1000,
                        animation: 'jumpClick',
                    },
                    {
                        text: 'Chargement en cours...',
                        type: 'state',
                        duration: 1500,
                        animation: 'thinkClick',
                    },
                    {
                        text: "Prêt! Comment puis-je t'aider ?",
                        type: 'response',
                        animation: 'yesClick',
                        duration: 2000,
                    },
                ]);
                setFirstLoad(false);
            }
        };

        const handleError = (event: any) => {
            console.error('Erreur:', event.error);
        };

        dotLottie.addEventListener('load', handleLoad);
        dotLottie.addEventListener('stateMachineError', handleError);

        return () => {
            dotLottie.removeEventListener('load', handleLoad);
            dotLottie.removeEventListener('stateMachineError', handleError);
        };
    }, [commands, showMessage, showMessages, firstLoad]);

    const handleClick = () => {
        if (firstLoad) {
            return;
        }

        if (currentMessage && !currentMessage.duration) {
            skipCurrent();
            clearQueue();
        } else {
            showMessage({
                text: 'Voici les commandes disponibles :',
                type: 'response',
                allowHtml: true,
                animation: 'yesClick',
                ...(commands ? { actions: commands } : {}),
            });
        }
    };

    const handleHover = () => {
        if (firstLoad) {
            return;
        }
        updateAvatarAnimation('jumpClick');
        dotLottieRef.current?.setLoop(true);
        showMessage({
            text: 'Hey !',
            type: 'state',
            duration: 500,
        });
    };

    const handleMouseLeave = () => {
        dotLottieRef.current?.setLoop(false);
    };

    function updateAvatarAnimation(animationId: StateMachineAnimations) {
        dotLottieRef.current?.stateMachineFireEvent(animationId);
    }

    return (
        <div className={[avatarContainer, currentTheme].join(' ')}>
            <DotLottieReact
                src={LOTTI_URL}
                dotLottieRefCallback={(dotLottie) => {
                    dotLottieRef.current = dotLottie;
                }}
                onClick={handleClick}
                onMouseEnter={handleHover}
                onMouseLeave={handleMouseLeave}
                className={avatar}
                width={100}
                height={100}
            />

            {/* {isExecuting && <ChatbotLoader message={loaderMessage} />} */}

            {!isExecuting && activeForm && (
                <ChatbotForm
                    action={activeForm.action}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            {!isExecuting && !activeForm && currentMessage && (
                <ChatbotBubble
                    message={currentMessage}
                    isExiting={isExiting}
                    onActionClick={handleActionClick}
                />
            )}
        </div>
    );
}
