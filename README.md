# Baseline.dev

## 📋 Overview


This repository contains **complete planning and implementation documentation** for building a VS Code extension that serves as an AI code assistant specialized in web platform features and browser compatibility.

**Project Goal:** Create an MVP VS Code extension that helps developers discover, adopt, and refactor code using the latest web platform features, powered by the official **Baseline** data from the Web Platform Dashboard.

---

## 🎯 What Makes This Different?

Unlike general-purpose AI coding assistants (Cursor, Copilot, etc.), this extension:

1. **Understands Web Platform Timeline** - Knows when features became "Baseline" (widely available)
2. **Browser-Focused Intelligence** - Specializes in compatibility and modernization
3. **Official Data Source** - Uses `web-features` npm package with authoritative data
4. **Multi-Model Support** - Users choose: Claude, Gemini, or Ollama local models
5. **Proactive Modernization** - Suggests upgrading legacy patterns to modern equivalents

### The Unique Selling Proposition (USP)

> **"The only AI code assistant that understands the web platform timeline"**

---

## 📁 Repository Contents

### 1. **PROJECT_PLAN.md** - Strategic Overview
- Complete project vision and architecture
- MVP feature set definition
- Technical components breakdown
- Implementation timeline (4-week roadmap)
- Success metrics and future enhancements

**Use this for:** Understanding the big picture, project scope, and long-term vision

### 2. **CLAUDE_PROMPT.md** - Complete Implementation Guide
- **The main document for development**
- Detailed technical specifications
- Complete code examples for every component
- File structure and organization
- Configuration details
- Security considerations
- Testing strategy

**Use this for:** Actual development - copy/paste to Claude for building the MVP

### 3. **QUICK_START_GUIDE.md** - Quick Reference
- Visual architecture diagram
- MVP feature checklist
- Week-by-week development roadmap
- Command references
- User experience flows
- Launch checklist

**Use this for:** Quick reference during development, tracking progress

### 4. **package.json.template** - Extension Manifest
- Complete VS Code extension configuration
- All commands and settings defined
- Dependencies listed
- Scripts for build/test/publish

**Use this for:** Copy to `package.json` to start development immediately

---

## 🚀 How to Use This Repository

### Option 1: Build It Yourself

1. **Read PROJECT_PLAN.md** to understand the vision
2. **Use CLAUDE_PROMPT.md** to build the extension
3. **Reference QUICK_START_GUIDE.md** for quick lookups
4. **Copy package.json.template** to start

### Option 2: Use Claude to Build It

1. Copy the entire **CLAUDE_PROMPT.md** content
2. Paste it into Claude (or Claude Code/Cursor)
3. Say: "Build this VS Code extension following these specifications"
4. Claude will generate all the code files

### Option 3: Phased Approach

**Week 1:** Foundation
```bash
# Start with basic extension structure
# Integrate web-features package
# Connect to one AI model (Claude)
```

**Week 2:** Chat Interface
```bash
# Build webview panel
# Implement message handling
# Test end-to-end conversation
```

**Week 3:** Feature Discovery
```bash
# Add "Discover Features" command
# Query Baseline data
# Generate reports
```

**Week 4:** Polish & Launch
```bash
# Add remaining AI models
# Documentation
# Testing
# Package for distribution
```

---

## 🎨 Key Features to Implement

### Core MVP Features

1. **Interactive Chat Panel**
   - Webview-based UI
   - Context-aware responses
   - File/code attachment support

2. **Feature Discovery Command**
   - Analyzes current project
   - Suggests newly available Baseline features
   - Provides implementation guidance

3. **Smart Refactoring**
   - Detects legacy patterns
   - Suggests modern alternatives
   - Checks Baseline compatibility

4. **Feature Status Checker**
   - Query any web feature
   - Display Baseline status
   - Show browser support data

5. **Multi-Model Support**
   - Claude (Anthropic)
   - Gemini (Google)
   - Ollama (local models)

---

## 🛠️ Technology Stack

### Core Dependencies
```json
{
  "web-features": "^1.0.0",           // Official Baseline data
  "@anthropic-ai/sdk": "^0.27.0",     // Claude AI
  "@google/generative-ai": "^0.18.0", // Gemini AI
  "axios": "^1.7.0"                   // Ollama HTTP client
}
```

### Development Tools
```json
{
  "@types/vscode": "^1.80.0",   // VS Code API types
  "typescript": "^5.x",         // TypeScript
  "webpack": "^5.x",            // Bundler
  "@vscode/vsce": "^2.x"        // Extension packager
}
```

---

## 📊 Project Timeline

### MVP Development: 4 Weeks

| Week | Focus Area | Deliverables |
|------|-----------|-------------|
| 1 | Foundation | Extension scaffold, web-features integration, Claude provider |
| 2 | Chat UI | Webview panel, message handling, prompt builder |
| 3 | Features | Discovery command, refactoring engine, Baseline queries |
| 4 | Polish | Gemini/Ollama support, docs, testing, packaging |

