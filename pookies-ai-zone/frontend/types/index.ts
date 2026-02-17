export interface PricingData {
    model?: string; // Relaxed from strict union
    free_tier?: boolean;
    starting_price?: number;
    currency?: string;
    per_user?: boolean;
    custom_pricing?: boolean;
}

export interface PlatformData {
    web?: boolean;
    ios?: boolean;
    android?: boolean;
    macos?: boolean;
    windows?: boolean;
    linux?: boolean;
    api?: boolean;
    self_hosted?: boolean;
}

export interface FeatureData {
    ai_text?: boolean;
    ai_image?: boolean;
    ai_video?: boolean;
    ai_code?: boolean;
    ai_audio?: boolean;
    ai_chat?: boolean;
    api_access?: boolean;
    webhooks?: boolean;
    sso?: boolean;
    team_collaboration?: boolean;
    custom_branding?: boolean;
    export_pdf?: boolean;
    export_csv?: boolean;
}

export interface ToolComparisonData {
    pricing?: PricingData;
    platforms?: PlatformData;
    features?: FeatureData;
    use_cases?: string[];
    difficulty?: 1 | 2 | 3 | 4 | 5;
}

export interface UserPreferences {
    price_sensitivity: number;      // 0-100
    ease_of_use_importance: number; // 0-100
    feature_richness: number;       // 0-100
    need_mobile_app: boolean;
    need_api: boolean;
    need_free_tier: boolean;
    need_open_source: boolean;
    primary_use_cases: string[];
}

export interface ToolScore {
    toolId: string;
    toolName: string;
    totalScore: number;
    priceScore: number;
    featureScore: number;
    easeScore: number;
    platformScore: number;
    matchPercentage: number;
}

export interface Tool {
    _id: string;
    name: string;
    description: string;
    category: string;
    url: string;
    icon_letter: string;
    icon_url?: string;
    color: string;
    featured: boolean;

    // Enriched fields
    pricing?: {
        model: string;
        free_tier: boolean;
        starting_price?: number;
        currency?: string;
    };
    platforms?: string[];
    features?: string[];
    pros?: string[];
    cons?: string[];
    updated_at?: string;

    // NEW: Extended comparison data
    comparison_data?: ToolComparisonData;
}

export interface CategoryData {
    name: string;
    count: number;
}
