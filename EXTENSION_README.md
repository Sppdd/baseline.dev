# Baseline.dev

> AI-powered code assistant specialized in web platform features and browser compatibility

Baseline.dev helps you discover, adopt, and refactor code using the latest web platform features, backed by official **Baseline** data from the Web Platform Dashboard.

## 🎯 What Makes Baseline.dev Different?

Unlike general AI coding assistants, Baseline.dev specializes in:

- **Timeline Awareness** - Knows when features became widely available
- **Official Data** - Uses authoritative web-features Baseline data
- **Browser Focus** - Specializes in compatibility and modernization
- **Multi-Model Support** - Choose Claude, Gemini, or local Ollama
- **Proactive Suggestions** - Recommends modern alternatives automatically

## ✨ Features

### 🤖 Interactive AI Chat
- Chat with an AI specialized in web platform features
- Context-aware responses based on your current file
- Supports code selection analysis
- Markdown-formatted responses with code examples

### 🔍 Feature Discovery
- Analyzes your project structure
- Suggests newly available Baseline features
- Prioritizes relevant features for your stack
- Generates detailed adoption reports

### ♻️ Code Refactoring
- Analyzes selected code or entire files
- Suggests modern alternatives to legacy patterns
- Provides before/after code examples
- Explains benefits and browser support

### ℹ️ Feature Status Check
- Quick lookup of any web feature
- Shows Baseline status (high/low/limited)
- Browser compatibility information
- Specification and documentation links

### ⚙️ Easy Configuration
- Setup wizard for API keys
- Model selection (Claude/Gemini/Ollama)
- Connection testing
- Secure key storage

## 🚀 Getting Started

### 1. Installation

Install from VS Code Marketplace or manually:

```bash
code --install-extension baseline-dev
```

### 2. Configuration

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Run `Baseline.dev: Configure`
3. Choose "Configure API Keys"
4. Select your preferred AI provider:
   - **Claude**: Get API key from [console.anthropic.com](https://console.anthropic.com/)
   - **Gemini**: Get API key from [makersuite.google.com](https://makersuite.google.com/)
   - **Ollama**: Install from [ollama.ai](https://ollama.ai/) (no API key needed)

### 3. First Use

**Open the Chat:**
- Press `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows/Linux)
- Or click "Baseline.dev" in the status bar
- Or run `Baseline.dev: Open Chat` from Command Palette

**Try asking:**
- "What are newly available CSS features?"
- "Can I use Container Queries in production?"
- "Modernize this JavaScript code" (with code selected)

## 📖 Usage Examples

### Discovering New Features

1. Open your project in VS Code
2. Command Palette → `Baseline.dev: Discover New Features`
3. Review the AI-generated report with personalized suggestions

### Refactoring Legacy Code

1. Select code you want to modernize
2. Right-click → `Baseline.dev: Refactor for Modern Browsers`
3. Review suggestions in the opened document
4. Apply changes that fit your browser targets

### Checking Feature Status

1. Command Palette → `Baseline.dev: Check Feature Status`
2. Type feature name (e.g., "view transitions")
3. View detailed Baseline status and browser support

### Chat Interactions

```
You: "Should I use Grid or Flexbox for this layout?"

Baseline.dev: Both CSS Grid and Flexbox are Baseline high (widely 
available). Here's when to use each:

Use Grid when:
- Creating two-dimensional layouts
- Need precise row and column control
[continues with examples...]
```

## ⚙️ Settings

Access via: `Preferences` → `Settings` → Search "Baseline.dev"

### AI Model
- `baselinedev.model`: Choose AI provider (claude/gemini/ollama)
- `baselinedev.claudeModel`: Claude model version
- `baselinedev.geminiModel`: Gemini model version
- `baselinedev.ollamaEndpoint`: Ollama server URL
- `baselinedev.ollamaModel`: Ollama model name

### Behavior
- `baselinedev.targetBrowsers`: Target browsers for compatibility
- `baselinedev.baselineThreshold`: Minimum Baseline status (high/low)
- `baselinedev.showStatusBar`: Show status bar item

## 🎹 Keyboard Shortcuts

- `Cmd+Shift+B` / `Ctrl+Shift+B` - Open Chat Panel
- `Ctrl+Enter` - Send message in chat (when focused)

## 🔒 Privacy & Security

- API keys are stored securely in VS Code's secret storage
- No data is logged or stored by the extension
- Code is only sent to your chosen AI provider when you explicitly request it
- Local Ollama models keep everything on your machine

## 🐛 Troubleshooting

### "API key not configured"
- Run `Baseline.dev: Configure` and set up your API key
- For Ollama, no API key is needed - just ensure Ollama is running

### "Connection test failed"
- Check your internet connection (for Claude/Gemini)
- Verify API key is correct
- For Ollama: ensure service is running (`ollama serve`)

### "Model not found" (Ollama)
- Pull the model first: `ollama pull codellama`
- Check available models: `ollama list`

### Chat not responding
- Check the Output panel (View → Output → Baseline.dev)
- Try testing connection: `Baseline.dev: Configure` → Test Connection

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/baselinedev/baseline-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/baselinedev/baseline-dev/discussions)

## 📚 Resources

- [Web Platform Dashboard](https://web.dev/baseline/)
- [web-features Package](https://www.npmjs.com/package/web-features)
- [Baseline Status Definitions](https://github.com/web-platform-dx/web-features)

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Web Platform Dashboard team for Baseline initiative
- web-features package maintainers
- VS Code extension API team
- Anthropic (Claude), Google (Gemini), and Ollama teams

---

**Made with ❤️ for web developers who want to build with confidence**

*Using official Baseline data to help you adopt modern web features safely*

