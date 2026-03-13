import { Tool, UserPreferences, ToolScore, ToolComparisonData } from '../types';

// Default comparison data for tools without enriched data
const DEFAULT_COMPARISON_DATA: ToolComparisonData = {
    pricing: {
        model: 'freemium',
        free_tier: true,
        starting_price: 0,
        per_user: true,
        custom_pricing: false,
    },
    platforms: {
        web: true,
        api: false,
    },
    features: {
        ai_chat: true,
        team_collaboration: false,
    },
    use_cases: ['general'],
    difficulty: 3,
};

// Get comparison data with defaults
export const getComparisonData = (tool: Tool): ToolComparisonData => {
    return tool.comparison_data || DEFAULT_COMPARISON_DATA;
};

// Calculate price score (0-100, higher is better/cheaper)
export const calculatePriceScore = (pricing: ToolComparisonData['pricing']): number => {
    if (!pricing) return 50; // Default mid-score

    const modelScores: Record<string, number> = {
        'free': 100,
        'open-source': 95,
        'freemium': 75,
        'paid': 40,
        'enterprise': 30,
    };

    const model = pricing.model || 'free'; // Default to free or handle undefined
    let baseScore = modelScores[model] || 50;

    // Adjust for free tier
    if (pricing.free_tier) {
        baseScore = Math.min(baseScore + 15, 100);
    }

    // Adjust for starting price
    if (pricing.starting_price) {
        if (pricing.starting_price === 0) {
            baseScore = Math.min(baseScore + 10, 100);
        } else if (pricing.starting_price > 50) {
            baseScore = Math.max(baseScore - 15, 10);
        } else if (pricing.starting_price > 20) {
            baseScore = Math.max(baseScore - 5, 20);
        }
    }

    return Math.round(baseScore);
};

// Calculate feature match score (0-100)
export const calculateFeatureScore = (
    toolFeatures: ToolComparisonData['features'],
    requiredFeatures: (keyof NonNullable<ToolComparisonData['features']>)[] = []
): number => {
    if (!toolFeatures) return 50;

    if (requiredFeatures.length === 0) {
        // Score based on total features
        const featureCount = Object.values(toolFeatures).filter(Boolean).length;
        const maxFeatures = 13; // Total possible features
        return Math.round((featureCount / maxFeatures) * 100);
    }

    // Score based on required features match
    const matchedFeatures = requiredFeatures.filter(f => toolFeatures[f]);
    return Math.round((matchedFeatures.length / requiredFeatures.length) * 100);
};

// Calculate ease of use score (0-100, higher is easier)
export const calculateEaseScore = (difficulty: number | undefined): number => {
    if (!difficulty) return 50;
    // Difficulty: 1 (easy) to 5 (hard) - invert for score
    return Math.round(((6 - difficulty) / 5) * 100);
};

// Calculate platform match score (0-100)
export const calculatePlatformScore = (
    toolPlatforms: ToolComparisonData['platforms'],
    requiredPlatforms: { web?: boolean; mobile?: boolean; api?: boolean; self_hosted?: boolean } = {}
): number => {
    if (!toolPlatforms) return 50;

    const requiredList = Object.entries(requiredPlatforms).filter(([_, v]) => v);

    if (requiredList.length === 0) {
        // Score based on total platform support
        const platformCount = Object.values(toolPlatforms).filter(Boolean).length;
        const maxPlatforms = 8;
        return Math.round((platformCount / maxPlatforms) * 100);
    }

    // Score based on required platforms
    let score = 100;
    for (const [platform, isRequired] of requiredList) {
        if (isRequired && !toolPlatforms[platform as keyof typeof toolPlatforms]) {
            score -= 25;
        }
    }

    return Math.max(score, 0);
};

