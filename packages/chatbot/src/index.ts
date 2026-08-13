export { Chatbot } from './components/Chatbot';
export { ChatbotBubble } from './components/ChatbotBubble';
export { ChatbotActions } from './components/ChatbotActions';
export { ChatbotForm } from './components/ChatbotForm';
export { ChatbotLoader } from './components/ChatbotLoader';
export { useMessageQueue } from './hooks/useMessageQueue';
export { default as useTypewriter } from './hooks/useTypewriter';
export { sanitizeHtml } from './utils/sanitize';
export { saveMessage, getMessages, hasHistory, getLastMessage, clearHistory } from './utils/storage';

// Types
export type {
    ChatbotMessage,
    ChatbotMessageType,
    ChatbotBubbleProps,
    ChatbotAction,
    ChatbotActionsProps,
    ChatbotFormProps,
    ChatbotLoaderProps,
    ChatbotProps,
    ActiveForm,
    CommandInput,
    CommandInputType,
    StateMachineAnimations
} from './types';