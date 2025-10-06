/**
 * Claude AI Provider - Anthropic API integration
 */

import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, ChatMessage } from '../types';

export class ClaudeProvider implements AIProvider {
    private client: Anthropic | null = null;

    constructor(private context: vscode.ExtensionContext) {}

    private async getClient(): Promise<Anthropic> {
        if (this.client) {
            return this.client;
        }

        // Get API key from secrets storage
        const apiKey = await this.context.secrets.get('baselinedev.claudeKey');
        
        if (!apiKey) {
            throw new Error('Claude API key not configured. Please run "Baseline.dev: Configure" command.');
        }

        this.client = new Anthropic({
            apiKey: apiKey
        });

        return this.client;
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        try {
            const client = await this.getClient();
            const config = vscode.workspace.getConfiguration('baselinedev');
            const modelName = config.get<string>('claudeModel', 'claude-3-5-sonnet-20241022');

            // Separate system message from other messages
            const systemMessage = messages.find(m => m.role === 'system');
            const chatMessages = messages.filter(m => m.role !== 'system');

            // Convert to Claude format
            const claudeMessages = chatMessages.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
            }));

            const response = await client.messages.create({
                model: modelName,
                max_tokens: 4096,
                system: systemMessage?.content,
                messages: claudeMessages
            });

            // Extract text from response
            const textContent = response.content.find(block => block.type === 'text');
            if (textContent && 'text' in textContent) {
                return textContent.text;
            }

            return 'No response from Claude';
        } catch (error: any) {
            console.error('[Baseline.dev] Claude API error:', error);
            
            if (error.status === 401) {
                throw new Error('Invalid Claude API key. Please reconfigure.');
            } else if (error.status === 429) {
                throw new Error('Claude API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Claude API error: ${error.message || 'Unknown error'}`);
            }
        }
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
        await context.secrets.store('baselinedev.claudeKey', apiKey);
    }
}