// Calculate total tool score based on user preferences
export const calculateToolScore = (
    tool: Tool,
    preferences: UserPreferences
): ToolScore => {
    const compData = getComparisonData(tool);

    // Default weights if not specified
    const priceWeight = preferences.price_sensitivity / 100;
    const easeWeight = preferences.ease_of_use_importance / 100;
    const featureWeight = preferences.feature_richness / 100;
    const platformWeight = 0.2;

    // Calculate individual scores
    const priceScore = calculatePriceScore(compData.pricing);
    const featureScore = calculateFeatureScore(compData.features, []);
    const easeScore = calculateEaseScore(compData.difficulty);
    const platformScore = calculatePlatformScore(compData.platforms, {
        web: true,
        mobile: preferences.need_mobile_app,
        api: preferences.need_api,
        self_hosted: preferences.need_open_source,
    });

    // Calculate total score with weights
    const totalScore = Math.round(
        (priceScore * priceWeight) +
        (featureScore * featureWeight) +
        (easeScore * easeWeight) +
        (platformScore * platformWeight)
    );

    // Calculate match percentage based on requirements
    let matchCount = 0;
    let requirementCount = 0;

    if (preferences.need_free_tier) {
        requirementCount++;
        if (compData.pricing?.free_tier) matchCount++;
    }

    if (preferences.need_api) {
        requirementCount++;
        if (compData.platforms?.api) matchCount++;
    }

    if (preferences.need_open_source) {
        requirementCount++;
        if (compData.pricing?.model === 'open-source' || compData.platforms?.self_hosted) matchCount++;
    }

    if (preferences.primary_use_cases.length > 0 && compData.use_cases) {
        requirementCount += preferences.primary_use_cases.length;
        for (const useCase of preferences.primary_use_cases) {
            if (compData.use_cases.includes(useCase)) matchCount++;
        }
    }

    const matchPercentage = requirementCount > 0
        ? Math.round((matchCount / requirementCount) * 100)
        : totalScore;

    return {
        toolId: tool._id,
        toolName: tool.name,
        totalScore,
        priceScore,
        featureScore,
        easeScore,
        platformScore,
        matchPercentage,
    };
};

