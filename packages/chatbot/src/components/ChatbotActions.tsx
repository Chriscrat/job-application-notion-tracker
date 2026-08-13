import { type ReactNode } from 'react';
import type { ChatbotActionsProps } from '../types';
import { sanitizeHtml } from '../utils/sanitize';

import * as styles from './ChatbotActions.css';

export function ChatbotActions({ actions, onActionClick, disabled }: ChatbotActionsProps): ReactNode {
    const COMMAND_PREFIX = '/';
    const COMMAND_SEPARATOR = '-';
    function buildLabel(label: string): string {
        return COMMAND_PREFIX + label.toLocaleLowerCase().split(' ').join(COMMAND_SEPARATOR);
    }
    return (
        <div className={styles.actionsContainer}>
            {actions.map((action) => (
                <button
                    key={action.id}
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onActionClick(action)}
                    disabled={disabled}
                >
                    <span
                        className={styles.actionLabel}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(buildLabel(action.label)) }}
                    />
                </button>
            ))}
        </div>
    );
}
