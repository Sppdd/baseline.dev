
## Project Context

You are building a **VS Code extension** called baseline.dev that serves as an AI code assistant specifically designed for web developers. This extension helps developers:
- Discover and adopt newly available web platform features or widly avalible.
- Refactor code for modern browsers
- Check browser compatibility in real-time
- Replace outdated patterns with modern alternatives or expermenting with new limited features patterens, or specific version and type of a browser.
- And much more only related to web features developement.
- start complete project with selected features or ID of a feature. 

**The Key Innovation:** Integration with the **web-features** npm package and Baseline API, which provides authoritative data about web feature availability, browser support, and timeline information and **AI models** which could boost the adoptions with ease.

---

## Unique Selling Proposition (USP)

**"The only AI code assistant that understands the web platform timeline"**

This extension differentiates itself from Cursor, Copilot, and other AI assistants by:

1. **Baseline Intelligence**: Uses official web-features data to understand when features became "Baseline" (widely available)
2. **Browser-Focused**: Specializes in browser compatibility and modernization, not general coding
3. **Timeline Awareness**: Knows what's newly available, what's experimental, and what's deprecated
4. **Multi-Model Support**: Users choose their AI provider (Claude, Gemini, or local Ollama)
5. **Modernization Focus**: Proactively suggests upgrading old patterns to modern equivalents

---

## MVP Requirements

Build a **Minimum Viable Product** with these core features:

### 1. Extension Structure
Create a VS Code extension with:
- **Name**: "WebFeature AI Assistant"
- **Display Name**: "WebFeature AI"
- **Publisher**: (to be configured)
- **Version**: 0.1.0 (MVP)
- **Engine**: VS Code 1.80.0+

### 2. Configuration Settings
Users should be able to configure:
```json
{
  "webfeatureai.model": {
    "type": "string",
    "enum": ["claude", "gemini", "ollama"],
    "default": "claude",
    "description": "AI model to use"
  },
  "webfeatureai.apiKey": {
    "type": "string",
    "description": "API key (stored securely)"
  },
  "webfeatureai.ollamaEndpoint": {
    "type": "string",
    "default": "http://localhost:11434",
    "description": "Ollama local endpoint"
  },
  "webfeatureai.ollamaModel": {
    "type": "string",
    "default": "codellama",
    "description": "Ollama model name"
  },
  "webfeatureai.targetBrowsers": {
    "type": "array",
    "default": ["chrome", "firefox", "safari", "edge"],
    "description": "Target browsers for compatibility checks"
  }
}
```

### 3. Core Commands
Implement these commands in the Command Palette:

1. **"WebFeature AI: Open Chat"** (`webfeatureai.openChat`)
   - Opens a Webview panel with chat interface
   - Allows conversational interaction with AI
   - Context-aware: includes current file/selection

2. **"WebFeature AI: Discover New Features"** (`webfeatureai.discoverFeatures`)
   - Analyzes current project
   - Queries web-features for Baseline features
   - Shows AI-generated report of opportunities

3. **"WebFeature AI: Refactor for Modern Browsers"** (`webfeatureai.refactorModern`)
   - Analyzes selected code or current file
   - Suggests modern alternatives
   - Uses Baseline data for recommendations

4. **"WebFeature AI: Check Feature Status"** (`webfeatureai.checkFeature`)
   - Prompts user to enter a feature name
   - Displays Baseline status and browser support
   - Shows availability timeline

5. **"WebFeature AI: Configure"** (`webfeatureai.configure`)
   - Opens settings UI
   - Helps user set up API keys
   - Tests model connection

---

## Technical Implementation Guide