**Total Estimated Time:** 80-100 hours of development

---

## 🎯 Success Criteria

The MVP is complete when:

✅ Extension installs and activates in VS Code  
✅ Chat panel opens and responds intelligently  
✅ Users can switch between AI models  
✅ "Discover Features" generates useful reports  
✅ Baseline data loads and queries correctly  
✅ Basic refactoring suggestions work  
✅ Configuration UI is functional  
✅ Documentation is complete  

---

## 🔐 Security Considerations

- API keys stored in VS Code secret storage (not plain text)
- All user inputs validated and sanitized
- Rate limiting for AI API calls
- No sensitive data logged
- Privacy policy documented

---

## 📚 Essential Resources

### Official Documentation
- [Web Platform Dashboard Baseline](https://web.dev/articles/web-platform-dashboard-baseline)
- [web-features npm package](https://www.npmjs.com/package/web-features)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)

### AI Provider Documentation
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)

---

## 🎓 Example Use Cases

### Use Case 1: Discovering Container Queries
```
Developer: Opens CSS file with media queries
Command: "WebFeature AI: Discover New Features"
Extension: Detects Container Queries are now Baseline
AI: Suggests replacing media queries with container queries
Result: Modern, more maintainable CSS
```

### Use Case 2: Modernizing Polyfills
```
Developer: Selects fetch polyfill code
Command: "Refactor for Modern Browsers"
Extension: Checks fetch Baseline status (high since 2017)
AI: Suggests removing polyfill, using native fetch
Result: Smaller bundle, native performance
```

### Use Case 3: Feature Exploration
```
Developer: Opens chat panel
Question: "Can I use View Transitions API?"
Extension: Queries web-features database
AI: Responds with:
  - Baseline status: Limited (2024-03)
  - Browser support: Chrome 111+, Edge 111+
  - Code example with fallback
Result: Informed decision with implementation guide
```

---

## 🚦 Getting Started (Quick Setup)

### 1. Initialize Project
```bash
cd /Users/etharo/Desktop/base-dev
cp package.json.template package.json
npm install
```

### 2. Create TypeScript Config
```bash
npx tsc --init
```

### 3. Create Directory Structure
```bash
mkdir -p src/{ai/providers,baseline,ui,commands,utils}
mkdir -p media/styles
```

### 4. Start Coding
Follow **CLAUDE_PROMPT.md** for complete implementation details.

### 5. Test Extension
```bash
npm run compile
# Press F5 in VS Code to open Extension Development Host
```

---

## 📈 Post-MVP Roadmap

### Version 0.2.0 - Enhanced UX
- Hover providers for instant feature info
- Inline diagnostics for outdated patterns
- Quick fix code actions

### Version 0.3.0 - Team Features
- Project-wide analysis dashboard
- Feature adoption tracking
- Shareable reports

### Version 0.4.0 - Automation
- Automated PR generation
- CI/CD integration
- Performance insights

---

## 🤝 Contributing

This is a project template/plan. If you build this extension:

1. Follow the specifications in **CLAUDE_PROMPT.md**
2. Test thoroughly with real projects
3. Document any deviations or improvements
4. Consider open-sourcing the result

---

## 📄 License

This documentation is provided as-is for educational and development purposes.

The web-features package is maintained by the Web Platform Dashboard team.

---

## 🙏 Acknowledgments

- **Web Platform Dashboard Team** - For the Baseline initiative
- **web-features Maintainers** - For the excellent npm package
- **VS Code Team** - For comprehensive extension APIs
- **Anthropic, Google, Ollama** - For AI model APIs

---

## 📞 Next Steps

1. **Review** all documentation files
2. **Choose** your development approach (manual or AI-assisted)
3. **Set up** your development environment
4. **Start** with CLAUDE_PROMPT.md as your implementation guide
5. **Build** the MVP following the 4-week roadmap
6. **Test** with real web development projects
7. **Package** and publish to VS Code Marketplace
8. **Iterate** based on user feedback

---

## 💡 Questions?

Refer to:
- **PROJECT_PLAN.md** for strategic questions
- **CLAUDE_PROMPT.md** for technical implementation
- **QUICK_START_GUIDE.md** for quick reference
- Official VS Code and web-features documentation

---

**Ready to build the future of web development tooling? Start with CLAUDE_PROMPT.md!** 🚀

---

## 📊 Project Status

**Status:** 📝 Planning Complete - Ready for Development

**Next Action:** Copy CLAUDE_PROMPT.md to Claude and begin implementation

**Target MVP Date:** 4 weeks from start

**Complexity:** Medium (estimated 80-100 hours)

**Value Proposition:** High - Unique positioning in AI coding assistant market

---

*Last Updated: October 5, 2025*

