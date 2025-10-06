# 🏗️ Baseline.dev - Architecture & Tech Stack

## 📋 Overview

This document explains how Baseline.dev is architected, the technologies used, and how all components work together.

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VS Code Extension                        │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │   Extension    │  │   Webview UI   │  │   Commands     │    │
│  │   Host         │◄─┤   (Chat Panel) │◄─┤   (Menu Items) │    │
│  └────────┬───────┘  └────────┬───────┘  └────────────────┘    │
│           │                   │                                  │
│  ┌────────▼───────────────────▼────────────────────┐            │
│  │         Core Business Logic Layer                │            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │            │
│  │  │   AI     │  │ Baseline │  │  Prompt  │      │            │
│  │  │ Manager  │  │   API    │  │ Builder  │      │            │
│  │  └──────────┘  └──────────┘  └──────────┘      │            │
│  └──────────────────────────────────────────────────┘            │
│           │                   │                   │              │
└───────────┼───────────────────┼───────────────────┼──────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
   │  AI Providers  │  │ Web Platform   │  │  VS Code API   │
   │ (Claude,Gemini,│  │  Dashboard API │  │ (File System,  │
   │   Ollama)      │  │  web-features  │  │  Workspace)    │
   └────────────────┘  └────────────────┘  └────────────────┘
```

---

## 🔧 Tech Stack Components

### Core Technologies

```
┌─────────────────────────────────────────────────────┐
│                   TECH STACK                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Programming Language                                │
│  ┌──────────────────────────────────────┐           │
│  │  TypeScript 5.3+ (100% type-safe)   │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  Runtime Environment                                 │
│  ┌──────────────────────────────────────┐           │
│  │  Node.js (via VS Code Extension API) │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  UI Framework                                        │
│  ┌──────────────────────────────────────┐           │
│  │  Webview API (HTML/CSS/JavaScript)   │           │
│  │  + anime.js for animations           │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  Build Tools                                         │
│  ┌──────────────────────────────────────┐           │
│  │  TypeScript Compiler (tsc)           │           │
│  │  npm (package management)            │           │
│  └──────────────────────────────────────┘           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies Overview

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/sdk` | ^0.27.0 | Claude AI API client |
| `@google/generative-ai` | ^0.18.0 | Gemini AI API client |
| `axios` | ^1.7.0 | HTTP client for Ollama & APIs |
| `web-features` | ^1.0.0 | Local Baseline data package |
| `animejs` | 3.2.1 | UI animations (CDN) |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/vscode` | ^1.80.0 | VS Code API types |
| `typescript` | ^5.3.3 | TypeScript compiler |
| `eslint` | ^8.56.0 | Code linting |
| `@vscode/vsce` | ^2.22.0 | Extension packager |

---

## 🔄 Data Flow Architecture

### User Interaction Flow

```
User Action → VS Code → Extension → AI Provider → Response → UI Update

Detailed Flow:
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Types message & clicks Send
     ▼
┌──────────────────┐
│  Chat UI (HTML)  │
└────┬─────────────┘
     │ 2. postMessage to Extension
     ▼
┌──────────────────┐
│  ChatPanel.ts    │
└────┬─────────────┘
     │ 3. handleUserMessage()
     ▼
┌──────────────────┐
│ PromptBuilder.ts │◄──── Context (code, features, browsers)
└────┬─────────────┘
     │ 4. Build enriched prompt
     ▼
┌──────────────────┐
│ ModelManager.ts  │
└────┬─────────────┘
     │ 5. Route to provider
     ▼
┌──────────────────┐
│  AI Provider     │ (Claude/Gemini/Ollama)
│  (ClaudeProvider,│
│  GeminiProvider, │
│  OllamaProvider) │
└────┬─────────────┘
     │ 6. API call with prompt
     ▼
┌──────────────────┐
│  AI API          │ (Anthropic/Google/Local)
└────┬─────────────┘
     │ 7. AI response
     ▼
┌──────────────────┐
│  ChatPanel.ts    │
└────┬─────────────┘
     │ 8. updateChat() → postMessage
     ▼
┌──────────────────┐
│  Chat UI (HTML)  │
└────┬─────────────┘
     │ 9. Render with animations
     ▼
┌──────────┐
│   User   │ Sees response with action buttons
└──────────┘
```

---

## 🗂️ Project Structure