### Project Structure
```
webfeature-ai/
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript config
├── .vscodeignore           # Files to exclude
├── README.md               # User documentation
├── CHANGELOG.md           # Version history
├── src/
│   ├── extension.ts                    # Extension entry point
│   │
│   ├── ai/
│   │   ├── types.ts                   # AI interfaces
│   │   ├── ModelManager.ts            # Model abstraction layer
│   │   ├── PromptBuilder.ts           # Build context-rich prompts
│   │   └── providers/
│   │       ├── ClaudeProvider.ts      # Anthropic API
│   │       ├── GeminiProvider.ts      # Google API
│   │       └── OllamaProvider.ts      # Local Ollama
│   │
│   ├── baseline/
│   │   ├── FeatureDatabase.ts         # Load web-features data
│   │   ├── QueryEngine.ts             # Query features
│   │   ├── BaselineAnalyzer.ts        # Analyze code for features
│   │   └── types.ts                   # Baseline data types
│   │
│   ├── ui/
│   │   ├── ChatPanel.ts               # Main chat webview
│   │   ├── chatPanel.html             # Chat UI template
│   │   ├── HoverProvider.ts           # Feature hover tooltips
│   │   └── StatusBarManager.ts        # Status bar item
│   │
│   ├── refactoring/
│   │   ├── CodeAnalyzer.ts            # Parse and detect features
│   │   ├── SuggestionEngine.ts        # Generate suggestions
│   │   └── PatternDetector.ts         # Detect legacy patterns
│   │
│   ├── commands/
│   │   ├── openChat.ts                # Chat command
│   │   ├── discoverFeatures.ts        # Discovery command
│   │   ├── refactorModern.ts          # Refactor command
│   │   ├── checkFeature.ts            # Check status command
│   │   └── configure.ts               # Configuration command
│   │
│   └── utils/
│       ├── config.ts                  # Configuration manager
│       ├── logger.ts                  # Logging utility
│       └── validation.ts              # Input validation
│
└── media/                             # Icons and assets
    ├── icon.png
    └── styles/
        └── chat.css
```

### Key Implementation Details

#### 1. Extension Activation (`src/extension.ts`)
```typescript
import * as vscode from 'vscode';
import { ModelManager } from './ai/ModelManager';
import { FeatureDatabase } from './baseline/FeatureDatabase';
import { ChatPanel } from './ui/ChatPanel';
import { registerCommands } from './commands';

export async function activate(context: vscode.ExtensionContext) {
    console.log('WebFeature AI is activating...');
    
    // Initialize feature database
    const featureDb = new FeatureDatabase();
    await featureDb.initialize();
    
    // Initialize AI model manager
    const modelManager = new ModelManager(context);
    
    // Register all commands
    registerCommands(context, modelManager, featureDb);
    
    // Create status bar item
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBar.text = "$(sparkle) WebFeature AI";
    statusBar.command = 'webfeatureai.openChat';
    statusBar.show();
    
    console.log('WebFeature AI is now active!');
}

export function deactivate() {
    console.log('WebFeature AI is deactivating...');
}
```

#### 2. Feature Database (`src/baseline/FeatureDatabase.ts`)
```typescript
import webFeatures from 'web-features';
import { BaselineStatus } from './types';

export class FeatureDatabase {
    private features: Map<string, any>;
    
    async initialize() {
        // Load web-features data
        this.features = new Map(Object.entries(webFeatures));
        console.log(`Loaded ${this.features.size} web features`);
    }
    
    getFeature(id: string) {
        return this.features.get(id);
    }
    
    searchFeatures(query: string) {
        const results = [];
        for (const [id, feature] of this.features) {
            if (id.includes(query.toLowerCase()) || 
                feature.name?.toLowerCase().includes(query.toLowerCase())) {
                results.push({ id, ...feature });
            }
        }
        return results;
    }
    
    getBaselineFeatures(): any[] {
        return Array.from(this.features.entries())
            .filter(([_, feature]) => feature.status?.baseline === 'high')
            .map(([id, feature]) => ({ id, ...feature }));
    }
    
    getNewlyAvailable(sinceDate: Date): any[] {
        return Array.from(this.features.entries())
            .filter(([_, feature]) => {
                const baselineDate = feature.status?.baseline_high_date;
                return baselineDate && new Date(baselineDate) > sinceDate;
            })
            .map(([id, feature]) => ({ id, ...feature }));
    }
}
```

