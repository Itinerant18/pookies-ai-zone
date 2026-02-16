import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// ─── Unified Clay Theme ───────────────────────────────────────────────
export const clayTheme = {
    // Surfaces
    background: '#EAEFF5', // Slightly deeper/blue-grey for better white contrast
    surface: '#FFFFFF',
    elevated: '#FFFFFF',

    // Text
    text: {
        primary: '#2D3436',    // Soft Charcoal
        secondary: '#636E72',  // Cool Grey
        tertiary: '#B2BEC3',   // Light Grey
        inverse: '#FFFFFF',
    },

    // Accent palette - Pasteled/Softened versions of original or generous vibrant pops
    accent: {
        primary: '#6C5DD3',     // Soft Purple
        secondary: '#A0D7E7',   // Light Blue
        tertiary: '#FF754C',    // Coral
        success: '#00B894',     // Mint Green
        warning: '#FDCB6E',     // Mustard Yellow
        error: '#FF7675',       // Salmon Red
    },

    // Category Colors mapping (Keeping vibrant for contrast against white)
    categories: {
        '3D & Creative': '#10B981',
        'API & Testing': '#6366F1',
        'Analytics': '#00A4EF',
        'Assistants & Agents': '#F97316',
        'Automation & Prod.': '#FF6D5A',
        'Browsers': '#FC5C65',
        'CRM & Support': '#FF7A59',
        'Chatbots': '#10A37F',
        'Creative & Design': '#EC4899',
        'Data & Analytics': '#F97316',
        'Database & Backend': '#3ECF8E',
        'Deployment & Host.': '#00C7B7',
        'Design & UI': '#A259FF',
        'Dev & Engineering': '#22C55E',
        'Document Analysis': '#3B82F6',
        'E-commerce': '#96BF48',
        'Editors & IDEs': '#7C3AED',
        'Finance': '#00D09C',
        'Form Builders': '#FFA500',
        'HR & Recruitment': '#FF6B6B',
        'Health & Wellness': '#22C55E',
        'Image Generation': '#8B5CF6',
        'Industry-Specific': '#6366F1',
        'LLMs & Chatbots': '#FF6D00',
        'Learning & Edu.': '#0056D2',
        'Legal': '#003366',
        'Marketing & Sales': '#7C3AED',
        'Monitoring & Obs.': '#632CA6',
        'Music & Audio': '#6366F1',
        'Note-taking': '#000000',
        'Productivity': '#F97316',
        'Research & Edu.': '#6366F1',
        'Security & Privacy': '#EF4444',
        'Social Media': '#377E00',
        'Spreadsheets': '#217346',
        'Task Management': '#FF3D57',
        'Translation': '#0F2B46',
        'Video Generation': '#FF6B00',
        'Web & App Builders': '#EF4444',
        'Writing & Content': '#10B981',
    },

    // Clay / Neumorphism tokens
    clay: {
        background: '#FFFFFF',
        shadowDark: '#C9D1D9', // Darker shadow for depth
        shadowLight: '#FFFFFF', // Highlight
        borderRadius: 24,
        borderWidth: 0,
    },

    // Gradients (Optional for "Pressed" states or accents)
    gradient: {
        accent: ['#6C5DD3', '#8B5CF6'],
        surface: ['#FFFFFF', '#F2F4F8'],
        card: ['#FFFFFF', '#FFFFFF'],
    },
};

// ─── Typography ────────────────────────────────────────────────────────
export const typography = {
    heading: {
        h1: { fontSize: Math.min(32, width * 0.08), fontWeight: '800' as const, letterSpacing: -0.5, color: clayTheme.text.primary },
        h2: { fontSize: Math.min(24, width * 0.06), fontWeight: '700' as const, letterSpacing: -0.5, color: clayTheme.text.primary },
        h3: { fontSize: Math.min(20, width * 0.05), fontWeight: '700' as const, letterSpacing: -0.3, color: clayTheme.text.primary },
        h4: { fontSize: Math.min(18, width * 0.045), fontWeight: '600' as const, letterSpacing: 0, color: clayTheme.text.primary },
    },
    body: {
        large: { fontSize: Math.min(18, width * 0.045), lineHeight: 28, color: clayTheme.text.secondary },
        medium: { fontSize: Math.min(16, width * 0.04), lineHeight: 24, color: clayTheme.text.secondary },
        small: { fontSize: Math.min(14, width * 0.035), lineHeight: 20, color: clayTheme.text.secondary },
        caption: { fontSize: Math.min(12, width * 0.03), lineHeight: 16, color: clayTheme.text.tertiary },
    },
    label: {
        fontSize: Math.min(12, width * 0.03),
        fontWeight: '700' as const,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.8,
        color: clayTheme.text.tertiary,
    },
};

// ─── Spacing ───────────────────────────────────────────────────────────
export const spacing = {
    xs: 6,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 56,
};

// ─── Clay Utility Generators ──────────────────────────────────────────
export const clayUtils = {
    card: {
        backgroundColor: clayTheme.clay.background,
        borderRadius: clayTheme.clay.borderRadius,
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.25, // Increased opacity for distinct look
        shadowRadius: 16,
        elevation: 8,
        // Optional border for definition
        // borderWidth: 1,
        // borderColor: 'rgba(255,255,255,0.6)',
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pill: {
        backgroundColor: clayTheme.surface,
        borderRadius: 30,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2, // Slightly more pronounced
        shadowRadius: 8,
        elevation: 4,
    },
    button: {
        backgroundColor: clayTheme.surface,
        borderRadius: 16, // Squircle-ish
        paddingHorizontal: 20,
        paddingVertical: 14,
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    // New utility for inset/impressed look (e.g. search bars, inputs)
    inset: {
        backgroundColor: '#F0F4F8', // Slightly darker than surface to mimic hole
        borderRadius: 16,
        // Inner shadow simulation via heavy top-left border/shadow hack or just flat color
        // In RN, we rely on flat color + optional internal logic or just distinct styling
        borderColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        // No heavy drop shadow for inputs
        shadowColor: '#fff',
        shadowOffset: { width: -2, height: -2 }, // Bottom right highlight?
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    searchBar: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 56,
        paddingHorizontal: 20,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
    },
};
