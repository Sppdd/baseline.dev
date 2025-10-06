/**
 * Chat Panel - Main chat interface webview
 */

import * as vscode from 'vscode';
import { ModelManager } from '../ai/ModelManager';
import { PromptBuilder } from '../ai/PromptBuilder';
import { FeatureDatabase } from '../baseline/FeatureDatabase';

export class ChatPanel {
    private panel: vscode.WebviewPanel | undefined;
    private messages: Array<{ role: string; content: string }> = [];
    private disposables: vscode.Disposable[] = [];
    private attachedFile: { path: string; content: string; language: string } | undefined;

    constructor(
        private context: vscode.ExtensionContext,
        private modelManager: ModelManager,
        private promptBuilder: PromptBuilder,
        private featureDb: FeatureDatabase
    ) {}

    /**
     * Show or focus the chat panel
     */
    async show(): Promise<void> {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        // Create webview panel
        this.panel = vscode.window.createWebviewPanel(
            'baselineChat',
            'Baseline.dev Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this.panel.iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'icon.png');
        this.panel.webview.html = this.getWebviewContent();

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this.handleUserMessage(message.text);
                        break;
                    case 'attachFile':
                        await this.attachCurrentFile();
                        break;
                    case 'clearAttachedFile':
                        this.clearAttachedFile();
                        break;
                    case 'saveAsNew':
                        await this.saveAsNewFile(message.content);
                        break;
                    case 'overwriteFile':
                        await this.overwriteAttachedFile(message.content);
                        break;
                }
            },
            undefined,
            this.disposables
        );

        // Handle panel disposal
        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
                this.disposables.forEach(d => d.dispose());
                this.disposables = [];
            },
            undefined,
            this.disposables
        );

        // Send welcome message
        this.sendWelcomeMessage();
    }

    /**
     * Send welcome message to user
     */
    private sendWelcomeMessage(): void {
        const welcomeMessage = `Welcome to **Baseline.dev**! 🎯

I'm your AI assistant specialized in web platform features and browser compatibility.

I can help you:
- Discover newly available web features
- Refactor code for modern browsers
- Check feature compatibility
- Replace outdated patterns
- Start projects with specific features

**Tips:**
- Select code before asking for it to be analyzed
- Ask about specific features: "Can I use Container Queries?"
- Request refactoring: "Modernize this CSS"
- Check compatibility: "Is View Transitions API baseline?"

How can I help you today?`;

        this.messages.push({ role: 'assistant', content: welcomeMessage });
        this.updateChat();
    }

    /**
     * Handle user message
     */
    private async handleUserMessage(userText: string): Promise<void> {
        if (!userText.trim()) {
            return;
        }

        // Add user message to history
        this.messages.push({ role: 'user', content: userText });
        this.updateChat();

        // Show loading state
        this.panel?.webview.postMessage({
            command: 'setLoading',
            loading: true
        });

        try {
            // Get current editor context
            const editor = vscode.window.activeTextEditor;
            const selection = editor?.selection;
            const code = selection && !selection.isEmpty 
                ? editor?.document.getText(selection)
                : undefined;
            const fileName = editor?.document.fileName;
            const languageId = editor?.document.languageId;

            // Get target browsers
            const config = vscode.workspace.getConfiguration('baselinedev');
            const targetBrowsers = config.get<string[]>('targetBrowsers');

            // Search for relevant features based on user query
            const relevantFeatures = this.featureDb.searchFeatures(userText).slice(0, 5);

            // Build context-rich prompt
            const prompt = await this.promptBuilder.buildUserPromptWithContext(userText, {
                code,
                fileName,
                languageId,
                relevantFeatures: relevantFeatures.length > 0 ? relevantFeatures : undefined,
                targetBrowsers
            });

            // Send to AI
            const response = await this.modelManager.sendMessage([
                { role: 'system', content: this.promptBuilder.buildSystemPrompt() },
                ...this.messages.slice(-10).map(m => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content
                })),
                { role: 'user', content: prompt }
            ]);

            // Add AI response
            this.messages.push({ role: 'assistant', content: response });
            this.updateChat();
        } catch (error: any) {
            const errorMessage = `❌ Error: ${error.message || 'Unknown error occurred'}`;
            this.messages.push({ role: 'assistant', content: errorMessage });
            this.updateChat();
            
            vscode.window.showErrorMessage(`Baseline.dev: ${error.message}`);
        } finally {
            // Hide loading state
            this.panel?.webview.postMessage({
                command: 'setLoading',
                loading: false
            });
        }
    }

    /**
     * Attach current file to context
     */
    private async attachCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showInformationMessage('No file is currently open');
            return;
        }

        const fileName = editor.document.fileName;
        const code = editor.document.getText();
        const languageId = editor.document.languageId;

        // Store attached file info
        this.attachedFile = {
            path: fileName,
            content: code,
            language: languageId
        };

        const attachmentMessage = `📎 Attached file: ${fileName}\n\n\`\`\`${languageId}\n${code.slice(0, 1000)}${code.length > 1000 ? '\n...(truncated)' : ''}\n\`\`\``;

        this.messages.push({ role: 'user', content: attachmentMessage });
        this.updateChat();

        // Notify webview about attached file
        this.panel?.webview.postMessage({
            command: 'fileAttached',
            fileName: fileName,
            hasFile: true
        });

        vscode.window.showInformationMessage(`Attached: ${fileName}`);
    }

    /**
     * Clear attached file
     */
    private clearAttachedFile(): void {
        this.attachedFile = undefined;
        
        // Notify webview
        this.panel?.webview.postMessage({
            command: 'fileCleared'
        });

        vscode.window.showInformationMessage('Attached file cleared');
    }

    /**
     * Save AI response as new file
     */
    private async saveAsNewFile(content: string): Promise<void> {
        try {
            // Extract code from content if it's in code blocks
            const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
            const codeContent = codeMatch ? codeMatch[1] : content;

            // Determine file extension
            let extension = 'txt';
            if (this.attachedFile) {
                const parts = this.attachedFile.path.split('.');
                extension = parts[parts.length - 1];
            }

            // Ask user for file name
            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter file name',
                value: `new-file.${extension}`,
                placeHolder: `filename.${extension}`
            });

            if (!fileName) {
                return;
            }

            // Get workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }

            // Create file path
            const filePath = vscode.Uri.joinPath(workspaceFolder.uri, fileName);

            // Write file
            await vscode.workspace.fs.writeFile(filePath, Buffer.from(codeContent, 'utf8'));

            // Open the new file
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);

            vscode.window.showInformationMessage(`✅ Created: ${fileName}`);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
        }
    }

    /**
     * Overwrite attached file with AI response
     */
    private async overwriteAttachedFile(content: string): Promise<void> {
        if (!this.attachedFile) {
            vscode.window.showErrorMessage('No file attached to overwrite');
            return;
        }

        try {
            // Extract code from content if it's in code blocks
            const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
            const codeContent = codeMatch ? codeMatch[1] : content;

            // Confirm overwrite
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to overwrite ${this.attachedFile.path}?`,
                { modal: true },
                'Yes, Overwrite'
            );

            if (confirm !== 'Yes, Overwrite') {
                return;
            }

            // Write file
            const filePath = vscode.Uri.file(this.attachedFile.path);
            await vscode.workspace.fs.writeFile(filePath, Buffer.from(codeContent, 'utf8'));

            // Reopen the file to show changes
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);

            vscode.window.showInformationMessage(`✅ Updated: ${this.attachedFile.path}`);

            // Update attached file content
            this.attachedFile.content = codeContent;
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to overwrite file: ${error.message}`);
        }
    }

    /**
     * Update chat display
     */
    private updateChat(): void {
        if (!this.panel) {
            return;
        }

        this.panel.webview.postMessage({
            command: 'updateChat',
            messages: this.messages
        });
    }

    /**
     * Get webview HTML content with teal/green theme and file editing
     */
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline.dev Chat</title>
    <style>
        :root {
            --baseline-teal: #16a085;
            --baseline-teal-hover: #138d75;
            --baseline-teal-light: rgba(22, 160, 133, 0.1);
            --baseline-green: #1abc9c;
            --baseline-green-hover: #17a589;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            scroll-behavior: smooth;
        }

        #attached-file-indicator {
            background: var(--baseline-teal-light);
            border: 1px solid var(--baseline-teal);
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 12px;
            display: none;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 0.9em;
            color: var(--baseline-teal);
        }

        #attached-file-indicator.visible {
            display: flex;
        }

        .attached-file-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .clear-attachment {
            background: none;
            border: none;
            color: var(--baseline-teal);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
            font-size: 1.1em;
        }

        .clear-attachment:hover {
            background: var(--baseline-teal);
            color: white;
            transform: scale(1.1);
        }

        .message {
            padding: 14px 18px;
            border-radius: 16px;
            max-width: 85%;
            word-wrap: break-word;
            line-height: 1.6;
            opacity: 0;
            transform: translateY(20px);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .message.user {
            background: var(--baseline-teal);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .message.assistant {
            background: var(--baseline-teal-light);
            border: 1px solid var(--baseline-teal);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .message pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 12px 0;
            border-left: 3px solid var(--baseline-green);
        }

        .message code {
            background: rgba(22, 160, 133, 0.15);
            padding: 3px 6px;
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
            color: var(--baseline-teal);
        }

        .message.user code {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .message pre code {
            background: none;
            padding: 0;
            color: var(--vscode-foreground);
        }

        .message strong {
            color: var(--baseline-green);
            font-weight: 600;
        }

        .message.user strong {
            color: white;
        }

        .message-actions {
            margin-top: 12px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .action-button {
            padding: 8px 14px;
            background: var(--baseline-teal);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: 500;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .action-button:hover {
            background: var(--baseline-teal-hover);
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(22, 160, 133, 0.3);
        }

        .action-button.secondary {
            background: var(--baseline-green);
        }

        .action-button.secondary:hover {
            background: var(--baseline-green-hover);
        }

        #input-container {
            border-top: 2px solid var(--baseline-teal);
            padding: 16px;
            background: var(--vscode-editor-background);
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
        }

        #input-box {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }

        #message-input {
            flex: 1;
            padding: 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 2px solid var(--baseline-teal);
            border-radius: 10px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            resize: vertical;
            min-height: 60px;
            transition: all 0.2s ease;
        }

        #message-input:focus {
            outline: none;
            border-color: var(--baseline-green);
            box-shadow: 0 0 0 3px var(--baseline-teal-light);
            transform: scale(1.01);
        }

        .button-group {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        button {
            padding: 10px 18px;
            background: var(--baseline-teal);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            transition: all 0.2s ease;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        button:hover:not(:disabled) {
            background: var(--baseline-teal-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(22, 160, 133, 0.4);
        }

        button:active:not(:disabled) {
            transform: translateY(0);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        button.secondary {
            background: var(--baseline-green);
        }

        button.secondary:hover:not(:disabled) {
            background: var(--baseline-green-hover);
            box-shadow: 0 4px 12px rgba(26, 188, 156, 0.4);
        }

        .loading {
            padding: 12px 20px;
            text-align: center;
            background: var(--baseline-teal-light);
            border: 1px solid var(--baseline-teal);
            border-radius: 16px;
            max-width: 150px;
            align-self: flex-start;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--baseline-teal);
        }

        .loading-dots {
            display: flex;
            gap: 4px;
        }

        .loading-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--baseline-teal);
            opacity: 0.4;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    
    <div id="input-container">
        <div id="attached-file-indicator">
            <div class="attached-file-info">
                <span>📎</span>
                <span id="attached-file-name">No file attached</span>
            </div>
            <button class="clear-attachment" onclick="clearAttachedFile()" title="Clear attached file">
                ✕
            </button>
        </div>
        <div id="input-box">
            <textarea id="message-input" placeholder="Ask about web features... (Cmd/Ctrl+Enter to send)" rows="3"></textarea>
        </div>
        <div class="button-group">
            <button id="send-btn" onclick="sendMessage()">
                <span>✨</span> Send
            </button>
            <button class="secondary" onclick="attachFile()">
                <span>📎</span> Attach File
            </button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"></script>
    <script>
        const vscode = acquireVsCodeApi();
        let isLoading = false;
        let messageCount = 0;
        let hasAttachedFile = false;
        let attachedFileName = '';
        let lastAssistantMessage = '';

        function sendMessage() {
            if (isLoading) return;
            
            const input = document.getElementById('message-input');
            const text = input.value.trim();
            
            if (text) {
                vscode.postMessage({ command: 'sendMessage', text });
                input.value = '';
                input.style.height = '60px';
            }
        }

        function attachFile() {
            vscode.postMessage({ command: 'attachFile' });
        }

        function clearAttachedFile() {
            vscode.postMessage({ command: 'clearAttachedFile' });
        }

        function saveAsNewFile(content) {
            vscode.postMessage({ command: 'saveAsNew', content });
        }

        function overwriteFile(content) {
            vscode.postMessage({ command: 'overwriteFile', content });
        }

        function extractCodeFromMessage(content) {
            // Try to extract code block
            const match = content.match(/\`\`\`[\\w]*\\n([\\s\\S]*?)\`\`\`/);
            return match ? match[0] : content;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatMessage(content) {
            // Simple markdown-like formatting
            let html = escapeHtml(content);
            
            // Bold
            html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
            
            // Code blocks
            html = html.replace(/\\\`\\\`\\\`([\\w]*)\\n([\\s\\S]*?)\\\`\\\`\\\`/g, 
                '<pre><code>$2</code></pre>');
            
            // Inline code
            html = html.replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>');
            
            // Line breaks
            html = html.replace(/\\n/g, '<br>');
            
            return html;
        }

        function animateNewMessage(element, isUser) {
            anime({
                targets: element,
                opacity: [0, 1],
                translateY: [30, 0],
                scale: [0.95, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        }

        function scrollToBottom(smooth = true) {
            const container = document.getElementById('chat-container');
            if (smooth) {
                anime({
                    targets: container,
                    scrollTop: container.scrollHeight,
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            } else {
                container.scrollTop = container.scrollHeight;
            }
        }

        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateChat') {
                const container = document.getElementById('chat-container');
                const previousCount = container.children.length;
                const newMessages = message.messages;
                
                // Clear and rebuild
                container.innerHTML = '';
                
                newMessages.forEach((m, index) => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message ' + m.role;
                    msgDiv.innerHTML = formatMessage(m.content);
                    
                    // Add action buttons to assistant messages with code
                    if (m.role === 'assistant' && m.content.includes('\`\`\`')) {
                        lastAssistantMessage = m.content;
                        const actionsDiv = document.createElement('div');
                        actionsDiv.className = 'message-actions';
                        
                        const saveBtn = document.createElement('button');
                        saveBtn.className = 'action-button';
                        saveBtn.innerHTML = '<span>💾</span> Save as New File';
                        saveBtn.onclick = () => saveAsNewFile(lastAssistantMessage);
                        
                        actionsDiv.appendChild(saveBtn);
                        
                        if (hasAttachedFile) {
                            const overwriteBtn = document.createElement('button');
                            overwriteBtn.className = 'action-button secondary';
                            overwriteBtn.innerHTML = '<span>✏️</span> Overwrite ' + attachedFileName.split('/').pop();
                            overwriteBtn.onclick = () => overwriteFile(lastAssistantMessage);
                            actionsDiv.appendChild(overwriteBtn);
                        }
                        
                        msgDiv.appendChild(actionsDiv);
                    }
                    
                    container.appendChild(msgDiv);
                    
                    // Animate only new messages
                    if (index >= previousCount - 1) {
                        setTimeout(() => {
                            animateNewMessage(msgDiv, m.role === 'user');
                        }, (index - (previousCount - 1)) * 100);
                    } else {
                        // Show existing messages immediately
                        msgDiv.style.opacity = '1';
                        msgDiv.style.transform = 'translateY(0)';
                    }
                });
                
                setTimeout(() => scrollToBottom(true), 100);
            } else if (message.command === 'fileAttached') {
                hasAttachedFile = message.hasFile;
                attachedFileName = message.fileName;
                const indicator = document.getElementById('attached-file-indicator');
                const nameSpan = document.getElementById('attached-file-name');
                nameSpan.textContent = message.fileName.split('/').pop();
                indicator.classList.add('visible');
                
                // Animate indicator
                anime({
                    targets: indicator,
                    scale: [0.9, 1],
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            } else if (message.command === 'fileCleared') {
                hasAttachedFile = false;
                attachedFileName = '';
                const indicator = document.getElementById('attached-file-indicator');
                
                // Animate out
                anime({
                    targets: indicator,
                    scale: [1, 0.9],
                    opacity: [1, 0],
                    duration: 200,
                    easing: 'easeInQuad',
                    complete: () => {
                        indicator.classList.remove('visible');
                    }
                });
            } else if (message.command === 'setLoading') {
                isLoading = message.loading;
                const sendBtn = document.getElementById('send-btn');
                sendBtn.disabled = isLoading;
                
                if (isLoading) {
                    const container = document.getElementById('chat-container');
                    const loadingDiv = document.createElement('div');
                    loadingDiv.className = 'loading';
                    loadingDiv.id = 'loading-indicator';
                    loadingDiv.innerHTML = '<span>Thinking</span><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
                    container.appendChild(loadingDiv);
                    
                    // Animate loading indicator
                    anime({
                        targets: loadingDiv,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                    
                    // Animate dots
                    anime({
                        targets: '.loading-dot',
                        opacity: [0.4, 1],
                        duration: 600,
                        loop: true,
                        direction: 'alternate',
                        easing: 'easeInOutSine',
                        delay: anime.stagger(150)
                    });
                    
                    scrollToBottom(true);
                } else {
                    const loadingDiv = document.getElementById('loading-indicator');
                    if (loadingDiv) {
                        anime({
                            targets: loadingDiv,
                            opacity: 0,
                            translateY: -20,
                            duration: 200,
                            easing: 'easeInQuad',
                            complete: () => loadingDiv.remove()
                        });
                    }
                }
            }
        });

        // Keyboard shortcuts
        document.getElementById('message-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-resize textarea with animation
        document.getElementById('message-input').addEventListener('input', (e) => {
            const newHeight = Math.min(e.target.scrollHeight, 200);
            anime({
                targets: e.target,
                height: newHeight + 'px',
                duration: 150,
                easing: 'easeOutQuad'
            });
        });

        // Pulse send button when input has text
        document.getElementById('message-input').addEventListener('input', (e) => {
            const sendBtn = document.getElementById('send-btn');
            if (e.target.value.trim() && !isLoading) {
                anime({
                    targets: sendBtn,
                    scale: [1, 1.05, 1],
                    duration: 400,
                    easing: 'easeInOutQuad'
                });
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        if (this.panel) {
            this.panel.dispose();
        }
        this.disposables.forEach(d => d.dispose());
    }
}

