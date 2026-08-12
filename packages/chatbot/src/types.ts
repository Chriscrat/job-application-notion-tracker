export type StateMachineAnimations =
    | 'yesClick'
    | 'noClick'
    | 'alertClick'
    | 'thinkClick'
    | 'jumpClick'
    | 'yesComplete'
    | 'noComplete'
    | 'alertComplete'
    | 'thinkingComplete'
    | 'jumpComplete';

export type ChatbotMessageType = 'state' | 'response';

export interface ChatbotMessage {
    text: string;
    type: ChatbotMessageType;
    duration?: number;
    animation?: StateMachineAnimations;
}

export interface ChatbotBubbleProps {
    message: ChatbotMessage | null;
    isExiting?: boolean;
}
