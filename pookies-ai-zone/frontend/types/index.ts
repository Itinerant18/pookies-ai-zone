export interface Tool {
    _id: string; // Changed from id to _id for Convex
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
}

export interface CategoryData {
    name: string;
    count: number;
}
