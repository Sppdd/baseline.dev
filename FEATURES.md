# 🚀 Baseline.dev - Features Quick Reference

## 🎨 New UI Design

### Teal/Green Theme
The extension now features a professional teal/green color scheme matching the icon:
- **User Messages**: Solid teal background (`#16a085`)
- **AI Messages**: Light teal with border
- **Buttons**: Teal with hover effects
- **Code Blocks**: Green accent borders

---

## 💾 File Editing Workflow

### Complete 3-Step Process

#### Step 1: Attach a File
```
1. Open file in VS Code editor
2. Open Baseline.dev Chat (Cmd/Ctrl+Shift+B)
3. Click "📎 Attach File"
4. See indicator: "📎 filename.js" at top
```

#### Step 2: Request Changes
```
1. Type your request in chat
   Example: "Convert this to TypeScript"
   Example: "Add error handling"
   Example: "Refactor using modern syntax"

2. Press Cmd/Ctrl+Enter to send
3. AI analyzes your file and responds
```

#### Step 3: Apply Changes
```
When AI responds with code, you'll see two buttons:

┌─────────────────────────────────────┐
│  💾 Save as New File               │  ← Creates new file
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✏️ Overwrite filename.js          │  ← Updates original
└─────────────────────────────────────┘
```

---

## 🎯 Use Cases

### Use Case 1: Safe Refactoring
```
Goal: Try a refactoring without touching original

1. Attach your file
2. Ask: "Refactor this using modern patterns"
3. Click "💾 Save as New File"
4. Compare both versions
5. Keep the one you prefer
```

### Use Case 2: Quick Updates
```
Goal: Update file directly

1. Attach file
2. Ask: "Add JSDoc comments"
3. Review AI's response
4. Click "✏️ Overwrite filename.js"
5. Confirm
6. File updated automatically
```

### Use Case 3: Learning Modern Features
```
Goal: Learn new web features

1. Ask: "What are the new CSS features in 2024?"
2. Review AI's explanation
3. Ask: "Show me an example"
4. Click "💾 Save as New File"
5. Name it "modern-css-example.css"
6. Experiment with the code
```