// Get similar tools based on category and features
export const getSimilarTools = (
    targetTool: Tool,
    allTools: Tool[],
    limit: number = 5
): Tool[] => {
    return allTools
        .filter(t => t._id !== targetTool._id)
        .map(tool => ({
            tool,
            score: calculateSimilarityScore(targetTool, tool),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.tool);
};

// Calculate similarity between two tools
const calculateSimilarityScore = (tool1: Tool, tool2: Tool): number => {
    let score = 0;

    // Same category = high score
    if (tool1.category === tool2.category) {
        score += 40;
    }

    // Similar pricing model
    const data1 = getComparisonData(tool1);
    const data2 = getComparisonData(tool2);

    if (data1.pricing?.model === data2.pricing?.model) {
        score += 15;
    }

    if (data1.pricing?.free_tier === data2.pricing?.free_tier) {
        score += 10;
    }

    // Feature overlap
    if (data1.features && data2.features) {
        const features1 = Object.entries(data1.features).filter(([_, v]) => v);
        const features2 = Object.entries(data2.features).filter(([_, v]) => v);
        const overlap = features1.filter(([k]) =>
            features2.some(([k2]) => k === k2)
        ).length;

        score += Math.min(overlap * 5, 25);
    }

    // Same difficulty level
    if (data1.difficulty === data2.difficulty) {
        score += 10;
    }

    return score;
};

// Get "better alternatives" - tools with higher scores but in same category
export const getBetterAlternatives = (
    targetTool: Tool,
    allTools: Tool[],
    preferences: UserPreferences,
    limit: number = 3
): Tool[] => {
    const targetScore = calculateToolScore(targetTool, preferences);

    return allTools
        .filter(t =>
            t._id !== targetTool._id &&
            t.category === targetTool.category
        )
        .map(tool => ({
            tool,
            score: calculateToolScore(tool, preferences),
        }))
        .filter(item => item.score.totalScore > targetScore.totalScore)
        .sort((a, b) => b.score.totalScore - a.score.totalScore)
        .slice(0, limit)
        .map(item => item.tool);
};

// Get budget alternatives - cheaper options in same category
export const getBudgetAlternatives = (
    targetTool: Tool,
    allTools: Tool[],
    limit: number = 3
): Tool[] => {
    const targetData = getComparisonData(targetTool);
    const targetPrice = targetData.pricing?.starting_price || 0;

    return allTools
        .filter(t =>
            t._id !== targetTool._id &&
            t.category === targetTool.category
        )
        .map(tool => {
            const data = getComparisonData(tool);
            return {
                tool,
                price: data.pricing?.starting_price || 0,
            };
        })
        .filter(item => item.price < targetPrice || (item.price === 0 && targetPrice > 0))
        .sort((a, b) => a.price - b.price)
        .slice(0, limit)
        .map(item => item.tool);
};

// Get tools by use case
export const getToolsByUseCase = (
    useCase: string,
    allTools: Tool[],
    limit: number = 10
): Tool[] => {
    return allTools
        .filter(t => {
            const data = getComparisonData(t);
            return data.use_cases?.includes(useCase);
        })
        .slice(0, limit);
};

// Get tools by price range
export const getToolsByPriceRange = (
    maxPrice: number,
    allTools: Tool[],
    limit: number = 10
): Tool[] => {
    return allTools
        .filter(t => {
            const data = getComparisonData(t);
            const price = data.pricing?.starting_price || 0;
            return price <= maxPrice;
        })
        .slice(0, limit);
};

// Sort tools by different criteria
export const sortTools = (
    tools: Tool[],
    sortBy: 'price' | 'ease' | 'features' | 'name' | 'score',
    ascending: boolean = true,
    preferences?: UserPreferences
): Tool[] => {
    const sorted = [...tools].sort((a, b) => {
        switch (sortBy) {
            case 'price': {
                const priceA = getComparisonData(a).pricing?.starting_price || 0;
                const priceB = getComparisonData(b).pricing?.starting_price || 0;
                return priceA - priceB;
            }
            case 'ease': {
                const easeA = getComparisonData(a).difficulty || 3;
                const easeB = getComparisonData(b).difficulty || 3;
                return easeA - easeB;
            }
            case 'features': {
                const featA = Object.values(getComparisonData(a).features || {}).filter(Boolean).length;
                const featB = Object.values(getComparisonData(b).features || {}).filter(Boolean).length;
                return featA - featB;
            }
            case 'score': {
                const defaultPrefs: UserPreferences = {
                    price_sensitivity: 50,
                    ease_of_use_importance: 50,
                    feature_richness: 50,
                    need_mobile_app: false,
                    need_api: false,
                    need_free_tier: false,
                    need_open_source: false,
                    primary_use_cases: [],
                };
                const prefs = preferences || defaultPrefs;
                const scoreA = calculateToolScore(a, prefs).totalScore;
                const scoreB = calculateToolScore(b, prefs).totalScore;
                return scoreA - scoreB;
            }
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    return ascending ? sorted : sorted.reverse();
};

// Get all available use cases from tools
export const getAllUseCases = (tools: Tool[]): string[] => {
    const useCases = new Set<string>();

    tools.forEach(tool => {
        const data = getComparisonData(tool);
        data.use_cases?.forEach(uc => useCases.add(uc));
    });

    return Array.from(useCases).sort();
};

// Get all categories
export const getAllCategories = (tools: Tool[]): string[] => {
    const categories = new Set<string>();

    tools.forEach(tool => {
        categories.add(tool.category);
    });

    return Array.from(categories).sort();
};

export const getFeaturesList = (features: ToolComparisonData['features']): string[] => {
    if (!features) return [];
    return Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
};

export const getPlatformsList = (platforms: ToolComparisonData['platforms']): string[] => {
    if (!platforms) return [];
    return Object.entries(platforms)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
};
