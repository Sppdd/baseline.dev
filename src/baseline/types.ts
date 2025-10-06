/**
 * Baseline data types and interfaces
 */

export interface BaselineStatus {
    baseline?: 'high' | 'low' | false;
    baseline_low_date?: string;
    baseline_high_date?: string;
    support?: {
        [browser: string]: string;
    };
}

export interface WebFeature {
    id: string;
    name: string;
    description?: string;
    status?: BaselineStatus;
    spec?: string | string[];
    caniuse?: string | string[];
    group?: string;
}

export interface FeatureQuery {
    id?: string;
    name?: string;
    baseline?: 'high' | 'low' | false;
    sinceDate?: Date;
}

