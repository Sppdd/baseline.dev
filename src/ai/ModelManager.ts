/**
 * Model Manager - Manages AI model selection and communication
 */

import * as vscode from 'vscode';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { AIProvider, ChatMessage } from './types';

export class ModelManager {
    private currentProvider: AIProvider | null = null;
    private currentModelType: string | null = null;

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Get the currently configured AI provider
     */
    async getCurrentProvider(): Promise<AIProvider> {
        const config = vscode.workspace.getConfiguration('baselinedev');
        const modelType = config.get<string>('model', 'claude');

        // Reuse provider if same model type
        if (this.currentProvider && this.currentModelType === modelType) {
            return this.currentProvider;
        }

        // Create new provider
        switch (modelType) {
            case 'claude':
                this.currentProvider = new ClaudeProvider(this.context);
                break;
            case 'gemini':
                this.currentProvider = new GeminiProvider(this.context);
                break;
            case 'ollama':
                this.currentProvider = new OllamaProvider(this.context);
                break;
            default:
                throw new Error(`Unknown model type: ${modelType}`);
        }

        this.currentModelType = modelType;
        return this.currentProvider;
    }

    /**
     * Send a message to the current AI model
     */
    async sendMessage(messages: ChatMessage[]): Promise<string> {
        try {
            const provider = await this.getCurrentProvider();
            return await provider.sendMessage(messages);
        } catch (error: any) {
            console.error('[Baseline.dev] Error sending message:', error);
            throw error;
        }
    }

    /**
     * Test connection to the current AI model
     */
    async testConnection(): Promise<boolean> {
        try {
            const provider = await this.getCurrentProvider();
            return await provider.testConnection();
        } catch (error) {
            console.error('[Baseline.dev] Connection test failed:', error);
            return false;
        }
    }

    /**
     * Get the current model type
     */
    getCurrentModelType(): string {
        const config = vscode.workspace.getConfiguration('baselinedev');
        return config.get<string>('model', 'claude');
    }

    /**
     * Reset the provider (force recreation on next use)
     */
    resetProvider(): void {
        this.currentProvider = null;
        this.currentModelType = null;
    }
}

