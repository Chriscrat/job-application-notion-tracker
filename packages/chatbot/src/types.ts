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

// Types for form inputs
export type CommandInputType = 'text' | 'textarea' | 'url' | 'email';

export interface CommandInput {
    name: string;
    label: string;
    type: CommandInputType;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    maxLength?: number;
    validation?: (value: string) => string | null;
}

export interface ChatbotActionContext {
    showMessage: (message: ChatbotMessage) => void;
}

// Type for action/command
export interface ChatbotAction {
    id: string;
    label: string;              // Handled HTML : "<b>📝</b> Analyze"
    description?: string;       // Text below the button
    inputs?: CommandInput[];    // Form to display
    onExecute: (data: Record<string, any>, context: ChatbotActionContext) => Promise<void> | void;
}

export interface ChatbotMessage {
    text: string;
    type: ChatbotMessageType;
    duration?: number;
    animation?: StateMachineAnimations;
    actions?: ChatbotAction[];
    allowHtml?: boolean;              // Activate dangerouslySetInnerHTML
}

export interface ChatbotBubbleProps {
    message: ChatbotMessage | null;
    isExiting?: boolean;
    onActionClick?: (action: ChatbotAction) => void;
}

// Active form state
export interface ActiveForm {
    actionId: string;
    action: ChatbotAction;
}

export interface ChatbotActionsProps {
    actions: ChatbotAction[];
    onActionClick: (action: ChatbotAction) => void;
    disabled?: boolean;
}

export interface ChatbotFormProps {
    action: ChatbotAction;
    onSubmit: (data: Record<string, any>) => void;
    onCancel: () => void;
    isExiting?: boolean;
}

export interface ChatbotLoaderProps {
    message?: string;
    isExiting?: boolean;
}

// Props for the main component with controls
export interface ChatbotProps {
    commands?: ChatbotAction[];              // Availables commands
    onCommandExecute?: (commandId: string, data: Record<string, any>) => void;
    theme?: 'dark' | 'light';
    persistMessages?: boolean;               // LocalStorage on/off
    appId?: string;                          // Storage key suffix
}