#### 3. Model Manager (`src/ai/ModelManager.ts`)
```typescript
import * as vscode from 'vscode';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { AIProvider, ChatMessage } from './types';

export class ModelManager {
    private provider: AIProvider | null = null;
    
    constructor(private context: vscode.ExtensionContext) {}
    
    async getCurrentProvider(): Promise<AIProvider> {
        const config = vscode.workspace.getConfiguration('webfeatureai');
        const model = config.get<string>('model', 'claude');
        
        switch (model) {
            case 'claude':
                return new ClaudeProvider(this.context);
            case 'gemini':
                return new GeminiProvider(this.context);
            case 'ollama':
                return new OllamaProvider(this.context);
            default:
                throw new Error(`Unknown model: ${model}`);
        }
    }
    
    async sendMessage(messages: ChatMessage[]): Promise<string> {
        const provider = await this.getCurrentProvider();
        return await provider.sendMessage(messages);
    }
    
    async testConnection(): Promise<boolean> {
        try {
            const provider = await this.getCurrentProvider();
            await provider.sendMessage([
                { role: 'user', content: 'Test connection. Reply with "OK".' }
            ]);
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}
```

#### 4. Prompt Builder (`src/ai/PromptBuilder.ts`)
```typescript
import { FeatureDatabase } from '../baseline/FeatureDatabase';

export class PromptBuilder {
    constructor(private featureDb: FeatureDatabase) {}
    
    buildSystemPrompt(): string {
        return `You are WebFeature AI, an expert assistant for web developers.

Your specialty is helping developers:
- Discover and adopt newly available web features
- Refactor code for modern browsers
- Check browser compatibility
- Replace outdated patterns with modern alternatives

You have access to the official web-features Baseline data, which tells you:
- When features became widely available
- Browser support information
- Feature status (baseline, limited, experimental)

When suggesting code changes:
1. Always check Baseline status first
2. Prefer features with "baseline: high" status
3. Provide browser support context
4. Show both old and new code examples
5. Explain the benefits of the change

Be concise, practical, and code-focused.`;
    }
    
    async buildUserPromptWithContext(
        userMessage: string,
        code?: string,
        fileName?: string,
        relevantFeatures?: any[]
    ): Promise<string> {
        let prompt = userMessage;
        
        if (fileName) {
            prompt += `\n\nFile: ${fileName}`;
        }
        
        if (code) {
            prompt += `\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
        }
        
        if (relevantFeatures && relevantFeatures.length > 0) {
            prompt += '\n\nRelevant Baseline features:';
            for (const feature of relevantFeatures) {
                prompt += `\n- ${feature.name} (${feature.id})`;
                prompt += `\n  Status: ${feature.status?.baseline || 'unknown'}`;
                if (feature.status?.baseline_high_date) {
                    prompt += `\n  Available since: ${feature.status.baseline_high_date}`;
                }
            }
        }
        
        return prompt;
    }
}
```

#### 5. Chat Panel (`src/ui/ChatPanel.ts`)
```typescript
import * as vscode from 'vscode';
import { ModelManager } from '../ai/ModelManager';
import { PromptBuilder } from '../ai/PromptBuilder';
import { FeatureDatabase } from '../baseline/FeatureDatabase';

export class ChatPanel {
    private panel: vscode.WebviewPanel | undefined;
    private messages: Array<{ role: string; content: string }> = [];
    
    constructor(
        private context: vscode.ExtensionContext,
        private modelManager: ModelManager,
        private promptBuilder: PromptBuilder,
        private featureDb: FeatureDatabase
    ) {}
    
