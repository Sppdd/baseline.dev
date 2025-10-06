/**
 * Refactor Modern Command - Suggests modern alternatives for selected code
 */

import * as vscode from 'vscode';
import { ModelManager } from '../ai/ModelManager';
import { PromptBuilder } from '../ai/PromptBuilder';

export async function refactorModernCommand(
    modelManager: ModelManager,
    promptBuilder: PromptBuilder
): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor. Please open a file first.');
        return;
    }

    // Get selected code or entire document
    const selection = editor.selection;
    const code = selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(selection);

    if (!code.trim()) {
        vscode.window.showErrorMessage('No code to refactor.');
        return;
    }

    const fileName = editor.document.fileName;
    const languageId = editor.document.languageId;

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Baseline.dev: Analyzing code...',
            cancellable: false
        },
        async (progress) => {
            try {
                progress.report({ increment: 30, message: 'Checking Baseline features...' });

                // Build refactor prompt
                const prompt = promptBuilder.buildRefactorPrompt(code, fileName, languageId);

                progress.report({ increment: 30, message: 'Generating suggestions...' });

                // Get AI response
                const response = await modelManager.sendMessage([
                    { role: 'system', content: promptBuilder.buildSystemPrompt() },
                    { role: 'user', content: prompt }
                ]);

                progress.report({ increment: 40, message: 'Preparing suggestions...' });

                // Create suggestions document
                const suggestionsContent = `# Baseline.dev: Modernization Suggestions

**File:** ${fileName}
**Language:** ${languageId}
**Generated:** ${new Date().toLocaleString()}

---

## Original Code

\`\`\`${languageId}
${code}
\`\`\`

---

## Suggestions

${response}

---

**How to apply:**
1. Review each suggestion carefully
2. Test the changes in your development environment
3. Check browser compatibility for your target audience
4. Use the Baseline.dev chat for follow-up questions
`;

                // Show suggestions in new document
                const doc = await vscode.workspace.openTextDocument({
                    content: suggestionsContent,
                    language: 'markdown'
                });

                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);

                vscode.window.showInformationMessage('✅ Refactoring suggestions ready! Review the document.');
            } catch (error: any) {
                console.error('[Baseline.dev] Error in refactor:', error);
                vscode.window.showErrorMessage(`Failed to generate suggestions: ${error.message}`);
            }
        }
    );
}