```
base-dev/
│
├── src/                          # Source code (TypeScript)
│   │
│   ├── extension.ts              # Extension entry point
│   │   └─► Registers commands, initializes services
│   │
│   ├── ai/                       # AI Integration Layer
│   │   ├── ModelManager.ts      # Routes requests to providers
│   │   ├── PromptBuilder.ts     # Builds context-aware prompts
│   │   ├── types.ts             # AI-related type definitions
│   │   └── providers/           # AI Provider Implementations
│   │       ├── ClaudeProvider.ts    # Anthropic Claude
│   │       ├── GeminiProvider.ts    # Google Gemini
│   │       └── OllamaProvider.ts    # Local Ollama
│   │
│   ├── baseline/                # Baseline Data Layer
│   │   ├── BaselineAPI.ts       # Fetches from Web Platform Dashboard
│   │   ├── FeatureDatabase.ts   # Manages feature data locally
│   │   └── types.ts             # Baseline-related types
│   │
│   ├── commands/                # VS Code Command Handlers
│   │   ├── openChat.ts          # Opens chat panel
│   │   ├── discoverFeatures.ts  # Discovers new features
│   │   ├── refactorModern.ts    # Smart refactoring
│   │   ├── checkFeature.ts      # Check feature status
│   │   ├── configure.ts         # Configuration wizard
│   │   └── refreshData.ts       # Refresh Baseline data
│   │
│   └── ui/                      # User Interface Layer
│       └── ChatPanel.ts         # Webview chat interface
│           └─► HTML/CSS/JS embedded (with anime.js)
│
├── dist/                        # Compiled JavaScript (generated)
│   └── [mirrors src/ structure]
│
├── media/                       # Static assets
│   └── icon.png                # Extension icon
│
├── node_modules/               # Dependencies
├── package.json                # Extension manifest
├── tsconfig.json              # TypeScript config
└── *.md                       # Documentation
```

---

## 🔌 Component Interactions

### AI Integration Flow

```
┌──────────────────────────────────────────────────────────┐
│                    AI INTEGRATION                         │
└──────────────────────────────────────────────────────────┘

User Request
     │
     ▼
┌─────────────────┐
│ ModelManager    │──── Configuration (which model to use)
└────────┬────────┘
         │
         │ Determines provider based on config
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ▼         ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Claude  │ │ Gemini   │ │ Ollama   │ │ (Future) │
│Provider │ │Provider  │ │Provider  │ │Providers │
└────┬────┘ └────┬─────┘ └────┬─────┘ └──────────┘
     │           │            │
     ▼           ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│Anthropic│ │ Google   │ │  Local   │
│   API   │ │   API    │ │  Ollama  │
└────┬────┘ └────┬─────┘ └────┬─────┘
     │           │            │
     └───────────┴────────────┘
                 │
                 ▼
            AI Response
```

### Baseline Data Flow

```
┌──────────────────────────────────────────────────────────┐
│               BASELINE DATA SOURCES                       │
└──────────────────────────────────────────────────────────┘

Feature Query
     │
     ▼
┌─────────────────┐
│ FeatureDatabase │──── useRealTimeData setting
└────────┬────────┘
         │
         │ Checks cache (1 hour TTL)
         │
    Cache Miss?
         │
         ▼
┌─────────────────┐
│  BaselineAPI    │
└────────┬────────┘
         │
         │ 3-Tier Fallback System:
         │
    ┌────┴────────────────────┐
    │ 1. Web Platform         │
    │    Dashboard API        │──── Primary (real-time)
    │    api.webstatus.dev    │
    └────┬────────────────────┘
         │ Fails?
         ▼
    ┌────────────────────────┐
    │ 2. GitHub Raw URL      │──── Fallback
    │    github.com/.../     │
    │    web-features        │
    └────┬───────────────────┘
         │ Fails?
         ▼
    ┌────────────────────────┐
    │ 3. Local npm Package   │──── Offline support
    │    web-features        │
    │    (installed)         │
    └────┬───────────────────┘
         │
         ▼
    Feature Data
         │
         ▼
    Cache & Return
```

---

## 🎨 UI Architecture (Chat Panel)

### Webview Communication