### Use Case 4: Code Translation
```
Goal: Convert JavaScript to TypeScript

1. Attach your .js file
2. Ask: "Convert this to TypeScript with strict types"
3. Click "💾 Save as New File"
4. Save as "filename.ts"
5. Now you have both versions
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Chat | `Cmd/Ctrl+Shift+B` |
| Send Message | `Cmd/Ctrl+Enter` |
| Close Panel | `Esc` |

---

## 🎨 UI Elements Explained

### Chat Interface

```
┌────────────────────────────────────────┐
│  Baseline.dev Chat              ✕      │
├────────────────────────────────────────┤
│                                        │
│  ┌───────────────────────────────┐    │
│  │ Welcome to Baseline.dev! 🎯   │    │  ← AI Message
│  │ How can I help you today?     │    │    (Light teal)
│  └───────────────────────────────┘    │
│                                        │
│                  ┌──────────────────┐  │
│                  │ Refactor this    │  │  ← User Message
│                  │ code             │  │    (Solid teal)
│                  └──────────────────┘  │
│                                        │
│  ┌───────────────────────────────┐    │
│  │ Here's a refactored version:  │    │  ← AI with Code
│  │ ```javascript                 │    │
│  │ const modern = () => {...}    │    │
│  │ ```                           │    │
│  │                               │    │
│  │ ┌──────────────┐ ┌─────────┐ │    │
│  │ │💾 Save as New│ │✏️ Overwrite│ │    │  ← Action Buttons
│  │ └──────────────┘ └─────────┘ │    │
│  └───────────────────────────────┘    │
│                                        │
├────────────────────────────────────────┤
│  📎 my-file.js                         │  ← File Indicator
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Ask about web features...      │   │  ← Input Field
│  │                                │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌─────────┐  ┌──────────────┐        │
│  │✨ Send   │  │📎 Attach File │        │  ← Action Buttons
│  └─────────┘  └──────────────┘        │
└────────────────────────────────────────┘
```

---

## 🔒 Safety Features

### Confirmation Dialogs
- **Overwrite**: Always asks for confirmation
- **New File**: Prompts for filename
- **Clear indication**: Shows which file will be affected

### Smart Code Extraction
- Automatically finds code blocks in AI responses
- Handles markdown formatting
- Falls back to full text if no code blocks

### Error Handling
- Clear error messages
- Graceful fallbacks
- User-friendly notifications

---

## 💡 Pro Tips

### 1. Incremental Refinement
Don't accept the first response. Refine it:
```
You: Refactor this code
AI: [provides code]
You: Add error handling and TypeScript types
AI: [provides improved code]
You: Perfect! [Apply]
```

### 2. Context Matters
Attach the file before asking questions:
```
✅ Good: Attach file → Ask about it
❌ Less good: Ask → Then attach file
```

### 3. Specific Requests
Be specific for better results:
```
❌ "Improve this"
✅ "Convert to async/await, add try-catch, use const/let instead of var"
```

### 4. Use Save as New for Experiments
```
✅ "Save as New" → Experiment → Compare → Keep best
❌ "Overwrite" immediately → Can't undo easily
```

### 5. Commit First
```
Before overwriting:
1. git add .
2. git commit -m "Before AI refactoring"
3. Now click "Overwrite" safely
```

---

## 🎯 Feature Matrix

| Feature | Available | Notes |
|---------|-----------|-------|
| Chat Interface | ✅ | Teal/green themed |
| File Attachment | ✅ | One at a time |
| Save as New File | ✅ | Creates new file |
| Overwrite File | ✅ | Updates attached file |
| Code Extraction | ✅ | From markdown blocks |
| Animations | ✅ | Powered by anime.js |
| Keyboard Shortcuts | ✅ | Cmd/Ctrl+Enter |
| Multiple Files | ❌ | Coming in v0.2.0 |
| Diff View | ❌ | Coming in v0.2.0 |
| Undo/Redo | ❌ | Use git for now |

---

## 📊 When to Use Each Feature

### Use "Save as New File" When:
- ✅ Trying experimental refactorings
- ✅ Learning new patterns
- ✅ Creating examples
- ✅ Comparing approaches
- ✅ Not sure if changes are good

### Use "Overwrite File" When:
- ✅ Sure about the changes
- ✅ Adding comments/documentation
- ✅ Fixing obvious bugs
- ✅ Updating to new API
- ✅ Have git backup

### Use "Attach File" When:
- ✅ Asking about specific code
- ✅ Requesting refactoring
- ✅ Getting modernization suggestions
- ✅ Checking compatibility
- ✅ Learning about features

---

## 🚫 What NOT to Do

### Don't:
- ❌ Overwrite without reviewing AI code
- ❌ Apply suggestions to production code without testing
- ❌ Skip git commits before overwriting
- ❌ Attach sensitive files (API keys, passwords)
- ❌ Trust AI blindly - always review

### Do:
- ✅ Review all AI-generated code
- ✅ Test changes thoroughly
- ✅ Use version control
- ✅ Ask AI to explain unclear code
- ✅ Iterate on suggestions

---

## 📱 Quick Command Reference

### Essential Commands
```
Cmd/Ctrl+Shift+P → "Baseline.dev: Open Chat"
Cmd/Ctrl+Shift+P → "Baseline.dev: Discover New Features"
Cmd/Ctrl+Shift+P → "Baseline.dev: Refactor for Modern Browsers"
Cmd/Ctrl+Shift+P → "Baseline.dev: Check Feature Status"
Cmd/Ctrl+Shift+P → "Baseline.dev: Configure"
Cmd/Ctrl+Shift+P → "Baseline.dev: Refresh Baseline Data"
```

---

## 🎓 Example Prompts

### For Refactoring
```
"Convert this to use async/await"
"Refactor using modern ES6+ features"
"Replace callbacks with Promises"
"Add proper error handling"
"Convert to TypeScript"
```

### For Learning
```
"What are CSS Container Queries?"
"Show me how to use the Fetch API"
"Can I use View Transitions in production?"
"What's new in JavaScript 2024?"
"Explain CSS Subgrid with examples"
```

### For Modernization
```
"Replace jQuery with vanilla JavaScript"
"Update this to use CSS Grid instead of floats"
"Modernize this code for 2024 browsers"
"Remove polyfills for baseline features"
"Use modern CSS features"
```

---

## 🎉 Summary

Baseline.dev now provides:
- 🎨 **Beautiful UI** - Professional teal/green design
- 💾 **One-Click Apply** - Save or overwrite with one click
- 📎 **Smart File Handling** - Attach, analyze, apply
- ✨ **Smooth Animations** - Delightful user experience
- 🔒 **Safe Operations** - Confirmations and error handling

**Start using it now: `Cmd/Ctrl+Shift+B`**

---

*For detailed setup instructions, see [README.md](README.md)*

