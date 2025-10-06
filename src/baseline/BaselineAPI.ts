/**
 * Baseline API - Fetches real-time data from web-features API
 */

import axios from 'axios';
import { WebFeature } from './types';

export class BaselineAPI {
    private static readonly GITHUB_RAW_URL = 'https://raw.githubusercontent.com/web-platform-dx/web-features/main/features.json';
    private static readonly NPM_UNPKG_URL = 'https://unpkg.com/web-features@latest/index.json';
    
    /**
     * Fetch latest features from the web-features repository
     */
    static async fetchLatestFeatures(): Promise<Record<string, any>> {
        try {
            // Try GitHub raw URL first (most up-to-date)
            const response = await axios.get(this.GITHUB_RAW_URL, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.data) {
                console.log('[Baseline.dev] Fetched real-time features from GitHub');
                return response.data;
            }
        } catch (error) {
            console.warn('[Baseline.dev] GitHub fetch failed, trying unpkg...', error);
        }

        try {
            // Fallback to unpkg CDN
            const response = await axios.get(this.NPM_UNPKG_URL, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.data) {
                console.log('[Baseline.dev] Fetched real-time features from unpkg');
                return response.data;
            }
        } catch (error) {
            console.error('[Baseline.dev] All real-time fetch attempts failed:', error);
            throw new Error('Failed to fetch real-time Baseline data');
        }

        throw new Error('No data received from Baseline API');
    }

    /**
     * Fetch a specific feature by ID
     */
    static async fetchFeature(featureId: string): Promise<WebFeature | null> {
        try {
            const allFeatures = await this.fetchLatestFeatures();
            
            if (allFeatures[featureId]) {
                return {
                    id: featureId,
                    ...allFeatures[featureId]
                };
            }
            
            return null;
        } catch (error) {
            console.error(`[Baseline.dev] Failed to fetch feature ${featureId}:`, error);
            return null;
        }
    }

    /**
     * Search features in real-time data
     */
    static async searchFeatures(query: string): Promise<WebFeature[]> {
        try {
            const allFeatures = await this.fetchLatestFeatures();
            const lowerQuery = query.toLowerCase();
            const results: WebFeature[] = [];

            for (const [id, feature] of Object.entries(allFeatures)) {
                if (
                    id.toLowerCase().includes(lowerQuery) ||
                    feature.name?.toLowerCase().includes(lowerQuery) ||
                    feature.description?.toLowerCase().includes(lowerQuery)
                ) {
                    results.push({ id, ...feature });
                }
            }

            return results;
        } catch (error) {
            console.error('[Baseline.dev] Failed to search features:', error);
            return [];
        }
    }

    /**
     * Get features that became baseline after a date
     */
    static async getNewlyAvailable(sinceDate: Date, threshold: 'high' | 'low' = 'high'): Promise<WebFeature[]> {
        try {
            const allFeatures = await this.fetchLatestFeatures();
            const results: WebFeature[] = [];
            const dateKey = threshold === 'high' ? 'baseline_high_date' : 'baseline_low_date';

            for (const [id, feature] of Object.entries(allFeatures)) {
                const baselineDate = feature.status?.[dateKey];
                
                if (baselineDate) {
                    const featureDate = new Date(baselineDate);
                    if (featureDate > sinceDate) {
                        results.push({ id, ...feature });
                    }
                }
            }

            // Sort by date (newest first)
            results.sort((a, b) => {
                const dateA = new Date(a.status?.[dateKey] || 0);
                const dateB = new Date(b.status?.[dateKey] || 0);
                return dateB.getTime() - dateA.getTime();
            });

            return results;
        } catch (error) {
            console.error('[Baseline.dev] Failed to get newly available features:', error);
            return [];
        }
    }

    /**
     * Check if real-time API is accessible
     */
    static async checkConnection(): Promise<boolean> {
        try {
            const response = await axios.head(this.GITHUB_RAW_URL, {
                timeout: 5000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

