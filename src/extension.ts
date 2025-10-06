/**
 * Baseline.dev VS Code Extension
 * Main entry point
 */

import * as vscode from 'vscode';
import { FeatureDatabase } from './baseline/FeatureDatabase';
import { ModelManager } from './ai/ModelManager';
import { PromptBuilder } from './ai/PromptBuilder';
import { ChatPanel } from './ui/ChatPanel';

// Command imports
import { openChatCommand } from './commands/openChat';
import { discoverFeaturesCommand } from './commands/discoverFeatures';
import { refactorModernCommand } from './commands/refactorModern';
import { checkFeatureCommand } from './commands/checkFeature';
import { configureCommand } from './commands/configure';
import { refreshDataCommand } from './commands/refreshData';

let featureDb: FeatureDatabase;
let modelManager: ModelManager;
let promptBuilder: PromptBuilder;
let chatPanel: ChatPanel;
let statusBarItem: vscode.StatusBarItem;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('[Baseline.dev] Extension activating...');

    try {
        // Show activation message
        vscode.window.showInformationMessage('Baseline.dev is loading...');

        // Initialize Feature Database
        featureDb = new FeatureDatabase();
        
        // Check if real-time data is enabled
        const config = vscode.workspace.getConfiguration('baselinedev');
        const useRealTimeData = config.get<boolean>('useRealTimeData', true);
        
        await featureDb.initialize(useRealTimeData);
        
        // Show real-time status
        if (featureDb.isUsingRealTimeData()) {
            console.log('[Baseline.dev] ✅ Using REAL-TIME Baseline data');
        } else {
            console.log('[Baseline.dev] Using LOCAL Baseline data');
        }

        // Initialize AI components
        modelManager = new ModelManager(context);
        promptBuilder = new PromptBuilder(featureDb);

        // Initialize UI components
        chatPanel = new ChatPanel(context, modelManager, promptBuilder, featureDb);

        // Create status bar item
        statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        const showStatusBar = config.get<boolean>('showStatusBar', true);
        
        if (showStatusBar) {
            statusBarItem.text = '$(rocket) Baseline.dev';
            statusBarItem.tooltip = 'Open Baseline.dev Chat';
            statusBarItem.command = 'baselinedev.openChat';
            statusBarItem.show();
            context.subscriptions.push(statusBarItem);
        }

        // Register commands
        registerCommands(context);

        // Listen for configuration changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('baselinedev.model')) {
                    modelManager.resetProvider();
                    console.log('[Baseline.dev] AI model configuration changed');
                }
                
                if (e.affectsConfiguration('baselinedev.showStatusBar')) {
                    const showBar = vscode.workspace.getConfiguration('baselinedev')
                        .get<boolean>('showStatusBar', true);
                    
                    if (showBar) {
                        statusBarItem.show();
                    } else {
                        statusBarItem.hide();
                    }
                }
            })
        );

        console.log('[Baseline.dev] Extension activated successfully!');
        console.log(`[Baseline.dev] Loaded ${featureDb.getFeatureCount()} web features`);

        vscode.window.showInformationMessage('✅ Baseline.dev is ready!');
    } catch (error: any) {
        console.error('[Baseline.dev] Activation failed:', error);
        vscode.window.showErrorMessage(`Failed to activate Baseline.dev: ${error.message}`);
    }
}

/**
 * Register all commands
 */
function registerCommands(context: vscode.ExtensionContext) {
    // Open Chat
    context.subscriptions.push(
        vscode.commands.registerCommand('baselinedev.openChat', async () => {
            try {
                await openChatCommand(chatPanel);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to open chat: ${error.message}`);
            }
        })
    );

    // Discover Features
    context.subscriptions.push(
        vscode.commands.registerCommand('baselinedev.discoverFeatures', async () => {
            try {
                await discoverFeaturesCommand(featureDb, modelManager, promptBuilder);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to discover features: ${error.message}`);
            }
        })
    );

    // Refactor for Modern Browsers
    context.subscriptions.push(
        vscode.commands.registerCommand('baselinedev.refactorModern', async () => {
            try {
                await refactorModernCommand(modelManager, promptBuilder);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to refactor: ${error.message}`);
            }
        })
    );

    // Check Feature Status
    context.subscriptions.push(
        vscode.commands.registerCommand('baselinedev.checkFeature', async () => {
            try {
                await checkFeatureCommand(featureDb);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to check feature: ${error.message}`);
            }
        })
    );

    // Configure
    context.subscriptions.push(
        vscode.commands.registerCommand('baselinedev.configure', async () => {
            try {
                await configureCommand(context, modelManager);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to configure: ${error.message}`);
            }
        })
    );

    // Refresh Data
    context.subscriptions.push(
        vscode.commands.registerCommand('baselinedev.refreshData', async () => {
            try {
                await refreshDataCommand(featureDb);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to refresh data: ${error.message}`);
            }
        })
    );

    console.log('[Baseline.dev] Commands registered');
}

/**
 * Extension deactivation
 */
export function deactivate() {
    console.log('[Baseline.dev] Extension deactivating...');

    if (chatPanel) {
        chatPanel.dispose();
    }

    if (statusBarItem) {
        statusBarItem.dispose();
    }

    console.log('[Baseline.dev] Extension deactivated');
}