    async show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        
        this.panel = vscode.window.createWebviewPanel(
            'webfeatureChat',
            'WebFeature AI Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        this.panel.webview.html = this.getWebviewContent();
        
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this.handleUserMessage(message.text);
                        break;
                    case 'attachFile':
                        await this.attachCurrentFile();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
        
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    
    private async handleUserMessage(userText: string) {
        // Add user message
        this.messages.push({ role: 'user', content: userText });
        this.updateChat();
        
        try {
            // Get current context
            const editor = vscode.window.activeTextEditor;
            const code = editor?.document.getText(editor.selection);
            const fileName = editor?.document.fileName;
            
            // Build prompt with context
            const prompt = await this.promptBuilder.buildUserPromptWithContext(
                userText,
                code,
                fileName
            );
            
            // Send to AI
            const response = await this.modelManager.sendMessage([
                { role: 'system', content: this.promptBuilder.buildSystemPrompt() },
                ...this.messages.slice(-10), // Last 10 messages for context
                { role: 'user', content: prompt }
            ]);
            
            // Add AI response
            this.messages.push({ role: 'assistant', content: response });
            this.updateChat();
        } catch (error) {
            vscode.window.showErrorMessage(`AI Error: ${error}`);
        }
    }
    
    private updateChat() {
        if (!this.panel) return;
        
        this.panel.webview.postMessage({
            command: 'updateChat',
            messages: this.messages
        });
    }
    
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                #chat { 
                    height: calc(100vh - 150px);
                    overflow-y: auto;
                    margin-bottom: 20px;
                }
                .message {
                    margin: 10px 0;
                    padding: 10px;
                    border-radius: 5px;
                }
                .user {
                    background: var(--vscode-input-background);
                }
                .assistant {
                    background: var(--vscode-editor-selectionBackground);
                }
                #input {
                    width: 100%;
                    padding: 10px;
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                }
                button {
                    padding: 8px 16px;
                    margin: 5px;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div id="chat"></div>
            <textarea id="input" placeholder="Ask about web features..." rows="3"></textarea>
            <button onclick="sendMessage()">Send</button>
            <button onclick="attachFile()">Attach Current File</button>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function sendMessage() {
                    const input = document.getElementById('input');
                    const text = input.value.trim();
                    if (text) {
                        vscode.postMessage({ command: 'sendMessage', text });
                        input.value = '';
                    }
                }
                
                function attachFile() {
                    vscode.postMessage({ command: 'attachFile' });
                }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateChat') {
                        const chat = document.getElementById('chat');
                        chat.innerHTML = message.messages
                            .map(m => \`<div class="message \${m.role}">\${escapeHtml(m.content)}</div>\`)
                            .join('');
                        chat.scrollTop = chat.scrollHeight;
                    }
                });
                
                function escapeHtml(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }
                
                document.getElementById('input').addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        sendMessage();
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
```

#### 6. Discover Features Command (`src/commands/discoverFeatures.ts`)
```typescript
import * as vscode from 'vscode';
import { FeatureDatabase } from '../baseline/FeatureDatabase';
import { ModelManager } from '../ai/ModelManager';

export async function discoverFeaturesCommand(
    featureDb: FeatureDatabase,
    modelManager: ModelManager
) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Discovering new web features...',
        cancellable: false
    }, async (progress) => {
        // Get newly available features (last 12 months)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const newFeatures = featureDb.getNewlyAvailable(oneYearAgo);
        
        progress.report({ increment: 30, message: 'Analyzing project...' });
        
        // Analyze current project structure
        const editor = vscode.window.activeTextEditor;
        const projectInfo = {
            language: editor?.document.languageId,
            fileName: editor?.document.fileName,
            hasPackageJson: await vscode.workspace.findFiles('package.json').then(f => f.length > 0)
        };
        
        progress.report({ increment: 30, message: 'Generating report...' });
        
        // Build AI prompt
        const prompt = `Analyze this project and suggest how to adopt these newly available web features:

New Baseline Features:
${newFeatures.slice(0, 10).map(f => `- ${f.name} (${f.id})`).join('\n')}

Project Context:
- Language: ${projectInfo.language}
- File: ${projectInfo.fileName}
- Has package.json: ${projectInfo.hasPackageJson}

Provide:
1. Top 3 most relevant features for this project
2. Why they're beneficial
3. How to implement them
4. Browser support status

Be concise and actionable.`;
        
        const response = await modelManager.sendMessage([
            { role: 'user', content: prompt }
        ]);
        
        progress.report({ increment: 40, message: 'Done!' });
        
        // Show results in new document
        const doc = await vscode.workspace.openTextDocument({
            content: `# WebFeature AI: New Features Report\n\n${response}`,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    });
}
```

---

## Package.json Configuration

```json
{
  "name": "webfeature-ai",
  "displayName": "WebFeature AI Assistant",
  "description": "AI code assistant specialized in web features and browser compatibility",
  "version": "0.1.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Programming Languages",
    "Linters",
    "Other"
  ],
  "keywords": [
    "ai",
    "assistant",
    "web",
    "baseline",
    "browser",
    "compatibility",
    "refactoring"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "webfeatureai.openChat",
        "title": "WebFeature AI: Open Chat",
        "icon": "$(comment-discussion)"
      },
      {
        "command": "webfeatureai.discoverFeatures",
        "title": "WebFeature AI: Discover New Features",
        "icon": "$(telescope)"
      },
      {
        "command": "webfeatureai.refactorModern",
        "title": "WebFeature AI: Refactor for Modern Browsers",
        "icon": "$(wand)"
      },
      {
        "command": "webfeatureai.checkFeature",
        "title": "WebFeature AI: Check Feature Status",
        "icon": "$(info)"
      },
      {
        "command": "webfeatureai.configure",
        "title": "WebFeature AI: Configure",
        "icon": "$(settings-gear)"
      }
    ],
    "configuration": {
      "title": "WebFeature AI",
      "properties": {
        "webfeatureai.model": {
          "type": "string",
          "enum": ["claude", "gemini", "ollama"],
          "default": "claude",
          "description": "AI model to use"
        },
        "webfeatureai.ollamaEndpoint": {
          "type": "string",
          "default": "http://localhost:11434",
          "description": "Ollama endpoint URL"
        },
        "webfeatureai.ollamaModel": {
          "type": "string",
          "default": "codellama",
          "description": "Ollama model name"
        },
        "webfeatureai.targetBrowsers": {
          "type": "array",
          "default": ["chrome", "firefox", "safari", "edge"],
          "description": "Target browsers for compatibility"
        }
      }
    },
    "keybindings": [
      {
        "command": "webfeatureai.openChat",
        "key": "ctrl+shift+w",
        "mac": "cmd+shift+w"
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "lint": "eslint src --ext ts",
    "package": "vsce package"
  },
  "devDependencies": {
    "@types/node": "^18.x",
    "@types/vscode": "^1.80.0",
    "@typescript-eslint/eslint-plugin": "^6.x",
    "@typescript-eslint/parser": "^6.x",
    "@vscode/vsce": "^2.x",
    "eslint": "^8.x",
    "typescript": "^5.x"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@google/generative-ai": "^0.18.0",
    "axios": "^1.7.0",
    "web-features": "^1.0.0"
  }
}
```

---

## Implementation Priorities

### Phase 1: Core Infrastructure (Week 1)
1. ✅ Extension scaffold with TypeScript
2. ✅ Install and integrate web-features package
3. ✅ Basic AI provider (Claude only for MVP)
4. ✅ Configuration system
5. ✅ Status bar indicator

### Phase 2: Chat Interface (Week 2)
1. ✅ Webview panel with chat UI
2. ✅ Message handling and context
3. ✅ Prompt builder with Baseline data
4. ✅ Error handling and loading states

### Phase 3: Feature Discovery (Week 3)
1. ✅ Feature database queries
2. ✅ "Discover Features" command
3. ✅ Project analysis
4. ✅ Report generation

### Phase 4: Refactoring (Week 4)
1. ✅ Code analysis for feature detection
2. ✅ "Refactor Modern" command
3. ✅ Suggestion engine
4. ✅ Apply code changes

### Phase 5: Polish (Week 4)
1. ✅ Add Gemini and Ollama providers
2. ✅ Improve error messages
3. ✅ Write documentation
4. ✅ Test with real projects

---

## Success Criteria

The MVP is complete when:

1. ✅ Extension installs and activates without errors
2. ✅ Chat panel opens and responds with AI
3. ✅ Can switch between AI models (Claude, Gemini, Ollama)
4. ✅ "Discover Features" generates a useful report
5. ✅ web-features data is successfully loaded and queried
6. ✅ Basic refactoring suggestions work
7. ✅ Configuration UI works
8. ✅ Documentation is complete

---

## Testing Strategy

1. **Manual Testing**
   - Install extension in VS Code
   - Test each command
   - Verify AI responses are relevant
   - Check Baseline data accuracy

2. **Test Projects**
   - Legacy project with jQuery and polyfills
   - Modern project with ES2020+
   - CSS-focused project

3. **Edge Cases**
   - No internet connection
   - Invalid API keys
   - Empty projects
   - Large files

---

## Documentation Requirements

### README.md
Include:
- Overview and USP
- Installation instructions
- Configuration guide (with screenshots)
- Usage examples
- Commands reference
- Troubleshooting
- Privacy and security note

### CHANGELOG.md
Document:
- Version 0.1.0 (MVP) features
- Known limitations

---

## Important Notes

### Security
- Store API keys in VS Code's secret storage (`context.secrets`)
- Never log API keys
- Validate all user inputs
- Sanitize code before sending to AI

### Performance
- Cache web-features data on startup
- Limit AI context to recent messages
- Show loading indicators for slow operations
- Handle rate limits gracefully

### User Experience
- Clear error messages
- Progress indicators for long operations
- Keyboard shortcuts for common actions
- Dark mode support in webviews

---

## Expected Deliverables

1. **Source Code**
   - Complete TypeScript codebase
   - All files in proper structure
   - Comments for complex logic

2. **Configuration Files**
   - package.json with all dependencies
   - tsconfig.json
   - .vscodeignore

3. **Documentation**
   - README.md with setup instructions
   - CHANGELOG.md
   - Inline code documentation

4. **Testing**
   - Proof that extension works
   - Example outputs from commands
   - Test with at least one AI model

---

## Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run extension (F5 in VS Code)
# Opens Extension Development Host

# Package extension
npm run package
```