```
┌──────────────────────────────────────────────────────────┐
│                  WEBVIEW COMMUNICATION                    │
└──────────────────────────────────────────────────────────┘

Extension Side                    Webview Side (HTML/JS)
(TypeScript)                      (JavaScript in HTML)

┌────────────────┐               ┌────────────────┐
│  ChatPanel.ts  │               │  Webview DOM   │
└────────┬───────┘               └────────┬───────┘
         │                                │
         │ getWebviewContent()            │
         │──────────────────────────────►│
         │  Returns HTML/CSS/JS           │
         │                                │
         │                                │
         │◄──────────────────────────────│
         │  postMessage({                │
         │    command: 'sendMessage',    │
         │    text: 'user input'         │
         │  })                            │
         │                                │
    handleUserMessage()                  │
         │                                │
    [AI Processing]                      │
         │                                │
         │──────────────────────────────►│
         │  postMessage({                │
         │    command: 'updateChat',     │
         │    messages: [...]            │
         │  })                            │
         │                                │
         │                            anime.js
         │                           animations
         │                                │
         │                           DOM Update
         │                                │
         │◄──────────────────────────────│
         │  postMessage({                │
         │    command: 'saveAsNew',      │
         │    content: code              │
         │  })                            │
         │                                │
    saveAsNewFile()                      │
         │                                │
    VS Code File API                     │
         │                                │
         │──────────────────────────────►│
         │  Notification: File created   │
         │                                │
```

### UI Component Hierarchy

```
Chat Panel (Webview)
│
├── #chat-container
│   └── .message (user | assistant)
│       ├── Text content (formatted markdown)
│       ├── Code blocks (with syntax highlighting)
│       └── .message-actions (if code present)
│           ├── 💾 Save as New File button
│           └── ✏️ Overwrite File button (if file attached)
│
└── #input-container
    ├── #attached-file-indicator (shows when file attached)
    │   ├── .attached-file-info
    │   │   ├── 📎 icon
    │   │   └── filename
    │   └── .clear-attachment (✕ button) ◄── NEW!
    │
    ├── #input-box
    │   └── #message-input (textarea)
    │
    └── .button-group
        ├── Send button
        └── Attach File button
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                        │
└──────────────────────────────────────────────────────────┘

1. API Key Storage
   ┌────────────────────────────────────┐
   │  VS Code Secret Storage (encrypted)│
   │  - Not in settings.json            │
   │  - Not in plaintext                │
   │  - OS-level encryption             │
   └────────────────────────────────────┘

2. Input Validation
   ┌────────────────────────────────────┐
   │  All user inputs sanitized         │
   │  - HTML escaping in webview        │
   │  - Type checking in TypeScript     │
   │  - Validation before API calls     │
   └────────────────────────────────────┘

3. File Operations
   ┌────────────────────────────────────┐
   │  Confirmation dialogs              │
   │  - Overwrite requires confirmation │
   │  - Workspace-scoped only           │
   │  - Error boundaries                │
   └────────────────────────────────────┘

4. Network Security
   ┌────────────────────────────────────┐
   │  HTTPS only for API calls          │
   │  - Timeout limits (10-15s)         │
   │  - Error handling                  │
   │  - Graceful degradation            │
   └────────────────────────────────────┘
```

---

## ⚡ Performance Optimizations

### Caching Strategy

```
┌──────────────────────────────────────────────────────────┐
│                  CACHING ARCHITECTURE                     │
└──────────────────────────────────────────────────────────┘

Request for Feature Data
         │
         ▼
┌────────────────────┐
│  Check Cache       │
│  (1 hour TTL)      │
└────────┬───────────┘
         │
    Cache Hit?
    │         │
    YES       NO
    │         │
    ▼         ▼
Return    Fetch from API
from      │
cache     ▼
          Store in cache
          │
          ▼
          Return

Benefits:
• Reduces API calls (cost & rate limits)
• Faster response times
• Works offline after first fetch
• Configurable TTL (default: 1 hour)
```

### Lazy Loading

```
Extension Activation
         │
         ▼
┌────────────────────┐
│ Core Services Only │
│ - Extension host   │
│ - Command registry │
└────────┬───────────┘
         │
    User Action?
         │
         ▼
┌────────────────────┐
│ Load on Demand     │
│ - AI providers     │
│ - Baseline data    │
│ - UI components    │
└────────────────────┘

Benefits:
• Faster extension activation
• Lower memory footprint
• Resources loaded when needed
```

---

## 🔄 State Management

