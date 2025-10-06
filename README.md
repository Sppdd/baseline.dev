# Baseline.dev - AI Code Assistant for Web Platform Features

<div align="center">
  
![Baseline.dev](media/icon.png)

**The AI code assistant that understands the web platform timeline**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-16a085.svg)](https://code.visualstudio.com/)

</div>

---

## 📋 Overview

Baseline.dev is a VS Code extension that provides AI-powered assistance specialized in web platform features and browser compatibility. Unlike general-purpose coding assistants, Baseline.dev understands when web features became "Baseline" (widely available across major browsers) and helps you modernize your code accordingly.

### ✨ Key Features

- 🤖 **AI Chat Interface** - Interactive chat with context-aware responses about web features
- 🔍 **Feature Discovery** - Discover newly available web platform features for your project
- ♻️ **Smart Refactoring** - Modernize legacy code patterns with Baseline-compatible alternatives
- 📊 **Feature Status Checker** - Query any web feature's Baseline status and browser support
- 🎯 **Multi-Model Support** - Choose between Claude (Anthropic), Gemini (Google), or Ollama (local)
- 🌐 **Real-Time Data** - Fetches latest Baseline data from Web Platform Dashboard API
- 📎 **File Attachment** - Attach files for AI analysis and get code suggestions
- ✅ **Apply Changes** - Accept AI suggestions to create new files or overwrite existing ones

---

## 🚀 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/baseline-dev.git
   cd baseline-dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Open in VS Code**
   ```bash
   code .
   ```

5. **Run the extension**
   - Press `F5` to open Extension Development Host
   - Or use Debug menu: "Run > Start Debugging"

### From VS Code Marketplace (Coming Soon)

Once published, search for "Baseline.dev" in VS Code Extensions marketplace.

---

## ⚙️ Setup & Configuration

### 1. Choose Your AI Model

Baseline.dev supports three AI providers. Choose one based on your preference:

#### Option A: Claude (Anthropic) - Recommended

1. **Get API Key**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Navigate to "API Keys"
   - Create a new API key

2. **Configure in VS Code**
   - Open Command Palette (`Cmd/Ctrl+Shift+P`)
   - Run: `Baseline.dev: Configure`
   - Select "Claude" as the model
   - Enter your API key when prompted
   - Choose model version (default: `claude-3-5-sonnet-20241022`)

3. **Verify Setup**
   - Open chat: `Cmd/Ctrl+Shift+B`
   - Send a test message

#### Option B: Gemini (Google)

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Configure in VS Code**
   - Run: `Baseline.dev: Configure`
   - Select "Gemini" as the model
   - Enter your API key
   - Choose model version (default: `gemini-1.5-flash`)

#### Option C: Ollama (Local Models)

1. **Install Ollama**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl https://ollama.ai/install.sh | sh
   
   # Windows: Download from https://ollama.ai
   ```

2. **Pull a Model**
   ```bash
   ollama pull codellama
   # Or other models: mistral, llama2, deepseek-coder
   ```

3. **Start Ollama Server**
   ```bash
   ollama serve
   # Runs on http://localhost:11434 by default
   ```

4. **Configure in VS Code**
   - Run: `Baseline.dev: Configure`
   - Select "Ollama" as the model
   - Verify endpoint: `http://localhost:11434`
   - Enter model name: `codellama` (or your chosen model)

---

### 2. Configure Target Browsers

Set which browsers you're targeting for compatibility checks:

1. **Open VS Code Settings** (`Cmd/Ctrl+,`)
2. Search for "Baseline.dev"
3. Configure:
   ```json
   {
     "baselinedev.targetBrowsers": ["chrome", "firefox", "safari", "edge"],
     "baselinedev.baselineThreshold": "high", // or "low"
     "baselinedev.useRealTimeData": true  // Fetch latest data
   }
   ```

**Threshold Meanings:**
- `high` - Feature available in all major browsers (highest compatibility)
- `low` - Feature available in some browsers (moderate compatibility)

---

## 📖 How to Use

### Interactive Chat

**Open the chat panel:**
- Keyboard: `Cmd/Ctrl+Shift+B`
- Command Palette: `Baseline.dev: Open Chat`

**Ask about web features:**
```
You: Can I use Container Queries in production?
AI: Container Queries became Baseline in late 2020...

You: Show me how to use CSS Subgrid
AI: Subgrid is Baseline (high) since 2024-03...
```

**Attach files for analysis:**
1. Click "📎 Attach File" button
2. AI receives your current file context
3. Ask questions about the code
4. Get suggestions for improvements

**Apply AI suggestions:**
1. After AI provides code suggestions
2. Click "💾 Save as New File" to create a new file
3. Or click "✏️ Overwrite [filename]" to replace the attached file
4. Review changes before accepting

### Feature Discovery

**Discover newly available features:**

1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Run: `Baseline.dev: Discover New Features`
3. Choose time range (e.g., "Last 6 months")
4. View report of newly Baseline features
5. Ask AI for implementation examples

### Smart Refactoring

**Modernize legacy code:**

1. Select code in your editor
2. Right-click → "Baseline.dev: Refactor for Modern Browsers"
3. Or use Command Palette
4. AI analyzes and suggests modern alternatives
5. Apply changes with one click

### Feature Status Check

**Check specific feature status:**

1. Run: `Baseline.dev: Check Feature Status`
2. Enter feature name (e.g., "CSS Grid", "Fetch API")
3. View:
   - Baseline status (widely/newly/limited)
   - Browser support details
   - Availability dates
   - Specification links

### Refresh Data

**Update to latest Baseline data:**

1. Run: `Baseline.dev: Refresh Baseline Data`
2. Extension fetches latest from Web Platform Dashboard API
3. Cache is cleared for fresh queries

---

## 🎨 UI Features

### Modern, Interactive Design
- **Smooth Animations** - Powered by anime.js for delightful interactions
- **Teal/Green Theme** - Matches Baseline.dev branding
- **Message Bubbles** - Clear distinction between user and AI
- **Code Highlighting** - Syntax-highlighted code blocks
- **Auto-scroll** - Smooth scroll to latest messages
- **Loading Indicators** - Animated dots while AI is thinking

### Keyboard Shortcuts
- `Cmd/Ctrl+Enter` - Send message
- `Cmd/Ctrl+Shift+B` - Open chat panel
- `Esc` - Close panels

---

## 🏗️ Architecture

### Core Components

```
src/
├── ai/                      # AI Model Integration
│   ├── ModelManager.ts      # Multi-model orchestration
│   ├── PromptBuilder.ts     # Context-aware prompts
│   └── providers/           # AI provider implementations
│       ├── ClaudeProvider.ts
│       ├── GeminiProvider.ts
│       └── OllamaProvider.ts
├── baseline/                # Baseline Data Management
│   ├── BaselineAPI.ts       # 3-tier API with fallbacks
│   ├── FeatureDatabase.ts   # Local feature database
│   └── types.ts             # Type definitions
├── commands/                # VS Code Commands
│   ├── openChat.ts
│   ├── discoverFeatures.ts
│   ├── refactorModern.ts
│   ├── checkFeature.ts
│   ├── configure.ts
│   └── refreshData.ts
├── ui/                      # User Interface
│   └── ChatPanel.ts         # Main chat webview
└── extension.ts             # Extension entry point
```

### Data Sources

**3-Tier Fallback System:**

1. **Web Platform Dashboard API** (Primary)
   - Real-time, always current
   - Advanced query syntax
   - `https://api.webstatus.dev/v1/features`

2. **GitHub Raw URL** (Fallback)
   - Direct from source repository
   - `https://raw.githubusercontent.com/web-platform-dx/web-features/`

3. **Local NPM Package** (Offline)
   - Works without internet
   - Fast, reliable
   - `web-features` npm package

---

## 🧪 Development

### Build & Watch

```bash
# Compile once
npm run compile

# Watch mode (auto-compile on save)
npm run watch

# Lint code
npm run lint
```

### Testing

```bash
# Run in Extension Development Host
# Press F5 in VS Code

# Test commands
1. Open chat panel
2. Send messages
3. Attach files
4. Test feature discovery
5. Try refactoring
```

### Packaging

```bash
# Create .vsix package
npm run package

# Install locally
code --install-extension baseline-dev-0.1.0.vsix
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Clone your fork
3. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
   ```bash
   git commit -m "Add: Amazing feature description"
   ```
7. Push to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
8. Open a Pull Request

### Contribution Guidelines

- **Code Style**: Follow existing TypeScript conventions
- **Commits**: Use clear, descriptive commit messages
- **Testing**: Test all changes in Extension Development Host
- **Documentation**: Update README if adding features
- **API Keys**: Never commit API keys or secrets

### Areas for Contribution

- 🎨 UI/UX improvements
- 🔌 New AI provider integrations
- 📊 Additional data visualizations
- 🌍 Internationalization
- 🧪 Test coverage
- 📝 Documentation improvements

---

## 📚 Resources

### Official Documentation
- [Web Platform Dashboard Baseline](https://web.dev/articles/web-platform-dashboard-baseline)
- [web-features Package](https://www.npmjs.com/package/web-features)
- [VS Code Extension API](https://code.visualstudio.com/api)

### AI Provider Documentation
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Ollama Documentation](https://github.com/ollama/ollama)

### Community
- [Baseline.dev Website](https://baseline.dev)
- [GitHub Issues](https://github.com/yourusername/baseline-dev/issues)
- [Discussions](https://github.com/yourusername/baseline-dev/discussions)

---

## 🔒 Privacy & Security

### API Key Storage
- Keys stored in VS Code **Secret Storage** (encrypted)
- Never stored in plain text or settings files
- Never logged or transmitted except to respective AI providers

### Data Handling
- User code only sent to AI when explicitly requested
- No telemetry or analytics collected
- All processing happens locally or via your chosen AI provider
- No data stored on external servers

### Best Practices
- Keep API keys confidential
- Review code suggestions before applying
- Use Ollama for sensitive projects (local processing)
- Regularly update the extension

---

## 🐛 Troubleshooting

### Chat Not Responding

**Problem:** Messages sent but no AI response

**Solutions:**
1. Check API key is configured: `Baseline.dev: Configure`
2. Verify internet connection (for Claude/Gemini)
3. Check Ollama is running: `ollama serve` (for Ollama)
4. View Output panel: "Baseline.dev" for errors
5. Try refreshing: Reload VS Code window

### Feature Data Not Loading

**Problem:** "Failed to load features" error

**Solutions:**
1. Check internet connection
2. Run: `Baseline.dev: Refresh Baseline Data`
3. Check VS Code Output panel for specific errors
4. Extension will fallback to local package automatically

### Ollama Connection Failed

**Problem:** Cannot connect to Ollama

**Solutions:**
1. Verify Ollama is installed: `ollama --version`
2. Start Ollama server: `ollama serve`
3. Check endpoint in settings: `http://localhost:11434`
4. Try pulling model again: `ollama pull codellama`

### Apply Changes Not Working

**Problem:** "Save as New File" button doesn't work

**Solutions:**
1. Ensure you've attached a file first
2. Check AI response contains code blocks
3. Try asking AI to reformat response as code
4. Manually copy/paste if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Web Platform Dashboard Team** - For the Baseline initiative
- **web-features Maintainers** - For the authoritative data package
- **Anthropic, Google, Ollama** - For AI model APIs
- **VS Code Team** - For comprehensive extension APIs
- **anime.js** - For smooth UI animations

---

## 🗺️ Roadmap

### Current Version: 0.1.0
- ✅ Interactive chat with AI
- ✅ Multi-model support (Claude, Gemini, Ollama)
- ✅ Feature discovery and status checking
- ✅ Smart refactoring suggestions
- ✅ File attachment and apply changes
- ✅ Real-time Baseline data

### Upcoming: 0.2.0
- 🔄 Hover providers for instant feature info
- 🔄 Inline diagnostics for outdated patterns
- 🔄 Quick fix code actions
- 🔄 Project-wide analysis dashboard

### Future: 0.3.0+
- 📋 Team collaboration features
- 🤖 Automated PR generation
- 📊 Performance insights
- 🌍 Multi-language support

---

## 💬 Support

Need help? Here's how to get support:

- 📖 **Documentation**: Check this README first
- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/baseline-dev/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/baseline-dev/discussions)
- 📧 **Email**: support@baseline.dev (for sensitive issues)

---

## ⭐ Show Your Support

If you find Baseline.dev useful:

- ⭐ Star the repository
- 🐦 Share on Twitter
- 📝 Write a blog post
- 🤝 Contribute code or documentation
- 💬 Tell your colleagues

---

<div align="center">

**Built with ❤️ for the web development community**

[Website](https://baseline.dev) • [GitHub](https://github.com/yourusername/baseline-dev) • [VS Code Marketplace](#)

</div>
