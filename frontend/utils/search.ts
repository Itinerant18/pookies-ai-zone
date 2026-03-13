import { Tool } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 10;

/**
 * Fuzzy search — scores tool name and description against query terms.
 * Returns tools sorted by relevance with a minimum threshold.
 */
export function fuzzySearchTools(tools: Tool[], query: string): Tool[] {
    if (!query.trim()) return tools;

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = tools.map(tool => {
        const name = tool.name.toLowerCase();
        const desc = tool.description.toLowerCase();
        const category = tool.category.toLowerCase();

        let score = 0;

        for (const term of terms) {
            // Exact name match — highest weight
            if (name === term) {
                score += 100;
            } else if (name.startsWith(term)) {
                score += 60;
            } else if (name.includes(term)) {
                score += 40;
            }

            // Category match
            if (category.includes(term)) {
                score += 25;
            }

            // Description match
            if (desc.includes(term)) {
                score += 15;
            }
        }

        return { tool, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.tool);
}

/**
 * Returns search suggestions (tool names that match the query prefix).
 */
export function getSearchSuggestions(tools: Tool[], query: string, limit = 5): string[] {
    if (!query.trim() || query.length < 2) return [];

    const q = query.toLowerCase();
    const seen = new Set<string>();
    const results: string[] = [];

    for (const tool of tools) {
        const name = tool.name.toLowerCase();
        if (name.startsWith(q) && !seen.has(tool.name)) {
            results.push(tool.name);
            seen.add(tool.name);
        }
        if (results.length >= limit) break;
    }

    // If not enough prefix matches, try includes
    if (results.length < limit) {
        for (const tool of tools) {
            if (results.length >= limit) break;
            const name = tool.name.toLowerCase();
            if (name.includes(q) && !seen.has(tool.name)) {
                results.push(tool.name);
                seen.add(tool.name);
            }
        }
    }

    return results;
}

/** Get recent searches from AsyncStorage. */
export async function getRecentSearches(): Promise<string[]> {
    try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/** Add a search query to recent searches. Deduplicates, max 10. */
export async function addRecentSearch(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    try {
        const existing = await getRecentSearches();
        const filtered = existing.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
        await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch { /* silently fail */ }
}

/** Remove a single recent search. */
export async function removeRecentSearch(query: string): Promise<string[]> {
    try {
        const existing = await getRecentSearches();
        const updated = existing.filter(s => s !== query);
        await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
    } catch { return []; }
}

/** Clear all recent searches. */
export async function clearRecentSearches(): Promise<void> {
    try { await AsyncStorage.removeItem(RECENT_SEARCHES_KEY); } catch { /* silently fail */ }
}