---

## Final Notes

This is an **MVP** - focus on core functionality over perfection. The goal is to:
1. Prove the concept works
2. Demonstrate the USP (Baseline integration)
3. Show value to users
4. Create foundation for future features

**Prioritize:**
- ✅ Working chat interface
- ✅ Baseline data integration
- ✅ At least one useful command
- ✅ Good error handling
- ✅ Clear documentation

**Can defer:**
- Advanced code analysis
- Hover providers
- Diagnostics
- Multiple language support
- Team features

---

## Questions to Ask User (If Needed)

1. Which AI model API key do you have? (Claude/Gemini/Ollama)
2. Do you have a preferred VS Code extension publisher name?
3. Any specific web features you want to prioritize?
4. Target audience: beginners or advanced developers?

---

## Example User Scenarios

### Scenario 1: Discovering Container Queries
```
User: Opens VS Code with a CSS project
User: Command Palette → "WebFeature AI: Discover New Features"
Extension: Analyzes CSS files
Extension: Finds that Container Queries are now Baseline
AI: Suggests where to use Container Queries instead of media queries
User: Reviews suggestions
User: Applies changes
```

### Scenario 2: Modernizing Polyfills
```
User: Selects polyfill code in JavaScript file
User: Right-click → "WebFeature AI: Refactor for Modern Browsers"
Extension: Detects feature being polyfilled (e.g., fetch)
Extension: Checks Baseline status of fetch
AI: Suggests removing polyfill since fetch is now Baseline
AI: Shows native implementation
User: Applies suggestion
```

### Scenario 3: Chat Interaction
```
User: Opens chat panel
User: "Can I use view transitions in my project?"
Extension: Queries web-features for "view-transitions"
Extension: Checks Baseline status
AI: Responds with:
  - Current Baseline status
  - Browser support
  - Code example
  - Implementation guide
User: Asks follow-up questions
AI: Provides detailed explanations
```

---

## Begin Development

Start with:
1. Create package.json with dependencies
2. Set up TypeScript configuration
3. Create basic extension.ts with activation
4. Implement FeatureDatabase to load web-features
5. Create simple Claude provider
6. Build chat panel UI
7. Test end-to-end flow
8. Add remaining features iteratively

Good luck building the MVP! 🚀

