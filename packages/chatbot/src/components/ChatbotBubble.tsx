import { type ReactNode } from 'react';
import { marked } from 'marked';
import type { ChatbotBubbleProps } from '../types';
import useTypewriter from '../hooks/useTypewriter';
import { sanitizeHtml } from '../utils/sanitize';
import { ChatbotActions } from './ChatbotActions';

import './ChatbotBubble.rainbow-angle.css';
import { rainbow } from './RainbowBorder.css';
import * as styles from './ChatbotBubble.css';

export function ChatbotBubble({ message, isExiting, onActionClick }: ChatbotBubbleProps): ReactNode {
    if (!message) return null;

    const isStateMessage = message.type === 'state';

    let containerClass = isExiting
        ? `${styles.chatBubbleContainer} ${styles.fadeOutAnimation}`
        : styles.chatBubbleContainer;

    containerClass = `${containerClass} ${rainbow}`;

    const { displayedText, isTyping, skipAnimation } = useTypewriter({
        text: message.text,
        speed: 5,
        enabled: !isStateMessage,
    });

    // Texte à afficher (complet pour state, partiel pour response)
    const rawText = isStateMessage ? message.text : displayedText;
    const textToDisplay = message.allowHtml ? sanitizeHtml(marked.parse(rawText) as string) : rawText;

    // Style CSS selon le type de message
    const textStyle = isStateMessage
        ? styles.chatBubbleTextState
        : styles.chatBubbleTextResponse;

    const renderText = (): ReactNode => {
        if (message.allowHtml) {
            return (
                <div
                    className={textStyle}
                    data-text={textToDisplay}
                    dangerouslySetInnerHTML={{ __html: textToDisplay }}
                />
            );
        }
        return (
            <div
                className={textStyle}
                data-text={textToDisplay}
            >
                {textToDisplay}
            </div>
        );
    };

    return (
        <div
            className={containerClass}
            onClick={isTyping ? skipAnimation : undefined}
            title={isTyping ? 'Cliquer pour afficher' : undefined}
            style={{ cursor: !isStateMessage && isTyping ? 'pointer' : 'default' }}
        >
            <div className={styles.chatBubbleTextContainer}>
                {renderText()}
                {isTyping && <span className={styles.chatBubbleCursor}></span>}
            </div>
            {!isTyping && message.actions && onActionClick && (
                <ChatbotActions actions={message.actions} onActionClick={onActionClick} />
            )}
        </div>
    );
}