/**
 * Feature Database - Loads and queries web-features data
 */

import * as webFeaturesData from 'web-features';
import { WebFeature, BaselineStatus } from './types';
import { BaselineAPI } from './BaselineAPI';

export class FeatureDatabase {
    private features: Map<string, any> = new Map();
    private initialized = false;
    private useRealTimeData = false;
    private lastRealTimeFetch: Date | null = null;

    /**
     * Initialize the feature database by loading web-features data
     */
    async initialize(useRealTime: boolean = false): Promise<void> {
        if (this.initialized && !useRealTime) {
            return;
        }

        this.useRealTimeData = useRealTime;

        try {
            if (useRealTime) {
                // Try to fetch real-time data from API
                try {
                    const realTimeData = await BaselineAPI.fetchLatestFeatures();
                    this.features = new Map(Object.entries(realTimeData));
                    this.lastRealTimeFetch = new Date();
                    this.initialized = true;
                    console.log(`[Baseline.dev] ✅ Loaded ${this.features.size} web features from REAL-TIME API`);
                    return;
                } catch (apiError) {
                    console.warn('[Baseline.dev] Real-time fetch failed, falling back to local data:', apiError);
                }
            }

            // Load local web-features data (fallback or default)
            const data = webFeaturesData as any;
            
            // Handle both default export and named export patterns
            const featuresObj = data.default || data;
            
            this.features = new Map(Object.entries(featuresObj));
            this.initialized = true;
            
            console.log(`[Baseline.dev] Loaded ${this.features.size} web features from LOCAL package`);
        } catch (error) {
            console.error('[Baseline.dev] Failed to load web-features data:', error);
            throw new Error('Failed to initialize feature database');
        }
    }

    /**
     * Refresh data from real-time API
     */
    async refreshFromAPI(): Promise<boolean> {
        try {
            const realTimeData = await BaselineAPI.fetchLatestFeatures();
            this.features = new Map(Object.entries(realTimeData));
            this.lastRealTimeFetch = new Date();
            this.useRealTimeData = true;
            console.log(`[Baseline.dev] ✅ Refreshed ${this.features.size} features from real-time API`);
            return true;
        } catch (error) {
            console.error('[Baseline.dev] Failed to refresh from API:', error);
            return false;
        }
    }

    /**
     * Check if using real-time data
     */
    isUsingRealTimeData(): boolean {
        return this.useRealTimeData && this.lastRealTimeFetch !== null;
    }

    /**
     * Get last real-time fetch timestamp
     */
    getLastFetchTime(): Date | null {
        return this.lastRealTimeFetch;
    }

    /**
     * Get a specific feature by ID
     */
    getFeature(id: string): WebFeature | undefined {
        const feature = this.features.get(id);
        if (!feature) {
            return undefined;
        }
        
        return {
            id,
            ...feature
        };
    }

    /**
     * Search features by name or ID
     */
    searchFeatures(query: string): WebFeature[] {
        const lowerQuery = query.toLowerCase();
        const results: WebFeature[] = [];

        for (const [id, feature] of this.features) {
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
     * Get all features with high baseline status
     */
    getBaselineFeatures(threshold: 'high' | 'low' = 'high'): WebFeature[] {
        const results: WebFeature[] = [];

        for (const [id, feature] of this.features) {
            const baseline = feature.status?.baseline;
            
            if (threshold === 'high' && baseline === 'high') {
                results.push({ id, ...feature });
            } else if (threshold === 'low' && (baseline === 'high' || baseline === 'low')) {
                results.push({ id, ...feature });
            }
        }

        return results;
    }

    /**
     * Get features that became baseline after a certain date
     */
    getNewlyAvailable(sinceDate: Date, threshold: 'high' | 'low' = 'high'): WebFeature[] {
        const results: WebFeature[] = [];

        for (const [id, feature] of this.features) {
            const dateKey = threshold === 'high' ? 'baseline_high_date' : 'baseline_low_date';
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
            const dateKey = threshold === 'high' ? 'baseline_high_date' : 'baseline_low_date';
            const dateA = new Date(a.status?.[dateKey] || 0);
            const dateB = new Date(b.status?.[dateKey] || 0);
            return dateB.getTime() - dateA.getTime();
        });

        return results;
    }

    /**
     * Get features by group/category
     */
    getFeaturesByGroup(group: string): WebFeature[] {
        const results: WebFeature[] = [];

        for (const [id, feature] of this.features) {
            if (feature.group === group) {
                results.push({ id, ...feature });
            }
        }

        return results;
    }

    /**
     * Get all available feature groups
     */
    getGroups(): string[] {
        const groups = new Set<string>();

        for (const feature of this.features.values()) {
            if (feature.group) {
                groups.add(feature.group);
            }
        }

        return Array.from(groups).sort();
    }

    /**
     * Get feature count
     */
    getFeatureCount(): number {
        return this.features.size;
    }

    /**
     * Check if database is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

