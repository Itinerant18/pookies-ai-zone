import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    StatusBar,
    ViewStyle,
    Platform,
    Dimensions,
    Modal,
    TouchableOpacity,
    Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { Tool, PlatformData, FeatureData, PricingData } from '../../types';
import { ToolIcon } from '../../components/ui/tool-icon';
import { ClayButton } from '../../components/ui/clay-button';
import { ClayChip } from '../../components/ui/clay-chip';
import { ClayCard } from '../../components/ui/clay-card';
import { ClayInput } from '../../components/ui/clay-input';
import { AnimatedPress } from '../../components/ui/animated-press';
import { RelatedTools } from '../../components/tool/related-tools';
import { ToolReviews } from '../../components/tool/tool-reviews';

const PLATFORM_ICONS: Record<string, string> = {
    'Web': 'globe',
    'iOS': 'apple',
    'Android': 'android',
    'API': 'plug',
    'Desktop': 'desktop',
    'Mobile': 'mobile',
    'macOS': 'apple',
    'Windows': 'windows',
    'Linux': 'linux',
    'CLI': 'terminal',
    'Chrome': 'chrome',
    'VS Code': 'code',
    'Slack': 'slack',
    'Self-Hosted': 'server',
};

const PLATFORM_LABELS: Record<string, string> = {
    web: 'Web', ios: 'iOS', android: 'Android', macos: 'macOS',
    windows: 'Windows', linux: 'Linux', api: 'API', self_hosted: 'Self-Hosted',
};

const FEATURE_LABELS: Record<string, string> = {
    ai_text: 'AI Text', ai_image: 'AI Image', ai_video: 'AI Video',
    ai_code: 'AI Code', ai_audio: 'AI Audio', ai_chat: 'AI Chat',
    api_access: 'API Access', webhooks: 'Webhooks', sso: 'SSO',
    team_collaboration: 'Team Collab', custom_branding: 'Branding',
    export_pdf: 'PDF Export', export_csv: 'CSV Export',
};

/** Convert {web: true, ios: false, android: true} → ["Web", "Android"] */
function extractPlatforms(data?: PlatformData): string[] {
    if (!data) return [];
    return Object.entries(data)
        .filter(([_, v]) => v === true)
        .map(([k]) => PLATFORM_LABELS[k] || k)
        .filter(Boolean);
}

/** Convert {ai_text: true, api_access: true} → ["AI Text", "API Access"] */
function extractFeatures(data?: FeatureData): string[] {
    if (!data) return [];
    return Object.entries(data)
        .filter(([_, v]) => v === true)
        .map(([k]) => FEATURE_LABELS[k] || k)
        .filter(Boolean);
}

/** Get effective pricing: comparison_data.pricing → legacy tool.pricing → null */
function getEffectivePricing(tool: Tool): PricingData | null {
    if (tool.comparison_data?.pricing) return tool.comparison_data.pricing;
    if (tool.pricing) return tool.pricing;
    return null;
}

/** Get difficulty label */
function getDifficultyLabel(d: number): string {
    const labels = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
    return labels[d] || '';
}

const { width, height } = Dimensions.get('window');

// Update Props interface
interface ToolDetailSheetProps {
    tool: Tool | null;
    visible: boolean;
    onClose: () => void;
    onRelatedToolClick?: (tool: Tool) => void;
    isComparing?: boolean;
    onToggleCompare?: () => void;
}

