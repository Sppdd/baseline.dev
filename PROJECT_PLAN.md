
## Project Overview

The name of this extension is Baseline.dev

An AI-powered VS Code extension that helps developers build, refactor, and modernize web projects using the latest web platform features. The extension leverages the Web Features Baseline API to provide intelligent suggestions about browser compatibility, newly available features, and code modernization opportunities.

---

## Unique Selling Proposition (USP)

**"The only AI code assistant that understands the web platform timeline"**

### Key Differentiators:

1. **Baseline-Aware Intelligence**
   - Real-time awareness of web feature availability and Baseline status
   - Suggests features that just became "Baseline" (widely available)
   - Warns about deprecated or poorly-supported features

2. **Multi-Model Flexibility**
   - Support for Claude, Gemini, and Ollama local models
   - User-controlled API endpoints
   - Model selection based on task complexity

3. **Browser-Focused Refactoring**
   - Target-specific browser versions for refactoring
   - Identify opportunities to replace polyfills with native features
   - Suggest modern alternatives to legacy code patterns

4. **Context-Aware Code Analysis**
   - Analyze entire project for feature usage
   - Detect outdated patterns and suggest modern alternatives
   - Provide upgrade paths with compatibility information

---

## MVP Feature Set

### Phase 1: Core Infrastructure
1. **Extension Scaffold**
   - Basic VS Code extension structure
   - Command palette integration
   - Status bar indicator
   - Settings UI for model configuration

2. **AI Model Integration**
   - Support for Claude API
   - Support for Gemini API
   - Support for Ollama local models
   - Model switcher in settings

3. **Baseline Data Integration**
   - Install and integrate `web-features` npm package
   - Parse and cache Baseline data
   - Create query interface for feature information

### Phase 2: Core Features
1. **Feature Discovery Command**
   - "Check for newly available features"
   - Analyze project and suggest Baseline features to adopt
   - Show compatibility report

2. **Smart Code Refactoring**
   - "Refactor for modern browsers"
   - Replace polyfills with native features
   - Modernize CSS/JS patterns
   - Target specific browser version

3. **Interactive Chat Panel**
   - Side panel for AI conversation
   - Code snippet attachment
   - File context inclusion
   - Inline code suggestions

4. **Feature Status Hover**
   - Hover over CSS/JS features
   - Show Baseline status and browser support
   - Display availability timeline

### Phase 3: Advanced Features
1. **Project-Wide Analysis**
   - Scan entire codebase for feature usage
   - Generate modernization report
   - Identify compatibility risks

2. **Automated Suggestions**
   - Diagnostic warnings for outdated patterns
   - Quick fix actions
   - Code actions provider

---

## Technical Architecture

### Components

