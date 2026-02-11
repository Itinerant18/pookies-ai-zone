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
}

export interface CategoryData {
    name: string;
    count: number;
}
