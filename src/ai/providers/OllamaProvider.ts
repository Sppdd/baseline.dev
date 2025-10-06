/**
 * Ollama AI Provider - Local model integration
 */

import * as vscode from 'vscode';
import axios from 'axios';
import { AIProvider, ChatMessage } from '../types';

export class OllamaProvider implements AIProvider {
    constructor(private context: vscode.ExtensionContext) {}

    private getEndpoint(): string {
        const config = vscode.workspace.getConfiguration('baselinedev');
        return config.get<string>('ollamaEndpoint', 'http://localhost:11434');
    }

    private getModelName(): string {
        const config = vscode.workspace.getConfiguration('baselinedev');
        return config.get<string>('ollamaModel', 'codellama');
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        try {
            const endpoint = this.getEndpoint();
            const modelName = this.getModelName();

            // Build prompt from messages
            let prompt = '';
            
            for (const msg of messages) {
                if (msg.role === 'system') {
                    prompt += `System: ${msg.content}\n\n`;
                } else if (msg.role === 'user') {
                    prompt += `User: ${msg.content}\n\n`;
                } else if (msg.role === 'assistant') {
                    prompt += `Assistant: ${msg.content}\n\n`;
                }
            }

            prompt += 'Assistant:';

            // Call Ollama API
            const response = await axios.post(
                `${endpoint}/api/generate`,
                {
                    model: modelName,
                    prompt: prompt,
                    stream: false
                },
                {
                    timeout: 60000, // 60 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.response) {
                return response.data.response;
            }

            return 'No response from Ollama';
        } catch (error: any) {
            console.error('[Baseline.dev] Ollama error:', error);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to Ollama. Is Ollama running? Check endpoint configuration.');
            } else if (error.response?.status === 404) {
                throw new Error(`Model "${this.getModelName()}" not found. Pull the model first: ollama pull ${this.getModelName()}`);
            } else {
                throw new Error(`Ollama error: ${error.message || 'Unknown error'}`);
            }
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            const endpoint = this.getEndpoint();
            
            // Test if Ollama is running
            const response = await axios.get(`${endpoint}/api/tags`, {
                timeout: 5000
            });

            if (response.status === 200) {
                // Check if the configured model is available
                const modelName = this.getModelName();
                const models = response.data.models || [];
                const hasModel = models.some((m: any) => m.name.includes(modelName));
                
                if (!hasModel) {
                    vscode.window.showWarningMessage(
                        `Ollama model "${modelName}" not found. You may need to run: ollama pull ${modelName}`
                    );
                }
                
                return true;
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * List available models
     */
    async listModels(): Promise<string[]> {
        try {
            const endpoint = this.getEndpoint();
            const response = await axios.get(`${endpoint}/api/tags`);
            
            if (response.data && response.data.models) {
                return response.data.models.map((m: any) => m.name);
            }

            return [];
        } catch (error) {
            console.error('[Baseline.dev] Error listing Ollama models:', error);
            return [];
        }
    }
}