```
webfeature-ai/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── ai/
│   │   ├── modelManager.ts       # AI model abstraction
│   │   ├── providers/
│   │   │   ├── claude.ts
│   │   │   ├── gemini.ts
│   │   │   └── ollama.ts
│   │   └── promptBuilder.ts      # Context-aware prompts
│   ├── baseline/
│   │   ├── featureData.ts        # web-features integration
│   │   ├── queryEngine.ts        # Feature lookup
│   │   └── analyzer.ts           # Code analysis
│   ├── ui/
│   │   ├── chatPanel.ts          # Webview panel
│   │   ├── hoverProvider.ts      # Feature hover
│   │   └── statusBar.ts
│   ├── refactoring/
│   │   ├── codeAnalyzer.ts       # Parse and analyze code
│   │   ├── suggestionEngine.ts   # Generate suggestions
│   │   └── codeActions.ts        # VS Code code actions
│   └── utils/
│       ├── config.ts             # Extension configuration
│       └── logger.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Data Flow

1. **User Action** → Command Palette / Chat Panel / Hover
2. **Context Gathering** → Current file, selection, project files
3. **Baseline Query** → Check web-features for relevant data
4. **Prompt Construction** → Build context-rich prompt with Baseline data
5. **AI Processing** → Send to selected model (Claude/Gemini/Ollama)
6. **Response Handling** → Parse, validate, and present suggestions
7. **Code Application** → Apply changes via workspace edits

---

## Implementation Strategy

### Dependencies

```json
{
  "dependencies": {
    "web-features": "latest",
    "@anthropic-ai/sdk": "^0.x",
    "@google/generative-ai": "^0.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "typescript": "^5.x",
    "esbuild": "^0.x"
  }
}
```

### Key VS Code APIs

- **Language Features**: Hover providers, code actions, diagnostics
- **Workspace**: File reading, text edits, workspace folders
- **Webview**: Chat panel UI
- **Configuration**: User settings and API keys
- **Commands**: Command palette integration

### Security Considerations

- Store API keys in VS Code secret storage
- Validate all user inputs
- Sanitize code before sending to AI
- Rate limiting for API calls
- Clear consent for code sharing

---

## User Experience Flow

### Scenario 1: Discovering New Features
1. User opens project in VS Code
2. Clicks "WebFeature AI: Discover New Features"
3. Extension scans project files
4. Queries web-features for Baseline status
5. AI generates personalized report with:
   - Features that just became Baseline
   - How to implement them in the project
   - Expected browser support improvement

### Scenario 2: Refactoring for Modern Browsers
1. User selects legacy code (e.g., polyfill)
2. Right-clicks → "Refactor with WebFeature AI"
3. Extension detects feature usage
4. Checks Baseline status
5. AI suggests:
   - Remove polyfill if feature is Baseline
   - Replace with native implementation
   - Add feature detection if needed
6. User reviews and applies changes

### Scenario 3: Interactive Chat
1. User opens WebFeature AI chat panel
2. Asks: "Can I use Container Queries in my project?"
3. Extension:
   - Checks Baseline status of Container Queries
   - Analyzes project's browser targets (from browserslist)
   - AI responds with:
     - Baseline status and availability
     - Browser support data
     - Code example for the project
     - Migration strategy if needed

---

## Success Metrics

### MVP Success Criteria
- ✅ Extension installs and activates in VS Code
- ✅ Successfully connects to at least one AI model
- ✅ Loads and queries web-features data
- ✅ Provides at least one useful suggestion per project
- ✅ Chat panel works and maintains context
- ✅ Settings allow model selection

### User Value Metrics
- Time saved on browser compatibility research
- Number of modern features adopted
- Code modernization percentage
- User satisfaction (5-star rating)

---

## Timeline

### Week 1: Foundation
- Set up extension scaffold
- Integrate web-features package
- Implement basic AI model connection (Claude)

### Week 2: Core Features
- Build chat panel UI
- Implement prompt builder with Baseline context
- Add feature discovery command

### Week 3: Refactoring
- Code analysis engine
- Suggestion generation
- Code actions and quick fixes

### Week 4: Polish & Testing
- Add Gemini and Ollama support
- Improve error handling
- Write documentation
- User testing

---

## Future Enhancements (Post-MVP)

1. **Automated PR Generation**
   - Generate pull requests with modernization suggestions
   - Include compatibility reports

2. **Team Collaboration**
   - Share Baseline reports across team
   - Track modernization progress

3. **Custom Rules**
   - Define project-specific feature preferences
   - Blacklist/whitelist specific features

4. **Performance Insights**
   - Show performance benefits of modern features
   - Track bundle size improvements

5. **Learning Mode**
   - Explain why features are suggested
   - Educational content about web features

---

## Resources

- [Web Platform Dashboard Baseline](https://web.dev/articles/web-platform-dashboard-baseline)
- [web-features npm package](https://www.npmjs.com/package/web-features)
- [VS Code API Documentation](https://code.visualstudio.com/api)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Baseline Status Definitions](https://github.com/web-platform-dx/web-features)

