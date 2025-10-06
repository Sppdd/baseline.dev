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
                    case 'clearChat':
                        this.messages = [];
                        this.updateChat();
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

        const attachmentMessage = `📎 Attached file: ${fileName}\n\n\`\`\`${languageId}\n${code.slice(0, 1000)}${code.length > 1000 ? '\n...(truncated)' : ''}\n\`\`\``;

        this.messages.push({ role: 'user', content: attachmentMessage });
        this.updateChat();

        vscode.window.showInformationMessage(`Attached: ${fileName}`);
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
     * Get webview HTML content
     */
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline.dev Chat</title>
    <style>
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
        }

        .message {
            padding: 12px 16px;
            border-radius: 8px;
            max-width: 85%;
            word-wrap: break-word;
            line-height: 1.5;
        }

        .message.user {
            background: var(--vscode-input-background);
            align-self: flex-end;
            border: 1px solid var(--vscode-input-border);
        }

        .message.assistant {
            background: var(--vscode-editor-selectionBackground);
            align-self: flex-start;
        }

        .message pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;
        }

        .message code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }

        .message pre code {
            background: none;
            padding: 0;
        }

        #input-container {
            border-top: 1px solid var(--vscode-panel-border);
            padding: 16px;
            background: var(--vscode-editor-background);
        }

        #input-box {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
        }

        #message-input {
            flex: 1;
            padding: 10px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            resize: vertical;
            min-height: 60px;
        }

        #message-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .button-group {
            display: flex;
            gap: 8px;
        }

        button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            transition: background 0.2s;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }

        .loading {
            padding: 12px;
            text-align: center;
            color: var(--vscode-descriptionForeground);
        }

        .loading::after {
            content: '...';
            animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    
    <div id="input-container">
        <div id="input-box">
            <textarea id="message-input" placeholder="Ask about web features..." rows="3"></textarea>
        </div>
        <div class="button-group">
            <button id="send-btn" onclick="sendMessage()">Send</button>
            <button class="secondary" onclick="attachFile()">📎 Attach File</button>
            <button class="secondary" onclick="clearChat()">🗑️ Clear</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let isLoading = false;

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

        function clearChat() {
            if (confirm('Clear all messages?')) {
                vscode.postMessage({ command: 'clearChat' });
            }
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
            html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Code blocks
            html = html.replace(/\`\`\`([\\w]*)[\\n]([\\s\\S]*?)\`\`\`/g, 
                '<pre><code>$2</code></pre>');
            
            // Inline code
            html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
            
            // Line breaks
            html = html.replace(/\\n/g, '<br>');
            
            return html;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateChat') {
                const container = document.getElementById('chat-container');
                container.innerHTML = message.messages
                    .map(m => \`<div class="message \${m.role}">\${formatMessage(m.content)}</div>\`)
                    .join('');
                container.scrollTop = container.scrollHeight;
            } else if (message.command === 'setLoading') {
                isLoading = message.loading;
                const sendBtn = document.getElementById('send-btn');
                sendBtn.disabled = isLoading;
                
                if (isLoading) {
                    const container = document.getElementById('chat-container');
                    const loadingDiv = document.createElement('div');
                    loadingDiv.className = 'loading';
                    loadingDiv.id = 'loading-indicator';
                    loadingDiv.textContent = 'Thinking';
                    container.appendChild(loadingDiv);
                    container.scrollTop = container.scrollHeight;
                } else {
                    const loadingDiv = document.getElementById('loading-indicator');
                    if (loadingDiv) {
                        loadingDiv.remove();
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

        // Auto-resize textarea
        document.getElementById('message-input').addEventListener('input', (e) => {
            e.target.style.height = '60px';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
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