```
┌──────────────────────────────────────────────────────────┐
│                    STATE FLOW                             │
└──────────────────────────────────────────────────────────┘

Extension Level (extension.ts)
┌────────────────────────────────────────┐
│  Global State                          │
│  - ModelManager instance (singleton)  │
│  - FeatureDatabase instance           │
│  - Configuration settings             │
└────────────────────────────────────────┘
         │
         ▼
Component Level (ChatPanel.ts)
┌────────────────────────────────────────┐
│  Component State                       │
│  - messages: Message[]                │
│  - attachedFile: FileInfo | undefined │
│  - panel: WebviewPanel               │
└────────────────────────────────────────┘
         │
         ▼
UI Level (Webview JavaScript)
┌────────────────────────────────────────┐
│  UI State                              │
│  - isLoading: boolean                 │
│  - hasAttachedFile: boolean           │
│  - lastAssistantMessage: string       │
└────────────────────────────────────────┘
```

---

## 🧪 Error Handling Strategy

```
┌──────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                          │
└──────────────────────────────────────────────────────────┘

Try Operation
     │
     ▼
┌─────────────────┐
│ Execute         │
└────────┬────────┘
         │
    Success?
    │      │
    YES    NO
    │      │
    ▼      ▼
Return  Catch Error
Result      │
            ▼
       Log to Console
            │
            ▼
       User Notification
            │
            ▼
       Fallback Strategy
       │
       ├─► Use cached data
       ├─► Retry with timeout
       ├─► Use alternative API
       └─► Graceful degradation

Error Types:
1. Network Errors     → Retry with fallback
2. API Errors         → Show user message + use cache
3. Validation Errors  → Show helpful error message
4. File System Errors → Confirm permissions + retry
```

---

## 📊 Extension Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                EXTENSION LIFECYCLE                        │
└──────────────────────────────────────────────────────────┘

VS Code Starts
     │
     ▼
┌─────────────────┐
│ Lazy Activation │ (onStartupFinished)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ activate()      │
│ in extension.ts │
└────────┬────────┘
         │
         ├─► Initialize ModelManager
         ├─► Initialize FeatureDatabase
         ├─► Register Commands
         └─► Load Configuration
         │
         ▼
┌─────────────────┐
│ Extension Ready │
└────────┬────────┘
         │
    User Triggers Command
         │
         ▼
┌─────────────────┐
│ Command Handler │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Load Components │
│ (on demand)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Execute Action  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update UI       │
└─────────────────┘
         │
         ⋮
         │
    VS Code Closes
         │
         ▼
┌─────────────────┐
│ deactivate()    │
│ - Cleanup       │
│ - Save state    │
└─────────────────┘
```

---

## 🔌 API Integration Details

### AI Provider Integration

```typescript
// Provider Interface (implemented by all providers)
interface AIProvider {
    sendMessage(messages: Message[]): Promise<string>;
}

// Flow:
User Input → ModelManager.sendMessage()
                    ↓
          Determine active provider
                    ↓
        ┌──────────┴──────────┐
        ▼                     ▼
   ClaudeProvider      GeminiProvider
   (Anthropic SDK)     (Google SDK)
        │                     │
        ▼                     ▼
   Claude API           Gemini API
   (HTTPS)              (HTTPS)
        │                     │
        └──────────┬──────────┘
                   ▼
              Response
                   │
                   ▼
            Format & Return
```

### Baseline API Integration

```typescript
// 3-Tier Fallback System
async fetchLatestFeatures() {
    try {
        // Tier 1: Web Platform Dashboard API
        return await fetchFromWebStatusAPI();
    } catch {
        try {
            // Tier 2: GitHub Raw URL
            return await fetchFromGitHub();
        } catch {
            // Tier 3: Local Package
            return localFeatures;
        }
    }
}

// Query Support (Web Platform Dashboard)
queryFeatures('baseline_status:newly AND group:css')
    ↓
Encode query string
    ↓
GET https://api.webstatus.dev/v1/features?q=...
    ↓
Parse response
    ↓
Transform to standard format
    ↓
Return features
```

---

## 🎯 Configuration Management

```
┌──────────────────────────────────────────────────────────┐
│              CONFIGURATION SYSTEM                         │
└──────────────────────────────────────────────────────────┘

Settings Storage:
┌────────────────────────────────────┐
│  VS Code Settings                  │
│  - User level (global)            │
│  - Workspace level (per project)  │
│  - Settings sync across devices   │
└────────────────────────────────────┘

Configuration Structure:
{
    "baselinedev.model": "claude" | "gemini" | "ollama",
    "baselinedev.claudeModel": "claude-3-5-sonnet-...",
    "baselinedev.geminiModel": "gemini-1.5-flash",
    "baselinedev.ollamaEndpoint": "http://localhost:11434",
    "baselinedev.ollamaModel": "codellama",
    "baselinedev.targetBrowsers": ["chrome", "firefox", ...],
    "baselinedev.baselineThreshold": "high" | "low",
    "baselinedev.useRealTimeData": true | false,
    "baselinedev.showStatusBar": true | false
}

