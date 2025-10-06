/**
 * Refresh Data Command - Refreshes Baseline data from API
 */

import * as vscode from 'vscode';
import { FeatureDatabase } from '../baseline/FeatureDatabase';

export async function refreshDataCommand(featureDb: FeatureDatabase): Promise<void> {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Baseline.dev: Fetching latest data...',
            cancellable: false
        },
        async (progress) => {
            try {
                progress.report({ increment: 30, message: 'Connecting to Baseline API...' });

                const success = await featureDb.refreshFromAPI();

                if (success) {
                    const lastFetch = featureDb.getLastFetchTime();
                    const timeStr = lastFetch ? lastFetch.toLocaleTimeString() : 'Unknown';
                    
                    progress.report({ increment: 70, message: 'Done!' });
                    
                    vscode.window.showInformationMessage(
                        `✅ Baseline data refreshed! (${featureDb.getFeatureCount()} features)\nLast updated: ${timeStr}`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        '⚠️ Failed to fetch real-time data. Using local data as fallback.'
                    );
                }
            } catch (error: any) {
                console.error('[Baseline.dev] Refresh error:', error);
                vscode.window.showErrorMessage(`Failed to refresh data: ${error.message}`);
            }
        }
    );
}

