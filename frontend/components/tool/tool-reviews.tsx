import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { clayTheme, spacing, clayUtils } from '../../theme/clay';

const REVIEWS_KEY = 'tool_reviews';

interface Review {
    id: string;
    toolId: string;
    rating: number;            // 1-5
    text: string;
    timestamp: number;
}

interface ToolReviewsProps {
    toolId: string;
}

export function ToolReviews({ toolId }: ToolReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(0);
    const [newText, setNewText] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Load reviews for this tool
    useEffect(() => {
        loadReviews();
    }, [toolId]);

    const loadReviews = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(REVIEWS_KEY);
            const all: Review[] = raw ? JSON.parse(raw) : [];
            setReviews(all.filter(r => r.toolId === toolId));
        } catch { }
    }, [toolId]);

    const submitReview = useCallback(async () => {
        if (newRating === 0) return;
        const review: Review = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            toolId,
            rating: newRating,
            text: newText.trim(),
            timestamp: Date.now(),
        };

        try {
            const raw = await AsyncStorage.getItem(REVIEWS_KEY);
            const all: Review[] = raw ? JSON.parse(raw) : [];
            all.unshift(review);
            await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
            setReviews(prev => [review, ...prev]);
            setNewRating(0);
            setNewText('');
            setShowForm(false);
        } catch { }
    }, [toolId, newRating, newText]);

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setShowForm(!showForm)}
                >
                    <FontAwesome name={showForm ? 'minus' : 'plus'} size={12} color={clayTheme.accent.primary} />
                    <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Add'}</Text>
                </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryRow}>
                <View style={styles.ratingBig}>
                    <Text style={styles.ratingNumber}>
                        {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                    </Text>
                    <StarRow rating={Math.round(avgRating)} size={16} />
                </View>
                <Text style={styles.reviewCount}>
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </Text>
            </View>

            {/* Add Review Form */}
            {showForm && (
                <View style={styles.formCard}>
                    <Text style={styles.formLabel}>Your Rating</Text>
                    <View style={styles.starInput}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <TouchableOpacity
                                key={n}
                                onPress={() => setNewRating(n)}
                                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            >
                                <FontAwesome
                                    name={n <= newRating ? 'star' : 'star-o'}
                                    size={28}
                                    color={n <= newRating ? '#F59E0B' : clayTheme.text.tertiary}
                                    style={{ marginRight: 4 }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Write a short review (optional)..."
                        placeholderTextColor={clayTheme.text.tertiary}
                        value={newText}
                        onChangeText={setNewText}
                        multiline
                        numberOfLines={3}
                    />
                    <TouchableOpacity
                        style={[styles.submitBtn, newRating === 0 && styles.submitBtnDisabled]}
                        onPress={submitReview}
                        disabled={newRating === 0}
                    >
                        <Text style={styles.submitBtnText}>Submit Review</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Reviews List */}
            {reviews.length > 0 && (
                <View style={styles.reviewsList}>
                    {reviews.slice(0, 5).map(review => (
                        <View key={review.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <StarRow rating={review.rating} size={12} />
                                <Text style={styles.reviewDate}>{formatDate(review.timestamp)}</Text>
                            </View>
                            {review.text ? (
                                <Text style={styles.reviewText}>{review.text}</Text>
                            ) : null}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <FontAwesome
                    key={n}
                    name={n <= rating ? 'star' : 'star-o'}
                    size={size}
                    color={n <= rating ? '#F59E0B' : '#E0E0E0'}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: clayTheme.text.primary,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: clayTheme.accent.primary + '12',
    },
    addBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: clayTheme.accent.primary,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: spacing.md,
    },
    ratingBig: {
        alignItems: 'center',
        gap: 4,
    },
    ratingNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: clayTheme.text.primary,
        letterSpacing: -1,
    },
    reviewCount: {
        fontSize: 13,
        color: clayTheme.text.secondary,
    },
    formCard: {
        ...clayUtils.card,
        padding: spacing.md,
        marginBottom: spacing.md,
    } as ViewStyle,
    formLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: clayTheme.text.secondary,
        marginBottom: 6,
    },
    starInput: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    textInput: {
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: clayTheme.text.primary,
        marginBottom: spacing.sm,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: clayTheme.accent.primary,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.4,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    reviewsList: {
        gap: 8,
    },
    reviewItem: {
        ...clayUtils.card,
        padding: 12,
    } as ViewStyle,
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    reviewDate: {
        fontSize: 11,
        color: clayTheme.text.tertiary,
    },
    reviewText: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        lineHeight: 18,
    },
});
