export { Chatbot } from './components/Chatbot';
export { ChatbotBubble } from './components/ChatbotBubble';
export { useMessageQueue } from './hooks/useMessageQueue'; // ✅ NOUVEAU
export { default as useTypewriter } from './hooks/useTypewriter';

// Types
export type { 
    ChatbotMessage, 
    ChatbotMessageType,
    ChatbotBubbleProps,
    StateMachineAnimations
} from './types';
