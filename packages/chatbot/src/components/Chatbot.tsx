import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { avatar, avatarContainer } from './Chatbot.css';
import { darkTheme, lightTheme } from './Theme.css';

import type { ChatbotProps, ChatbotAction, ActiveForm } from '../types';
import { ChatbotBubble } from './ChatbotBubble';
import { ChatbotForm } from './ChatbotForm';
import { ChatbotLoader } from './ChatbotLoader';
import { useMessageQueue } from '../hooks/useMessageQueue';
import { saveMessage } from '../utils/storage';
import { Cloudee, AnimationName } from './cloudee/Cloudee';
import { RuntimeAvatar } from './cloudee/avatar-runtime';

export function Chatbot({ commands, onCommandExecute, theme, persistMessages = false, appId = 'default' }: ChatbotProps): ReactNode {
    const [currentTheme] = useState(theme === 'dark' ? darkTheme : lightTheme);
    const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [loaderMessage, setLoaderMessage] = useState('Exécution en cours...');
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const cloudeeRef = useRef<RuntimeAvatar>(null);
    const defaultAnimation: AnimationName = 'happy';
    const hoverAnimation: AnimationName = 'confused';
    const [animationState, setAnimationState] = useState<AnimationName>(defaultAnimation);
    const hasQueuedIntro = useRef(false);

    const [isBubbleOpened, setIsBubbleOpened] = useState(false);

    const { currentMessage, isExiting, showMessage, showMessages, clearQueue, skipCurrent, queueLength } = useMessageQueue({
        fadeOutDuration: 300,
        delayBetweenMessages: 10,
        onAnimationTrigger: (animation: AnimationName) => {
            setAnimationState(animation);
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
                    animation: 'scared',
                    actions: [
                        {
                            id: `retry-${action.id}`,
                            label: '🔄 Réessayer',
                            onExecute: () => runCommand(action, data),
                        },
                    ],
                });
            } finally {
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
            if (!activeForm) {
                return;
            }
            setAnimationState('thinking');
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
        if (hasQueuedIntro.current) return;
        hasQueuedIntro.current = true;

        showMessages([
            {
                text: 'Hello !',
                type: 'state',
                duration: 1000,
                animation: 'idle',
            },
            {
                text: 'Chargement en cours...',
                type: 'state',
                duration: 3000,
                animation: 'thinking',
            },
            {
                text: "Prêt! Comment puis-je t'aider ?",
                type: 'response',
                animation: defaultAnimation,
                duration: 2000,
            },
        ]);
    }, [showMessages]);

    const introHasPlayed = useRef(false);
    useEffect(() => {
        if (!isFirstLoad) return;
        if (currentMessage !== null || queueLength > 0) {
            introHasPlayed.current = true;
        } else if (introHasPlayed.current) {
            setIsFirstLoad(false);
        }
    }, [isFirstLoad, currentMessage, queueLength]);

    const handleClick = () => {
        if (isFirstLoad) {
            return;
        }

        if (currentMessage && !currentMessage.duration) {
            skipCurrent();
            clearQueue();
            setIsBubbleOpened(false);
            setAnimationState(defaultAnimation);
        } else {
            setIsBubbleOpened(true);
            showMessage({
                text: 'Voici les commandes disponibles :',
                type: 'response',
                allowHtml: true,
                animation: 'curious',
                ...(commands ? { actions: commands } : {}),
            });
        }
    };

    const handleHover = () => {
        if (isFirstLoad || isBubbleOpened) {
            return;
        }
        showMessage({
            text: 'Hey !',
            type: 'state',
            animation: hoverAnimation,
            duration: 500,
        });
    };

    const handleMouseLeave = () => {
        if (!isFirstLoad && !isBubbleOpened) {
            setAnimationState(defaultAnimation);
        }
    };

    return (
        <div className={[avatarContainer, currentTheme].join(' ')}>
            <div
                className={avatar}
                onClick={handleClick}
                onMouseEnter={handleHover}
                onMouseLeave={handleMouseLeave}
            >
                <Cloudee
                    animation={animationState}
                    size={100}
                    loop={true}
                    ref={cloudeeRef}
                />
            </div>

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
