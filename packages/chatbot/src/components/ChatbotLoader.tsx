import { type ReactNode } from 'react';
import type { ChatbotLoaderProps } from '../types';

import * as styles from './ChatbotLoader.css';

export function ChatbotLoader({ message, isExiting }: ChatbotLoaderProps): ReactNode {
    const containerClass = isExiting
        ? `${styles.loaderContainer} ${styles.fadeOutAnimation}`
        : styles.loaderContainer;

    return (
        <div className={containerClass}>
            <div className={styles.spinner} />
            <p className={styles.loaderMessage}>{message || 'Traitement en cours...'}</p>
        </div>
    );
}