Access Pattern:
┌────────────────────────────────────┐
│  const config = vscode.workspace   │
│    .getConfiguration('baselinedev')│
│  const model = config.get('model') │
└────────────────────────────────────┘
```

---

## 📈 Performance Metrics

```
┌──────────────────────────────────────────────────────────┐
│                PERFORMANCE TARGETS                        │
└──────────────────────────────────────────────────────────┘

Extension Activation:    < 200ms
Command Execution:       < 100ms
Chat Panel Open:         < 500ms
AI Response:             3-10s (depends on provider)
Feature Query (cached):  < 50ms
Feature Query (API):     < 2s
File Save Operation:     < 200ms
Animation Smoothness:    60 FPS
Memory Footprint:        < 50MB (idle)
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  DEPLOYMENT FLOW                          │
└──────────────────────────────────────────────────────────┘

Source Code (TypeScript)
         │
         ▼
┌─────────────────┐
│  npm run compile│ → TypeScript Compiler
└────────┬────────┘
         │
         ▼
Compiled Code (JavaScript in dist/)
         │
         ▼
┌─────────────────┐
│  npm run package│ → vsce package
└────────┬────────┘
         │
         ▼
Extension Package (.vsix file)
         │
         ├─► Install Locally (code --install-extension)
         ├─► Share with Team
         └─► Publish to Marketplace (vsce publish)
                 │
                 ▼
         VS Code Marketplace
                 │
                 ▼
         Users Install via Extensions View
```

---

## 🔍 Debugging Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 DEBUGGING SYSTEM                          │
└──────────────────────────────────────────────────────────┘

Development Mode (F5):
┌────────────────────────────────────┐
│  Extension Development Host        │
│  - Separate VS Code window        │
│  - Console logging visible        │
│  - Hot reload on save             │
│  - Debug breakpoints active       │
└────────────────────────────────────┘

Logging Levels:
console.log()   → General information
console.warn()  → Warnings (fallbacks triggered)
console.error() → Errors (with stack traces)

Output Channels:
VS Code Output Panel → "Baseline.dev"
  - Extension logs
  - API responses
  - Error details

DevTools for Webview:
Right-click in Chat Panel → "Inspect Element"
  - DOM inspection
  - JavaScript debugging
  - Network monitoring
  - Console logs
```

---

## 📝 Code Quality Architecture

```
┌──────────────────────────────────────────────────────────┐
│                CODE QUALITY SYSTEM                        │
└──────────────────────────────────────────────────────────┘

TypeScript Compiler
         │
         ├─► Strict mode enabled
         ├─► No implicit any
         ├─► Null checks
         └─► Full type inference
         │
         ▼
ESLint
         │
         ├─► Code style rules
         ├─► Best practices
         ├─► Error prevention
         └─► Consistency checks
         │
         ▼
Type Safety
         │
         ├─► Interfaces for all data
         ├─► Enums for constants
         ├─► Generic types where needed
         └─► No type assertions (minimal)
```

---

## 🎯 Summary

### Key Architectural Decisions

1. **TypeScript First** - 100% type-safe codebase
2. **Modular Design** - Separation of concerns (AI, Baseline, UI)
3. **Provider Pattern** - Pluggable AI providers
4. **3-Tier Fallback** - Reliable data access (API → GitHub → Local)
5. **Webview UI** - Native-looking chat interface
6. **Event-Driven** - VS Code command system
7. **Caching** - Performance optimization with TTL
8. **Security** - Encrypted API key storage
9. **Error Resilience** - Graceful degradation
10. **Lazy Loading** - Fast activation, load on demand

### Technology Choices Rationale

| Choice | Rationale |
|--------|-----------|
| TypeScript | Type safety, IDE support, maintainability |
| VS Code Webview | Native integration, full HTML/CSS/JS |
| anime.js | Smooth animations, small footprint |
| axios | Reliable HTTP client, better than fetch for some use cases |
| web-features package | Official Baseline data, offline support |

---

## 📚 Further Reading

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Web Platform Dashboard](https://web.dev/articles/web-platform-dashboard-baseline)
- [anime.js Documentation](https://animejs.com/documentation/)

---

*Last Updated: October 6, 2025*

