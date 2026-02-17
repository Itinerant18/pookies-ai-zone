import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    FlatList,
    TouchableOpacity,
    Keyboard,
    Platform,
    ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { Tool } from '../../types';
import { ToolIcon } from './tool-icon';
import {
    getRecentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
} from '../../utils/search';

/* ─────────── Props ─────────── */

/** Classic inline bar (backward compat) */
interface InlineSearchProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit?: () => void;
    tools?: Tool[];
    onSuggestionSelect?: (name: string) => void;
    testID?: string;
    style?: ViewStyle;
    /** Open modal instead of inline */
    useModal?: false;
}

/** Full-screen modal search */
interface ModalSearchProps {
    useModal: true;
    visible: boolean;
    onClose: () => void;
    onSelectTool: (tool: Tool) => void;
}

type GlobalSearchProps = InlineSearchProps | ModalSearchProps;

/* ─────────── Component ─────────── */

export function GlobalSearch(props: GlobalSearchProps) {
    if ('useModal' in props && props.useModal) {
        return <ModalSearch {...props} />;
    }
    return <InlineSearch {...(props as InlineSearchProps)} />;
}

/* ═══════════  MODAL MODE  ═══════════ */

function ModalSearch({ visible, onClose, onSelectTool }: Omit<ModalSearchProps, 'useModal'>) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<TextInput>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Debounce
    useEffect(() => {
        timerRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [query]);

    // On open
    useEffect(() => {
        if (visible) {
            setQuery('');
            setDebouncedQuery('');
            getRecentSearches().then(setRecentSearches);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [visible]);

    // Convex search
    const searchResults = useQuery(
        api.tools.get,
        debouncedQuery.length >= 2 ? { search: debouncedQuery } : 'skip'
    );

    const handleSelectTool = useCallback(async (tool: Tool) => {
        await addRecentSearch(query.trim() || tool.name);
        Keyboard.dismiss();
        onSelectTool(tool);
        onClose();
    }, [query, onSelectTool, onClose]);

    const handleRecentTap = useCallback((text: string) => {
        setQuery(text);
        setDebouncedQuery(text);
    }, []);

    const handleRemoveRecent = useCallback(async (text: string) => {
        const updated = await removeRecentSearch(text);
        setRecentSearches(updated);
    }, []);

    const handleClearAll = useCallback(async () => {
        await clearRecentSearches();
        setRecentSearches([]);
    }, []);

    const showRecent = !debouncedQuery && recentSearches.length > 0;
    const showResults = debouncedQuery.length >= 2;
    const noResults = showResults && searchResults && searchResults.length === 0;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={modalStyles.container}>
                {/* Header */}
                <View style={modalStyles.header}>
                    <View style={modalStyles.searchBar}>
                        <FontAwesome name="search" size={18} color={clayTheme.text.tertiary} />
                        <TextInput
                            ref={inputRef}
                            style={modalStyles.searchInput}
                            placeholder="Search 320+ AI tools..."
                            placeholderTextColor={clayTheme.text.tertiary}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus={Platform.OS !== 'web'}
                            returnKeyType="search"
                            selectionColor={clayTheme.accent.primary}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
                                <FontAwesome name="times-circle" size={18} color={clayTheme.text.tertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
                        <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Searches */}
                {showRecent && (
                    <View style={modalStyles.recentSection}>
                        <View style={modalStyles.recentHeader}>
                            <Text style={modalStyles.recentTitle}>Recent Searches</Text>
                            <TouchableOpacity onPress={handleClearAll}>
                                <Text style={modalStyles.clearText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        {recentSearches.map((s) => (
                            <TouchableOpacity key={s} style={modalStyles.recentItem} onPress={() => handleRecentTap(s)}>
                                <FontAwesome name="clock-o" size={16} color={clayTheme.text.tertiary} />
                                <Text style={modalStyles.recentText}>{s}</Text>
                                <TouchableOpacity onPress={() => handleRemoveRecent(s)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <FontAwesome name="times" size={14} color={clayTheme.text.tertiary} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Results */}
                {showResults && (
                    <FlatList
                        data={searchResults || []}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={modalStyles.resultItem} onPress={() => handleSelectTool(item)} activeOpacity={0.6}>
                                <ToolIcon url={item.icon_url} letter={item.icon_letter} color={item.color} size={44} borderRadius={12} fontSize={20} />
                                <View style={modalStyles.resultInfo}>
                                    <Text style={modalStyles.resultName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={modalStyles.resultCategory}>{item.category}</Text>
                                </View>
                                <FontAwesome name="chevron-right" size={12} color={clayTheme.text.tertiary} />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={modalStyles.resultsList}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={noResults ? (
                            <View style={modalStyles.emptyState}>
                                <FontAwesome name="search" size={48} color={clayTheme.text.tertiary} />
                                <Text style={modalStyles.emptyTitle}>No tools found</Text>
                                <Text style={modalStyles.emptySubtitle}>Try a different search term</Text>
                            </View>
                        ) : null}
                    />
                )}

                {/* Idle */}
                {!showRecent && !showResults && (
                    <View style={modalStyles.emptyState}>
                        <FontAwesome name="lightbulb-o" size={48} color={clayTheme.text.tertiary} />
                        <Text style={modalStyles.emptyTitle}>Discover AI Tools</Text>
                        <Text style={modalStyles.emptySubtitle}>Search by name, category, or description</Text>
                    </View>
                )}
            </View>
        </Modal>
    );
}

/* ═══════════  INLINE MODE (legacy)  ═══════════ */

function InlineSearch({ value, onChangeText, onSubmit, style }: InlineSearchProps) {
    return (
        <View style={[inlineStyles.container, style]}>
            <FontAwesome name="search" size={16} color={clayTheme.text.tertiary} />
            <TextInput
                style={inlineStyles.input}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                placeholder="Search tools..."
                placeholderTextColor={clayTheme.text.tertiary}
                returnKeyType="search"
                selectionColor={clayTheme.accent.primary}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')}>
                    <FontAwesome name="times-circle" size={16} color={clayTheme.text.tertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

/* ─────────── Styles ─────────── */

const modalStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: clayTheme.background },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : spacing.lg,
        paddingBottom: spacing.md, gap: spacing.md,
        backgroundColor: clayTheme.background,
        borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    },
    searchBar: {
        ...clayUtils.card,
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: clayTheme.surface, borderRadius: 14,
        paddingHorizontal: spacing.md, height: 48, gap: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: 16, color: clayTheme.text.primary, fontWeight: '500' },
    cancelBtn: { paddingVertical: spacing.sm },
    cancelText: { fontSize: 16, color: clayTheme.accent.primary, fontWeight: '600' },
    recentSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    recentHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: spacing.md,
    },
    recentTitle: { fontSize: 14, fontWeight: '700', color: clayTheme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    clearText: { fontSize: 13, color: clayTheme.accent.primary, fontWeight: '600' },
    recentItem: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    recentText: { flex: 1, fontSize: 15, color: clayTheme.text.primary },
    resultsList: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    resultItem: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    resultInfo: { flex: 1 },
    resultName: { fontSize: 16, fontWeight: '600', color: clayTheme.text.primary, marginBottom: 2 },
    resultCategory: { fontSize: 13, color: clayTheme.text.tertiary },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: spacing.md },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: clayTheme.text.primary },
    emptySubtitle: { fontSize: 15, color: clayTheme.text.tertiary, textAlign: 'center' },
});

const inlineStyles = StyleSheet.create({
    container: {
        ...clayUtils.card,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: clayTheme.surface, borderRadius: 14,
        paddingHorizontal: spacing.md, height: 44, gap: spacing.sm,
    },
    input: { flex: 1, fontSize: 15, color: clayTheme.text.primary },
});
