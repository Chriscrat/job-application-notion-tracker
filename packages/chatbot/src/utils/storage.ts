import type { ChatbotMessage } from '../types';

const MAX_MESSAGES = 50;

export interface StoredMessage {
    message: ChatbotMessage;
    timestamp: number;
}

function getKey(appId: string): string {
    return `@chriscrat/chatbot:${appId || 'default'}:messages`;
}

export function saveMessage(message: ChatbotMessage, appId: string): void {
    try {
        if (message.type !== 'response') return;
        const stored = getMessages(appId);
        stored.push({ message, timestamp: Date.now() });
        const limited = stored.slice(-MAX_MESSAGES);
        localStorage.setItem(getKey(appId), JSON.stringify(limited));
    } catch {
        // Ignore storage failures (private mode, quota)
    }
}

export function getMessages(appId: string): StoredMessage[] {
    try {
        const raw = localStorage.getItem(getKey(appId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function hasHistory(appId: string): boolean {
    return getMessages(appId).length > 0;
}

export function getLastMessage(appId: string): StoredMessage | null {
    const messages = getMessages(appId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
}

export function clearHistory(appId: string): void {
    try {
        localStorage.removeItem(getKey(appId));
    } catch {
        // Ignore storage failures
    }
}