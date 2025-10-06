/**
 * Configure Command - Helps user configure the extension
 */

import * as vscode from 'vscode';
import { ModelManager } from '../ai/ModelManager';
import { ClaudeProvider } from '../ai/providers/ClaudeProvider';
import { GeminiProvider } from '../ai/providers/GeminiProvider';

export async function configureCommand(
    context: vscode.ExtensionContext,
    modelManager: ModelManager
): Promise<void> {
    // Show configuration options
    const option = await vscode.window.showQuickPick(
        [
            {
                label: '$(key) Configure API Keys',
                description: 'Set up Claude or Gemini API keys',
                action: 'api-keys'
            },
            {
                label: '$(gear) Select AI Model',
                description: 'Choose between Claude, Gemini, or Ollama',
                action: 'select-model'
            },
            {
                label: '$(debug-disconnect) Test Connection',
                description: 'Test connection to current AI model',
                action: 'test-connection'
            },
            {
                label: '$(settings) Open Settings',
                description: 'Open Baseline.dev settings',
                action: 'open-settings'
            }
        ],
        {
            title: 'Baseline.dev Configuration',
            placeHolder: 'What would you like to configure?'
        }
    );

    if (!option) {
        return;
    }

    switch (option.action) {
        case 'api-keys':
            await configureApiKeys(context, modelManager);
            break;
        case 'select-model':
            await selectModel();
            break;
        case 'test-connection':
            await testConnection(modelManager);
            break;
        case 'open-settings':
            await vscode.commands.executeCommand('workbench.action.openSettings', 'baselinedev');
            break;
    }
}

/**
 * Configure API keys
 */
async function configureApiKeys(
    context: vscode.ExtensionContext,
    modelManager: ModelManager
): Promise<void> {
    const modelType = await vscode.window.showQuickPick(
        [
            { label: 'Claude', value: 'claude' },
            { label: 'Gemini', value: 'gemini' },
            { label: 'Ollama (no API key needed)', value: 'ollama' }
        ],
        {
            title: 'Select AI Provider',
            placeHolder: 'Which API key do you want to configure?'
        }
    );

    if (!modelType) {
        return;
    }

    if (modelType.value === 'ollama') {
        vscode.window.showInformationMessage('Ollama uses local models and does not require an API key. Configure the endpoint in settings if needed.');
        return;
    }

    const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your ${modelType.label} API key`,
        password: true,
        placeHolder: 'API key',
        validateInput: (value) => {
            return value.trim().length > 0 ? null : 'API key cannot be empty';
        }
    });

    if (!apiKey) {
        return;
    }

    try {
        // Store API key
        if (modelType.value === 'claude') {
            await ClaudeProvider.setApiKey(context, apiKey);
        } else if (modelType.value === 'gemini') {
            await GeminiProvider.setApiKey(context, apiKey);
        }

        modelManager.resetProvider(); // Force reload on next use

        vscode.window.showInformationMessage(`✅ ${modelType.label} API key saved securely!`);

        // Ask if user wants to test
        const test = await vscode.window.showInformationMessage(
            'Would you like to test the connection?',
            'Yes',
            'No'
        );

        if (test === 'Yes') {
            // Switch to this model first
            const config = vscode.workspace.getConfiguration('baselinedev');
            await config.update('model', modelType.value, vscode.ConfigurationTarget.Global);
            
            await testConnection(modelManager);
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to save API key: ${error.message}`);
    }
}

/**
 * Select AI model
 */
async function selectModel(): Promise<void> {
    const config = vscode.workspace.getConfiguration('baselinedev');
    const currentModel = config.get<string>('model', 'claude');

    const model = await vscode.window.showQuickPick(
        [
            {
                label: '$(sparkle) Claude',
                description: currentModel === 'claude' ? '(Current)' : 'Anthropic AI',
                value: 'claude'
            },
            {
                label: '$(sparkle) Gemini',
                description: currentModel === 'gemini' ? '(Current)' : 'Google AI',
                value: 'gemini'
            },
            {
                label: '$(server) Ollama',
                description: currentModel === 'ollama' ? '(Current)' : 'Local models',
                value: 'ollama'
            }
        ],
        {
            title: 'Select AI Model',
            placeHolder: 'Choose your AI provider'
        }
    );

    if (!model || model.value === currentModel) {
        return;
    }

    await config.update('model', model.value, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`✅ Switched to ${model.label}`);
}

/**
 * Test connection to current AI model
 */
async function testConnection(modelManager: ModelManager): Promise<void> {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Testing connection...',
            cancellable: false
        },
        async () => {
            try {
                const success = await modelManager.testConnection();

                if (success) {
                    const modelType = modelManager.getCurrentModelType();
                    vscode.window.showInformationMessage(`✅ Connected to ${modelType} successfully!`);
                } else {
                    vscode.window.showErrorMessage('❌ Connection test failed. Check your configuration.');
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`❌ Connection failed: ${error.message}`);
            }
        }
    );
}

