# Change Log

All notable changes to the Baseline.dev extension will be documented in this file.

## [0.1.0] - Initial Release

### Added
- 🎯 Interactive AI chat panel for web features assistance
- 🔍 Feature discovery command to find newly available Baseline features
- ♻️ Code refactoring suggestions for modern browsers
- ℹ️ Feature status checker with detailed Baseline information
- ⚙️ Configuration wizard for API keys and model selection
- 🤖 Multi-model support:
  - Anthropic Claude (3.5 Sonnet, Opus, Sonnet, Haiku)
  - Google Gemini (Pro, Pro Vision)
  - Ollama (local models)
- 📊 Integration with official web-features Baseline data
- 🌐 Browser compatibility checking
- 📝 Context-aware AI responses using current file and selection
- ⌨️ Keyboard shortcuts (Cmd/Ctrl+Shift+B for chat)
- 🎨 VS Code theme-aware UI

### Features
- **Chat Panel**: Conversational interface with AI assistant specialized in web features
- **Discovery**: Analyzes projects and suggests newly available features
- **Refactoring**: Provides modernization suggestions based on Baseline data
- **Feature Check**: Quick lookup of any web feature's status and support
- **Configuration**: Easy setup wizard for API keys and preferences

### Known Limitations
- Chat history is not persisted between sessions
- Limited to web platform features (HTML, CSS, JavaScript)
- Requires internet connection for Claude and Gemini models

### Requirements
- VS Code 1.80.0 or higher
- API key for Claude or Gemini (unless using Ollama)
- For Ollama: Local Ollama installation with downloaded models

---

## Future Releases

### Planned for v0.2.0
- Hover tooltips showing feature status
- Inline diagnostics for outdated code
- Quick fix actions
- Persistent chat history
- Export reports as PDF

### Planned for v0.3.0
- Project-wide analysis dashboard
- Feature adoption tracking
- Team collaboration features
- Integration with browserslist

### Planned for v0.4.0
- Automated PR generation
- CI/CD integration
- Performance impact analysis
- Custom rule configuration

