import { ReactNode, useRef, useEffect, useState } from 'react';
import { avatar, avatarContainer } from './Chatbot.css';
import { darkTheme, lightTheme } from './Theme.css';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import type { StateMachineAnimations } from '../types';
import { ChatbotBubble } from './ChatbotBubble';
import { useMessageQueue } from '../hooks/useMessageQueue';

const LOTTI_URL = 'https://lottie.host/2f4ad578-fb21-479d-96e6-b2c32378b661/Qw7rkcRRBE.lottie';

export function Chatbot(): ReactNode {
    const [currentTheme, setCurrentTheme] = useState(lightTheme);
    const dotLottieRef = useRef<DotLottie | null>(null);

    const { currentMessage, isExiting, showMessage, showMessages, clearQueue, skipCurrent, queueLength } = useMessageQueue({
        fadeOutDuration: 300,
        delayBetweenMessages: 500,
        onAnimationTrigger: (animation) => {
            updateAvatarAnimation(animation);
        },
    });

    useEffect(() => {
        const dotLottie = dotLottieRef.current;
        if (!dotLottie) return;

        const handleLoad = () => {
            dotLottie.stateMachineLoad('StateMachine1');
            dotLottie.stateMachineStart();
            updateAvatarAnimation('jumpClick');

            showMessages([
                {
                    text: 'Welcome you !',
                    type: 'state',
                    duration: 2000,
                    animation: 'jumpClick',
                },
                {
                    text: 'Loading resources...',
                    type: 'state',
                    duration: 1500,
                    animation: 'thinkClick',
                },
                {
                    text: 'Ready! Can I help you ?',
                    type: 'response',
                    animation: 'yesClick',
                },
            ]);
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
    }, [showMessage, showMessages]);

    const handleClick = () => {
        if (currentMessage && !currentMessage.duration) {
            updateAvatarAnimation('noClick');
            skipCurrent();
            return;
        } else {
            updateAvatarAnimation('yesClick');

            showMessage({
                text: 'You clicked me!',
                type: 'state',
                duration: 1500,
            });
        }
    };

    const handleHover = () => {
        updateAvatarAnimation('jumpClick');
        dotLottieRef.current?.setLoop(true);
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
            {currentMessage && (
                <ChatbotBubble
                    message={currentMessage}
                    isExiting={isExiting}
                />
            )}
        </div>
    );
}
