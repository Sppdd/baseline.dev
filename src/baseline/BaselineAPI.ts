/**
 * Baseline API - Hybrid approach using Web Platform Dashboard API and local web-features package
 */

import axios from 'axios';
import { WebFeature } from './types';

// Import local web-features package as fallback
let localFeatures: Record<string, any> | null = null;
try {
    const webFeaturesModule = require('web-features');
    localFeatures = webFeaturesModule.features || webFeaturesModule;
} catch (error) {
    console.warn('[Baseline.dev] web-features package not available:', error);
}

export class BaselineAPI {
    private static readonly WEB_STATUS_API = 'https://api.webstatus.dev/v1/features';
    private static readonly GITHUB_RAW_URL = 'https://raw.githubusercontent.com/web-platform-dx/web-features/main/features.json';
    private static cache: Record<string, any> | null = null;
    private static cacheTimestamp: number = 0;
    private static readonly CACHE_TTL = 3600000; // 1 hour
    
    /**
     * Get features - uses local package first, optionally fetches real-time data
     */
    static async fetchLatestFeatures(useRealTime: boolean = true): Promise<Record<string, any>> {
        // Strategy 1: Use local npm package (instant, reliable) if real-time is disabled
        if (!useRealTime && localFeatures) {
            console.log('[Baseline.dev] Using local web-features package');
            return localFeatures;
        }

        // Strategy 2: Check cache
        const now = Date.now();
        if (this.cache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
            console.log('[Baseline.dev] Using cached data');
            return this.cache;
        }

        // Strategy 3: Fetch real-time from official API with fallback
        try {
            const realTimeData = await this.fetchFromWebStatusAPI();
            this.cache = realTimeData;
            this.cacheTimestamp = now;
            return realTimeData;
        } catch (error) {
            console.warn('[Baseline.dev] Web Status API failed, trying GitHub...', error);
            
            try {
                // Fallback to GitHub raw URL
                const response = await axios.get(this.GITHUB_RAW_URL, {
                    timeout: 10000,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.data) {
                    console.log('[Baseline.dev] Fetched from GitHub fallback');
                    this.cache = response.data;
                    this.cacheTimestamp = now;
                    return response.data;
                }
            } catch (githubError) {
                console.warn('[Baseline.dev] GitHub fallback failed:', githubError);
            }
            
            // Final fallback to local package
            if (localFeatures) {
                console.log('[Baseline.dev] Using local package as final fallback');
                return localFeatures;
            }
            
            throw new Error('Failed to fetch Baseline data from all sources');
        }
    }

    /**
     * Fetch from official Web Platform Dashboard API
     */
    private static async fetchFromWebStatusAPI(): Promise<Record<string, any>> {
        const query = encodeURIComponent('-baseline_status:limited'); // All baseline features
        const url = `${this.WEB_STATUS_API}?q=${query}&page_size=1000`;
        
        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 'Accept': 'application/json' }
        });

        if (response.data?.data) {
            console.log('[Baseline.dev] Fetched from Web Status API');
            // Convert array format to object format
            const featuresObj: Record<string, any> = {};
            for (const feature of response.data.data) {
                featuresObj[feature.feature_id] = {
                    name: feature.name,
                    description: feature.description,
                    status: {
                        baseline: feature.baseline?.status === 'widely' ? 'widely' : 
                                 feature.baseline?.status === 'newly' ? 'newly' : false,
                        baseline_low_date: feature.baseline?.low_date,
                        baseline_high_date: feature.baseline?.high_date,
                        support: feature.baseline?.support
                    },
                    spec: feature.spec?.links || [],
                    caniuse: feature.usage_stats,
                    group: feature.group
                };
            }
            return featuresObj;
        }

        throw new Error('Invalid response from Web Status API');
    }

    /**
     * Query with advanced filters (only works with real-time API)
     */
    static async queryFeatures(queryString: string): Promise<WebFeature[]> {
        try {
            const encoded = encodeURIComponent(queryString);
            const url = `${this.WEB_STATUS_API}?q=${encoded}&page_size=100`;
            
            const response = await axios.get(url, { 
                timeout: 10000,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.data?.data) {
                return response.data.data.map((f: any) => ({
                    id: f.feature_id,
                    name: f.name,
                    description: f.description,
                    status: {
                        baseline: f.baseline?.status === 'widely' ? 'widely' : 
                                 f.baseline?.status === 'newly' ? 'newly' : false,
                        baseline_low_date: f.baseline?.low_date,
                        baseline_high_date: f.baseline?.high_date,
                        support: f.baseline?.support
                    },
                    spec: f.spec?.links || [],
                    group: f.group
                }));
            }
            
            return [];
        } catch (error) {
            console.error('[Baseline.dev] Query failed:', error);
            // Fallback to local search
            return this.searchFeaturesLocal(queryString);
        }
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
            return this.searchFeaturesInData(query, allFeatures);
        } catch (error) {
            console.error('[Baseline.dev] Failed to search features:', error);
            return [];
        }
    }

    /**
     * Search features locally (fallback)
     */
    private static async searchFeaturesLocal(query: string): Promise<WebFeature[]> {
        if (!localFeatures) {
            return [];
        }
        return this.searchFeaturesInData(query, localFeatures);
    }

    /**
     * Search features in a given data set
     */
    private static searchFeaturesInData(query: string, data: Record<string, any>): WebFeature[] {
        const lowerQuery = query.toLowerCase();
        const results: WebFeature[] = [];

        for (const [id, feature] of Object.entries(data)) {
            if (
                id.toLowerCase().includes(lowerQuery) ||
                feature.name?.toLowerCase().includes(lowerQuery) ||
                feature.description?.toLowerCase().includes(lowerQuery)
            ) {
                results.push({ id, ...feature });
            }
        }

        return results;
    }

    /**
     * Get newly available features using API query
     */
    static async getNewlyAvailableQuery(sinceDate: Date): Promise<WebFeature[]> {
        const dateStr = sinceDate.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const query = `baseline_status:newly AND baseline_date:${dateStr}..${today}`;
        
        return this.queryFeatures(query);
    }

    /**
     * Search features by group (e.g., 'css', 'javascript')
     */
    static async searchByGroup(group: string, baselineStatus?: 'newly' | 'widely'): Promise<WebFeature[]> {
        let query = `group:${group}`;
        if (baselineStatus) {
            query += ` AND baseline_status:${baselineStatus}`;
        }
        
        return this.queryFeatures(query);
    }

    /**
     * Get features that became baseline after a date (local fallback method)
     */
    static async getNewlyAvailable(sinceDate: Date, threshold: 'high' | 'low' = 'high'): Promise<WebFeature[]> {
        try {
            // Try API query first
            const apiResults = await this.getNewlyAvailableQuery(sinceDate);
            if (apiResults.length > 0) {
                return apiResults;
            }
            
            // Fallback to local search
            const allFeatures = await this.fetchLatestFeatures(false);
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
            const response = await axios.head(this.WEB_STATUS_API, {
                timeout: 5000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear cache to force refresh
     */
    static clearCache(): void {
        this.cache = null;
        this.cacheTimestamp = 0;
        console.log('[Baseline.dev] Cache cleared');
    }
}

