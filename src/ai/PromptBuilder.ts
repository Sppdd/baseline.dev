/**
 * Prompt Builder - Constructs context-rich prompts for AI models
 */

import { FeatureDatabase } from '../baseline/FeatureDatabase';
import { WebFeature } from '../baseline/types';

export class PromptBuilder {
    constructor(private featureDb: FeatureDatabase) {}

    /**
     * Build the system prompt that defines the AI assistant's role
     */
    buildSystemPrompt(): string {
        const dataSource = this.featureDb.isUsingRealTimeData() 
            ? 'REAL-TIME API (latest from web-features repository)' 
            : 'local package (may be slightly outdated)';
        const lastFetch = this.featureDb.getLastFetchTime();
        const fetchInfo = lastFetch ? `Last updated: ${lastFetch.toLocaleString()}` : '';

        return `You are Baseline.dev, an expert AI assistant specialized in web platform features and browser compatibility.

Your core competencies:
- Discovering and recommending newly available web features
- Refactoring code for modern browsers
- Checking browser compatibility using official Baseline data
- Replacing outdated patterns with modern alternatives
- Helping developers adopt experimental features when appropriate
- Starting new projects with specific web features

You have access to the official web-features Baseline database via ${dataSource}.
${fetchInfo}

The Baseline database provides:
- Feature availability status (baseline high/low, or limited availability)
- Browser support information
- Timeline of when features became widely available
- Specification links and documentation

When providing recommendations:
1. Always check Baseline status first
2. Prefer "baseline: high" features for production use
3. Clearly indicate browser support and compatibility
4. Provide both old and new code examples when refactoring
5. Explain the benefits and tradeoffs of changes
6. For experimental features, warn about limited support
7. Consider the user's target browsers

Communication style:
- Be concise and practical
- Focus on code and actionable advice
- Use markdown for code examples
- Cite Baseline status and dates when relevant
- Be honest about browser limitations

Remember: You're helping developers modernize their web projects with confidence, backed by official platform data.`;
    }

    /**
     * Build a user prompt with file context
     */
    async buildUserPromptWithContext(
        userMessage: string,
        options: {
            code?: string;
            fileName?: string;
            languageId?: string;
            relevantFeatures?: WebFeature[];
            targetBrowsers?: string[];
        } = {}
    ): Promise<string> {
        let prompt = userMessage;

        // Add file context
        if (options.fileName) {
            prompt += `\n\n**File:** ${options.fileName}`;
        }

        if (options.languageId) {
            prompt += `\n**Language:** ${options.languageId}`;
        }

        // Add code snippet
        if (options.code) {
            const lang = options.languageId || '';
            prompt += `\n\n**Code:**\n\`\`\`${lang}\n${options.code}\n\`\`\``;
        }

        // Add target browsers
        if (options.targetBrowsers && options.targetBrowsers.length > 0) {
            prompt += `\n\n**Target Browsers:** ${options.targetBrowsers.join(', ')}`;
        }

        // Add relevant Baseline features
        if (options.relevantFeatures && options.relevantFeatures.length > 0) {
            prompt += '\n\n**Relevant Baseline Features:**';
            
            for (const feature of options.relevantFeatures) {
                prompt += `\n\n- **${feature.name}** (\`${feature.id}\`)`;
                
                if (feature.status?.baseline) {
                    prompt += `\n  - Status: Baseline ${feature.status.baseline}`;
                    
                    const dateKey = feature.status.baseline === 'high' 
                        ? 'baseline_high_date' 
                        : 'baseline_low_date';
                    
                    if (feature.status[dateKey]) {
                        prompt += `\n  - Available since: ${feature.status[dateKey]}`;
                    }
                } else {
                    prompt += `\n  - Status: Limited availability`;
                }

                if (feature.description) {
                    prompt += `\n  - ${feature.description}`;
                }
            }
        }

        return prompt;
    }

    /**
     * Build a prompt for feature discovery
     */
    async buildDiscoveryPrompt(
        projectContext: {
            hasPackageJson?: boolean;
            hasHtml?: boolean;
            hasCss?: boolean;
            hasJavaScript?: boolean;
            hasTypeScript?: boolean;
            frameworks?: string[];
        },
        newFeatures: WebFeature[]
    ): Promise<string> {
        let prompt = `Analyze this web project and suggest how to adopt newly available Baseline features.\n\n`;

        // Project context
        prompt += `**Project Context:**\n`;
        if (projectContext.hasPackageJson) {
            prompt += `- Has package.json (Node.js project)\n`;
        }
        if (projectContext.frameworks && projectContext.frameworks.length > 0) {
            prompt += `- Frameworks: ${projectContext.frameworks.join(', ')}\n`;
        }
        if (projectContext.hasHtml) prompt += `- Contains HTML files\n`;
        if (projectContext.hasCss) prompt += `- Contains CSS files\n`;
        if (projectContext.hasJavaScript) prompt += `- Contains JavaScript files\n`;
        if (projectContext.hasTypeScript) prompt += `- Contains TypeScript files\n`;

        // New features
        prompt += `\n**Recently Available Baseline Features (last 12 months):**\n`;
        
        for (const feature of newFeatures.slice(0, 15)) {
            const date = feature.status?.baseline_high_date || feature.status?.baseline_low_date;
            prompt += `- ${feature.name} (${feature.id}) - ${date}\n`;
        }

        prompt += `\n**Task:**\n`;
        prompt += `1. Identify the top 3-5 most relevant features for this project\n`;
        prompt += `2. Explain why each feature would be beneficial\n`;
        prompt += `3. Provide concrete implementation examples\n`;
        prompt += `4. Note any prerequisites or considerations\n`;
        prompt += `5. Mention browser support status\n`;
        prompt += `\nBe specific and actionable. Focus on features that would genuinely improve this project.`;

        return prompt;
    }

    /**
     * Build a prompt for code refactoring
     */
    buildRefactorPrompt(code: string, fileName: string, languageId: string): string {
        return `Analyze this code and suggest modernizations based on Baseline web features.

**File:** ${fileName}
**Language:** ${languageId}

**Code to Refactor:**
\`\`\`${languageId}
${code}
\`\`\`

**Task:**
1. Identify outdated patterns or APIs
2. Check which modern alternatives are now Baseline
3. Suggest specific refactorings with code examples
4. Explain the benefits (performance, readability, maintainability)
5. Provide browser support information
6. Note any breaking changes or migration steps

Focus on:
- Replacing polyfills with native features
- Using modern CSS features (Grid, Container Queries, etc.)
- Adopting new JavaScript APIs
- Improving performance with modern features

Provide before/after code examples for each suggestion.`;
    }
}

