/**
 * Discover Features Command - Analyzes project and suggests newly available features
 */

import * as vscode from 'vscode';
import { FeatureDatabase } from '../baseline/FeatureDatabase';
import { ModelManager } from '../ai/ModelManager';
import { PromptBuilder } from '../ai/PromptBuilder';

export async function discoverFeaturesCommand(
    featureDb: FeatureDatabase,
    modelManager: ModelManager,
    promptBuilder: PromptBuilder
): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open. Please open a project first.');
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Baseline.dev: Discovering new web features...',
            cancellable: false
        },
        async (progress) => {
            try {
                progress.report({ increment: 10, message: 'Analyzing project...' });

                // Analyze project structure
                const hasPackageJson = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 1)
                    .then(files => files.length > 0);
                
                const hasHtml = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**', 1)
                    .then(files => files.length > 0);
                
                const hasCss = await vscode.workspace.findFiles('**/*.css', '**/node_modules/**', 1)
                    .then(files => files.length > 0);
                
                const hasJavaScript = await vscode.workspace.findFiles('**/*.{js,jsx}', '**/node_modules/**', 1)
                    .then(files => files.length > 0);
                
                const hasTypeScript = await vscode.workspace.findFiles('**/*.{ts,tsx}', '**/node_modules/**', 1)
                    .then(files => files.length > 0);

                const projectContext = {
                    hasPackageJson,
                    hasHtml,
                    hasCss,
                    hasJavaScript,
                    hasTypeScript
                };

                progress.report({ increment: 20, message: 'Querying Baseline features...' });

                // Get newly available features (last 12 months)
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                
                const config = vscode.workspace.getConfiguration('baselinedev');
                const threshold = config.get<'high' | 'low'>('baselineThreshold', 'high');
                
                const newFeatures = featureDb.getNewlyAvailable(oneYearAgo, threshold);

                if (newFeatures.length === 0) {
                    vscode.window.showInformationMessage('No new Baseline features found in the last 12 months.');
                    return;
                }

                progress.report({ increment: 30, message: 'Generating report with AI...' });

                // Build AI prompt
                const prompt = await promptBuilder.buildDiscoveryPrompt(projectContext, newFeatures);

                // Get AI response
                const response = await modelManager.sendMessage([
                    { role: 'system', content: promptBuilder.buildSystemPrompt() },
                    { role: 'user', content: prompt }
                ]);

                progress.report({ increment: 40, message: 'Preparing report...' });

                // Create report document
                const reportContent = `# Baseline.dev: New Features Discovery Report

Generated: ${new Date().toLocaleString()}
Baseline Threshold: ${threshold}

---

${response}

---

## All Recently Available Features (Last 12 Months)

${newFeatures.slice(0, 20).map(f => {
    const date = f.status?.baseline_high_date || f.status?.baseline_low_date;
    return `- **${f.name}** (\`${f.id}\`) - Available since ${date}`;
}).join('\n')}

${newFeatures.length > 20 ? `\n*...and ${newFeatures.length - 20} more features*` : ''}

---

**Need more details?** Use the Baseline.dev chat to ask specific questions about any feature.
`;

                // Show report in new document
                const doc = await vscode.workspace.openTextDocument({
                    content: reportContent,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);

                vscode.window.showInformationMessage('✅ Feature discovery complete! Check the report.');
            } catch (error: any) {
                console.error('[Baseline.dev] Error in discover features:', error);
                vscode.window.showErrorMessage(`Failed to discover features: ${error.message}`);
            }
        }
    );
}

