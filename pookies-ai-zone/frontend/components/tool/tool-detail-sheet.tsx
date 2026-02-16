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
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { Tool } from '../../types';
import { ToolIcon } from '../../components/ui/tool-icon';
import { ClayButton } from '../../components/ui/clay-button';
import { ClayChip } from '../../components/ui/clay-chip';
import { ClayCard } from '../../components/ui/clay-card';
import { ClayInput } from '../../components/ui/clay-input';
import { AnimatedPress } from '../../components/ui/animated-press';
import { RelatedTools } from '../../components/tool/related-tools';

const { width, height } = Dimensions.get('window');

interface ToolDetailSheetProps {
    tool: Tool | null;
    visible: boolean;
    onClose: () => void;
    onRelatedToolClick?: (tool: Tool) => void;
}

export const ToolDetailSheet: React.FC<ToolDetailSheetProps> = ({ tool, visible, onClose, onRelatedToolClick }) => {
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

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Navigation Header */}
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
                                onPress={() => { /* share */ }}
                                variant="secondary"
                                size="sm"
                                icon="share-square-o"
                                style={styles.navBtn}
                            />
                        </View>
                    </SafeAreaView>

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
                    {tool.pricing && (
                        <View style={styles.sectionPadding}>
                            <ClayCard style={styles.pricingCard}>
                                <View style={styles.pricingHeader}>
                                    <View style={[styles.pricingIcon, { backgroundColor: primaryColor + '20' }]}>
                                        <FontAwesome name="tag" size={18} color={primaryColor} />
                                    </View>
                                    <View>
                                        <Text style={styles.pricingLabel}>Pricing Model</Text>
                                        <Text style={styles.pricingModel}>{tool.pricing.model}</Text>
                                    </View>
                                </View>
                                {tool.pricing.starting_price !== undefined && (
                                    <View style={styles.priceTag}>
                                        <Text style={styles.currency}>{tool.pricing.currency || '$'}</Text>
                                        <Text style={styles.priceAmount}>{tool.pricing.starting_price}</Text>
                                        <Text style={styles.pricePeriod}>/mo</Text>
                                    </View>
                                )}
                            </ClayCard>
                        </View>
                    )}

                    {/* Two-Column Grid for Features & Platforms */}
                    <View style={styles.gridContainer}>
                        {/* Platforms */}
                        {tool.platforms && tool.platforms.length > 0 && (
                            <View style={[styles.gridItem, { marginRight: 8 }]}>
                                <ClayCard style={styles.specCard}>
                                    <View style={styles.specHeader}>
                                        <FontAwesome name="desktop" size={16} color={clayTheme.text.secondary} />
                                        <Text style={styles.specTitle}>Platforms</Text>
                                    </View>
                                    <View style={styles.tagsWrap}>
                                        {tool.platforms.map((p: string) => (
                                            <View key={p} style={styles.miniTag}>
                                                <Text style={styles.miniTagText}>{p}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ClayCard>
                            </View>
                        )}

                        {/* Features */}
                        {tool.features && tool.features.length > 0 && (
                            <View style={[styles.gridItem, { marginLeft: 8 }]}>
                                <ClayCard style={styles.specCard}>
                                    <View style={styles.specHeader}>
                                        <FontAwesome name="bolt" size={16} color={clayTheme.text.secondary} />
                                        <Text style={styles.specTitle}>Features</Text>
                                    </View>
                                    <View style={styles.tagsWrap}>
                                        {tool.features.slice(0, 3).map((f: string) => (
                                            <View key={f} style={styles.featureRow}>
                                                <FontAwesome name="check" size={12} color={clayTheme.accent.success} />
                                                <Text style={styles.featureText} numberOfLines={1}>{f}</Text>
                                            </View>
                                        ))}
                                        {tool.features.length > 3 && (
                                            <Text style={styles.moreText}>+{tool.features.length - 3} more</Text>
                                        )}
                                    </View>
                                </ClayCard>
                            </View>
                        )}
                    </View>

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

                    {/* Related Tools */}
                    <RelatedTools
                        category={tool.category}
                        currentToolId={tool._id}
                        onToolPress={onRelatedToolClick}
                    />

                    {/* Bottom Spacer for Sticky Bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Sticky Action Bar */}
                <View style={styles.stickyBar}>
                    <ClayButton
                        onPress={toggleFavorite}
                        variant="secondary"
                        icon={isFavorite ? 'heart' : 'heart-o'}
                        textStyle={{ color: isFavorite ? clayTheme.accent.error : clayTheme.text.primary }}
                        style={styles.fabSecondary}
                    />
                    <ClayButton
                        title="Visit Website"
                        onPress={openLink}
                        variant="primary"
                        icon="globe"
                        style={styles.fabPrimary}
                    />
                </View>
            </View>
        </Modal>
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
    }
});
