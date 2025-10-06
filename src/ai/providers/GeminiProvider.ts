/**
 * Gemini AI Provider - Google Generative AI integration
 */

import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, ChatMessage } from '../types';

export class GeminiProvider implements AIProvider {
    private client: GoogleGenerativeAI | null = null;

    constructor(private context: vscode.ExtensionContext) {}

    private async getClient(): Promise<GoogleGenerativeAI> {
        if (this.client) {
            return this.client;
        }

        // Get API key from secrets storage
        const apiKey = await this.context.secrets.get('baselinedev.geminiKey');
        
        if (!apiKey) {
            throw new Error('Gemini API key not configured. Please run "Baseline.dev: Configure" command.');
        }

        this.client = new GoogleGenerativeAI(apiKey);
        return this.client;
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        const client = await this.getClient();
        const config = vscode.workspace.getConfiguration('baselinedev');
        const configuredModel = config.get<string>('geminiModel', 'gemini-2.5-flash');

        // Model fallback order (try configured one first)
        const candidateModels = [
            configuredModel,
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro' // legacy fallback
        ];

        // Prepare conversation pieces once
        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        // Build conversation history (all messages except the last one)
        const buildHistory = (): any[] => {
            const history: any[] = [];
            for (let i = 0; i < chatMessages.length - 1; i++) {
                const msg = chatMessages[i];
                history.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            }
            // Ensure history starts with 'user' role (Gemini requirement)
            if (history.length > 0 && history[0].role !== 'user') {
                history.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
                history.splice(1, 0, { role: 'model', parts: [{ text: 'Hello! How can I help you with web features today?' }] });
            }
            return history;
        };

        // Last message is the current prompt
        const lastMessage = chatMessages[chatMessages.length - 1];
        let prompt = lastMessage?.content || '';

        // Try each candidate model until one succeeds
        let lastError: any = null;
        for (const modelName of candidateModels) {
            try {
                const model = client.getGenerativeModel({
                    model: modelName,
                    // Prefer systemInstruction rather than prepending to prompt
                    ...(systemMessage ? { systemInstruction: systemMessage.content } : {})
                } as any);

                const chat = model.startChat({ history: buildHistory() });
                const result = await chat.sendMessage(prompt);
                const response = await result.response;
                return response.text();
            } catch (error: any) {
                lastError = error;
                const is404 =
                    error?.message?.includes('404') ||
                    error?.message?.includes('not found') ||
                    error?.message?.includes('is not found for API version');
                if (!is404) {
                    // Non-404 errors should not trigger fallback; rethrow with friendly message
                    if (error.message?.includes('API_KEY_INVALID')) {
                        throw new Error('Invalid Gemini API key. Please reconfigure.');
                    } else if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
                        throw new Error('Gemini API rate limit exceeded. Please try again later.');
                    } else {
                        throw new Error(`Gemini API error (${modelName}): ${error.message || 'Unknown error'}`);
                    }
                }
                // If 404, continue to next model
                console.warn(`[Baseline.dev] Gemini model not available: ${modelName}. Trying next.`);
                continue;
            }
        }

        // If all models failed
        console.error('[Baseline.dev] Gemini fallback failed for all models:', lastError);
        throw new Error('Gemini API error: No compatible model available for your API key/region. Try changing Settings → Baseline.dev → Gemini Model, or use Claude/Ollama.');
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.sendMessage([
                { role: 'user', content: 'Reply with just "OK"' }
            ]);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Store API key in secure storage
     */
    static async setApiKey(context: vscode.ExtensionContext, apiKey: string): Promise<void> {
        await context.secrets.store('baselinedev.geminiKey', apiKey);
    }
}

