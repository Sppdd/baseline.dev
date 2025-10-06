/**
 * AI Provider interfaces and types
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIProvider {
    sendMessage(messages: ChatMessage[]): Promise<string>;
    testConnection(): Promise<boolean>;
}

export interface AIConfig {
    model: 'claude' | 'gemini' | 'ollama';
    apiKey?: string;
    endpoint?: string;
    modelName?: string;
}