export const ToolDetailSheet: React.FC<ToolDetailSheetProps> = ({
    tool,
    visible,
    onClose,
    onRelatedToolClick,
    isComparing = false,
    onToggleCompare
}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [userNote, setUserNote] = useState('');

    // Reset state when tool changes
    useEffect(() => {
        if (tool) {
            loadData(tool._id);
        }
    }, [tool]);

    const loadData = async (id: string) => {
        try {
            const storedFavs = await AsyncStorage.getItem('favorites');
            const favs: string[] = storedFavs ? JSON.parse(storedFavs) : [];
            setIsFavorite(favs.includes(id));

            const storedNotes = await AsyncStorage.getItem('tool_notes');
            const notes = storedNotes ? JSON.parse(storedNotes) : {};
            if (notes[id]) setUserNote(notes[id]);
            else setUserNote('');
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    };

    const saveNote = async (text: string) => {
        setUserNote(text);
        if (!tool?._id) return;
        try {
            const storedNotes = await AsyncStorage.getItem('tool_notes');
            const notes = storedNotes ? JSON.parse(storedNotes) : {};
            notes[tool._id] = text;
            await AsyncStorage.setItem('tool_notes', JSON.stringify(notes));
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    const toggleFavorite = useCallback(async () => {
        if (!tool?._id) return;
        const stored = await AsyncStorage.getItem('favorites');
        const favs: string[] = stored ? JSON.parse(stored) : [];
        let newFavs: string[];
        if (favs.includes(tool._id)) {
            newFavs = favs.filter(fid => fid !== tool._id);
            setIsFavorite(false);
        } else {
            newFavs = [...favs, tool._id];
            setIsFavorite(true);
        }
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
    }, [tool, isFavorite]);

    const openLink = useCallback(() => {
        if (tool?.url) {
            Linking.openURL(tool.url);
        }
    }, [tool]);

    if (!tool) return null;

    const primaryColor = tool.color || clayTheme.accent.primary;

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Check out ${tool.name} on Pookies AI Zone: ${tool.url || ''}`,
                url: tool.url || '',
                title: tool.name,
            });
        } catch (error: any) {
            console.error(error.message);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />

                <SafeAreaView edges={['top']} style={styles.navHeader}>
                    <ClayButton
                        onPress={onClose}
                        variant="secondary"
                        size="sm"
                        icon="times"
                        style={styles.navBtn}
                    />
                    <View style={styles.navRight}>
                        <ClayButton
                            onPress={handleShare}
                            variant="secondary"
                            size="sm"
                            icon="share-square-o"
                            style={styles.navBtn}
                        />
                    </View>
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Immersive Hero Section */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={[primaryColor + '15', clayTheme.background]}
                            style={styles.heroGradient}
                        />

                        <View style={styles.heroContent}>
                            <View style={styles.heroGlowContainer}>
                                <View style={[styles.heroGlow, { backgroundColor: primaryColor, shadowColor: primaryColor }]} />
                                <AnimatedPress style={[styles.heroIconContainer, { shadowColor: primaryColor }]}>
                                    <ToolIcon
                                        url={tool.icon_url}
                                        letter={tool.icon_letter}
                                        color={primaryColor}
                                        size={100}
                                        borderRadius={28}
                                        fontSize={48}
                                    />
                                </AnimatedPress>
                            </View>

                            <Text style={styles.heroName}>{tool.name}</Text>

                            <View style={styles.badgeRow}>
                                <ClayChip label={tool.category} selected color={primaryColor} />
                                {tool.featured && (
                                    <View style={styles.featuredBadge}>
                                        <FontAwesome name="star" size={12} color="#B45309" />
                                        <Text style={styles.featuredText}>Featured</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* About Section */}
                    <View style={styles.sectionPadding}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>{tool.description}</Text>
                    </View>

                    {/* Pricing Card */}
                    {(() => {
                        const pricing = getEffectivePricing(tool);
                        if (!pricing) return null;
                        return (
                            <View style={styles.sectionPadding}>
                                <ClayCard style={styles.pricingCard}>
                                    <View style={styles.pricingHeader}>
                                        <View style={[styles.pricingIcon, { backgroundColor: primaryColor + '20' }]}>
                                            <FontAwesome name="tag" size={18} color={primaryColor} />
                                        </View>
                                        <View>
                                            <Text style={styles.pricingLabel}>Pricing Model</Text>
                                            <Text style={styles.pricingModel}>{pricing.model || 'Unknown'}</Text>
                                        </View>
                                    </View>
                                    {pricing.starting_price !== undefined && pricing.starting_price > 0 ? (
                                        <View style={styles.priceTag}>
                                            <Text style={styles.currency}>{pricing.currency || '$'}</Text>
                                            <Text style={styles.priceAmount}>{pricing.starting_price}</Text>
                                            <Text style={styles.pricePeriod}>/mo</Text>
                                        </View>
                                    ) : pricing.free_tier ? (
                                        <View style={[styles.freeBadge, { backgroundColor: '#10B981' + '20' }]}>
                                            <FontAwesome name="check-circle" size={14} color="#10B981" />
                                            <Text style={[styles.freeBadgeText, { color: '#10B981' }]}>Free Tier</Text>
                                        </View>
                                    ) : null}
                                </ClayCard>
                            </View>
                        );
                    })()}

                    {/* Difficulty & Use Cases Row */}
                    {(tool.comparison_data?.difficulty || (tool.comparison_data?.use_cases && tool.comparison_data.use_cases.length > 0)) && (
                        <View style={styles.sectionPadding}>
                            <View style={styles.metaRow}>
                                {tool.comparison_data?.difficulty && (
                                    <View style={styles.difficultyBadge}>
                                        <FontAwesome name="signal" size={14} color={clayTheme.text.secondary} />
                                        <Text style={styles.difficultyText}>
                                            {getDifficultyLabel(tool.comparison_data.difficulty)}
                                        </Text>
                                        <View style={styles.difficultyDots}>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <View key={n} style={[
                                                    styles.difficultyDot,
                                                    { backgroundColor: n <= (tool.comparison_data?.difficulty || 0) ? primaryColor : '#E2E8F0' }
                                                ]} />
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                            {tool.comparison_data?.use_cases && tool.comparison_data.use_cases.length > 0 && (
                                <View style={[styles.tagsWrap, { marginTop: 10 }]}>
                                    {tool.comparison_data.use_cases.map((uc: string) => (
                                        <ClayChip key={uc} label={uc} color={clayTheme.text.tertiary} />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Two-Column Grid for Features & Platforms */}
                    {(() => {
                        const platforms = extractPlatforms(tool.comparison_data?.platforms) || tool.platforms || [];
                        const features = extractFeatures(tool.comparison_data?.features) || tool.features || [];
                        if (platforms.length === 0 && features.length === 0) return null;
                        return (
                            <View style={styles.gridContainer}>
                                {/* Platforms */}
                                {platforms.length > 0 && (
                                    <View style={[styles.gridItem, features.length > 0 ? { marginRight: 8 } : {}]}>
                                        <ClayCard style={styles.specCard}>
                                            <View style={styles.specHeader}>
                                                <FontAwesome name="desktop" size={16} color={clayTheme.text.secondary} />
                                                <Text style={styles.specTitle}>Platforms</Text>
                                            </View>
                                            <View style={styles.tagsWrap}>
                                                {platforms.map((p: string) => (
                                                    <View key={p} style={styles.platformTag}>
                                                        <FontAwesome name={(PLATFORM_ICONS[p] || 'circle') as any} size={13} color={primaryColor} style={{ marginRight: 5 }} />
                                                        <Text style={styles.miniTagText}>{p}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ClayCard>
                                    </View>
                                )}

                                {/* Features */}
                                {features.length > 0 && (
                                    <View style={[styles.gridItem, platforms.length > 0 ? { marginLeft: 8 } : {}]}>
                                        <ClayCard style={styles.specCard}>
                                            <View style={styles.specHeader}>
                                                <FontAwesome name="bolt" size={16} color={clayTheme.text.secondary} />
                                                <Text style={styles.specTitle}>Features</Text>
                                            </View>
                                            <View style={styles.tagsWrap}>
                                                {features.map((f: string) => (
                                                    <View key={f} style={[styles.featureTag, { borderColor: primaryColor + '30', backgroundColor: primaryColor + '08' }]}>
                                                        <Text style={[styles.featureTagText, { color: primaryColor }]}>{f}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ClayCard>
                                    </View>
                                )}
                            </View>
                        );
                    })()}

                    {/* Pros & Cons Specs */}
                    {(tool.pros || tool.cons) && (
                        <View style={styles.sectionPadding}>
                            <Text style={styles.sectionTitle}>The Verdict</Text>
                            <View style={styles.verdictContainer}>
                                {tool.pros && (
                                    <ClayCard style={[styles.verdictCard, { borderLeftWidth: 4, borderLeftColor: clayTheme.accent.success }]}>
                                        <Text style={[styles.verdictTitle, { color: clayTheme.accent.success }]}>Pros</Text>
                                        {tool.pros.map((p: string, i: number) => (
                                            <View key={i} style={styles.verdictRow}>
                                                <FontAwesome name="plus-circle" size={14} color={clayTheme.accent.success} />
                                                <Text style={styles.verdictText}>{p}</Text>
                                            </View>
                                        ))}
                                    </ClayCard>
                                )}
                                {tool.cons && (
                                    <ClayCard style={[styles.verdictCard, { borderLeftWidth: 4, borderLeftColor: clayTheme.accent.error, marginTop: 12 }]}>
                                        <Text style={[styles.verdictTitle, { color: clayTheme.accent.error }]}>Cons</Text>
                                        {tool.cons.map((c: string, i: number) => (
                                            <View key={i} style={styles.verdictRow}>
                                                <FontAwesome name="minus-circle" size={14} color={clayTheme.accent.error} />
                                                <Text style={styles.verdictText}>{c}</Text>
                                            </View>
                                        ))}
                                    </ClayCard>
                                )}
                            </View>
                        </View>
                    )}

                    {/* User Notes */}
                    <View style={styles.sectionPadding}>
                        <Text style={styles.sectionTitle}>My Notes</Text>
                        <ClayCard style={{ padding: 0 }}>
                            <ClayInput
                                placeholder="Write your thoughts here..."
                                multiline
                                numberOfLines={4}
                                value={userNote}
                                onChangeText={saveNote}
                                containerStyle={{ height: 120, alignItems: 'flex-start', paddingTop: 12 }}
                                style={{ textAlignVertical: 'top' }}
                            />
                        </ClayCard>
                    </View>

                    {/* Ratings & Reviews */}
                    <ToolReviews toolId={tool._id} />

                    {/* Related Tools */}
                    <RelatedTools
                        category={tool.category}
                        currentToolId={tool._id}
                        onToolPress={onRelatedToolClick}
                    />

                    {/* Bottom Spacer for Sticky Bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
                <View style={styles.stickyBar}>
                    <ClayButton
                        onPress={toggleFavorite}
                        variant="secondary"
                        icon={isFavorite ? 'heart' : 'heart-o'}
                        textStyle={{ color: isFavorite ? clayTheme.accent.error : clayTheme.text.primary }}
                        style={styles.fabSecondary}
                    />
                    {onToggleCompare && (
                        <ClayButton
                            onPress={onToggleCompare}
                            variant="secondary"
                            icon={isComparing ? 'check-square-o' : 'plus-square-o'}
                            textStyle={{ color: isComparing ? clayTheme.accent.primary : clayTheme.text.primary }}
                            style={styles.fabSecondary}
                        />
                    )}
                    <ClayButton
                        title="Visit Website"
                        onPress={openLink}
                        variant="primary"
                        icon="globe"
                        style={styles.fabPrimary}
                    />
                </View>
            </View >
        </Modal >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: clayTheme.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    navHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'android' ? spacing.md : 0,
    },
    navBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0,
        backgroundColor: 'rgba(255,255,255,0.85)',
    },
    navRight: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    heroSection: {
        position: 'relative',
        alignItems: 'center',
        paddingTop: 120,
        paddingBottom: spacing.xl,
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    heroContent: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: spacing.xl,
    },
    heroGlowContainer: {
        position: 'relative',
        marginBottom: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroGlow: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 30,
        opacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 20,
    },
    heroIconContainer: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: 'transparent',
    },
    heroName: {
        fontSize: 32,
        fontWeight: '800',
        color: clayTheme.text.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
        letterSpacing: -1,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    featuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    featuredText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B45309',
    },
    sectionPadding: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    pricingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    pricingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pricingLabel: {
        fontSize: 12,
        color: clayTheme.text.tertiary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    pricingModel: {
        fontSize: 16,
        color: clayTheme.text.primary,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 16,
        fontWeight: '600',
        color: clayTheme.text.secondary,
        marginRight: 2,
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: '800',
        color: clayTheme.text.primary,
    },
    pricePeriod: {
        fontSize: 14,
        color: clayTheme.text.tertiary,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: clayTheme.text.primary,
        marginBottom: spacing.md,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: clayTheme.text.secondary,
        lineHeight: 26,
    },
    gridContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    gridItem: {
        flex: 1,
    },
    specCard: {
        padding: spacing.md,
        minHeight: 140,
    },
    specHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    specTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: clayTheme.text.secondary,
    },
    tagsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    miniTag: {
        backgroundColor: clayTheme.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    miniTagText: {
        fontSize: 11,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    platformTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: clayTheme.background,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    featureTag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    featureTagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        width: '100%',
        marginBottom: 6,
    },
    featureText: {
        fontSize: 13,
        color: clayTheme.text.primary,
        flex: 1,
    },
    moreText: {
        fontSize: 12,
        color: clayTheme.text.tertiary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    verdictContainer: {
        gap: 0,
    },
    verdictCard: {
        padding: spacing.lg,
        borderLeftWidth: 0,
    },
    verdictTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    verdictRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    verdictText: {
        fontSize: 14,
        color: clayTheme.text.secondary,
        lineHeight: 20,
        flex: 1,
    },
    stickyBar: {
        position: 'absolute',
        bottom: 30,
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        zIndex: 100,
    },
    fabSecondary: {
        width: 56,
        height: 56,
        ...clayUtils.card,
        backgroundColor: clayTheme.surface,
        paddingHorizontal: 0,
        borderRadius: 18,
    } as ViewStyle,
    fabPrimary: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        shadowColor: clayTheme.accent.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    freeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    freeBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flexWrap: 'wrap',
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: clayTheme.surface,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    difficultyText: {
        fontSize: 13,
        fontWeight: '600',
        color: clayTheme.text.secondary,
    },
    difficultyDots: {
        flexDirection: 'row',
        gap: 3,
        marginLeft: 4,
    },
    difficultyDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
