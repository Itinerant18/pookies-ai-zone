import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';

const PREFS_KEY = 'user_preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
    price_sensitivity: 50,
    ease_of_use_importance: 50,
    feature_richness: 50,
    need_mobile_app: false,
    need_api: false,
    need_free_tier: false,
    need_open_source: false,
    primary_use_cases: [],
};

export const AVAILABLE_USE_CASES = [
    'content_creation',
    'coding',
    'design',
    'marketing',
    'research',
    'education',
    'data_analysis',
    'customer_support',
    'project_management',
    'automation',
    'writing',
    'image_generation',
    'video_editing',
    'music_audio',
    'translation',
    'social_media',
];

/** Human-readable labels for use cases */
export const USE_CASE_LABELS: Record<string, string> = {
    content_creation: 'Content Creation',
    coding: 'Coding & Dev',
    design: 'Design',
    marketing: 'Marketing',
    research: 'Research',
    education: 'Education',
    data_analysis: 'Data Analysis',
    customer_support: 'Customer Support',
    project_management: 'Project Mgmt',
    automation: 'Automation',
    writing: 'Writing',
    image_generation: 'Image Gen',
    video_editing: 'Video Editing',
    music_audio: 'Music & Audio',
    translation: 'Translation',
    social_media: 'Social Media',
};

export const USE_CASE_ICONS: Record<string, string> = {
    content_creation: 'pencil',
    coding: 'code',
    design: 'paint-brush',
    marketing: 'bullhorn',
    research: 'search',
    education: 'graduation-cap',
    data_analysis: 'bar-chart',
    customer_support: 'headphones',
    project_management: 'tasks',
    automation: 'bolt',
    writing: 'file-text-o',
    image_generation: 'picture-o',
    video_editing: 'video-camera',
    music_audio: 'music',
    translation: 'globe',
    social_media: 'share-alt',
};

export async function loadPreferences(): Promise<UserPreferences> {
    try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch { }
    return DEFAULT_PREFERENCES;
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function resetPreferences(): Promise<void> {
    await AsyncStorage.removeItem(PREFS_KEY);
}
