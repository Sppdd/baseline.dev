/**
 * Check Feature Command - Checks the Baseline status of a specific feature
 */

import * as vscode from 'vscode';
import { FeatureDatabase } from '../baseline/FeatureDatabase';

export async function checkFeatureCommand(featureDb: FeatureDatabase): Promise<void> {
    // Prompt user for feature name or ID
    const featureName = await vscode.window.showInputBox({
        prompt: 'Enter feature name or ID',
        placeHolder: 'e.g., "container queries" or "css-contain-3"',
        validateInput: (value) => {
            return value.trim().length > 0 ? null : 'Please enter a feature name or ID';
        }
    });

    if (!featureName) {
        return; // User cancelled
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Baseline.dev: Searching features...',
            cancellable: false
        },
        async () => {
            try {
                // Search for features
                const results = featureDb.searchFeatures(featureName);

                if (results.length === 0) {
                    vscode.window.showWarningMessage(`No features found matching "${featureName}"`);
                    return;
                }

                // If multiple results, let user choose
                let selectedFeature;
                
                if (results.length === 1) {
                    selectedFeature = results[0];
                } else {
                    const items = results.slice(0, 10).map(f => ({
                        label: f.name || f.id,
                        description: f.id,
                        detail: f.description,
                        feature: f
                    }));

                    const selected = await vscode.window.showQuickPick(items, {
                        title: 'Select a feature',
                        placeHolder: `Found ${results.length} features`
                    });

                    if (!selected) {
                        return;
                    }

                    selectedFeature = selected.feature;
                }

                // Create detailed report
                const feature = selectedFeature;
                const baseline = feature.status?.baseline;
                const baselineHighDate = feature.status?.baseline_high_date;
                const baselineLowDate = feature.status?.baseline_low_date;

                let statusIcon = '❓';
                let statusText = 'Unknown';
                
                if (baseline === 'high') {
                    statusIcon = '✅';
                    statusText = '**Baseline High** - Widely available across browsers';
                } else if (baseline === 'low') {
                    statusIcon = '⚠️';
                    statusText = '**Baseline Low** - Recently available';
                } else {
                    statusIcon = '🔬';
                    statusText = '**Limited Availability** - Experimental or not widely supported';
                }

                const reportContent = `# ${statusIcon} ${feature.name}

**ID:** \`${feature.id}\`
**Status:** ${statusText}

---

## Description

${feature.description || 'No description available'}

---

## Baseline Status

- **Current Status:** ${baseline || 'Not baseline'}
${baselineHighDate ? `- **Baseline High Since:** ${baselineHighDate}` : ''}
${baselineLowDate ? `- **Baseline Low Since:** ${baselineLowDate}` : ''}

${baseline === 'high' 
    ? '✅ This feature is widely available and safe to use in production.'
    : baseline === 'low'
    ? '⚠️ This feature is available but recently became baseline. Check your browser targets.'
    : '🔬 This feature has limited availability. Use with caution and consider fallbacks.'}

---

## Browser Support

${feature.status?.support 
    ? Object.entries(feature.status.support)
        .map(([browser, version]) => `- **${browser}:** ${version}`)
        .join('\n')
    : 'Browser support information not available'}

---

## Additional Resources

${feature.spec 
    ? `**Specification:** ${Array.isArray(feature.spec) ? feature.spec.join(', ') : feature.spec}`
    : ''}

${feature.caniuse
    ? `**Can I Use:** ${Array.isArray(feature.caniuse) ? feature.caniuse.map(c => `https://caniuse.com/${c}`).join(', ') : `https://caniuse.com/${feature.caniuse}`}`
    : ''}

---

**Want to use this feature?** Open Baseline.dev chat and ask:
- "How do I use ${feature.name}?"
- "Show me an example of ${feature.name}"
- "Can I use ${feature.name} in my project?"
`;

                // Show report in new document
                const doc = await vscode.workspace.openTextDocument({
                    content: reportContent,
                    language: 'markdown'
                });

                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            } catch (error: any) {
                console.error('[Baseline.dev] Error checking feature:', error);
                vscode.window.showErrorMessage(`Failed to check feature: ${error.message}`);
            }
        }
    );
}

