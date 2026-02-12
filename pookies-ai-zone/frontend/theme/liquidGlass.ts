import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// ─── Unified Dark Glass Theme ─────────────────────────────────────────
export const liquidGlassTheme = {
  // Surfaces
  background: '#09090B',
  surface: '#18181B',
  elevated: '#27272A',

  // Text
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    inverse: '#09090B',
  },

  // Accent palette
  accent: {
    primary: '#6366F1',     // Indigo
    secondary: '#8B5CF6',   // Violet
    tertiary: '#818CF8',    // Indigo light
    success: '#10B981',     // Green
    warning: '#F59E0B',     // Amber
    error: '#EF4444',       // Red
  },

  // Category Colors mapping
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

  // Glass morphism tokens
  glass: {
    background: 'rgba(24, 24, 27, 0.8)',
    backgroundLight: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderActive: 'rgba(255, 255, 255, 0.12)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },

  // Gradients (start/end pairs for LinearGradient)
  gradient: {
    accent: ['#6366F1', '#8B5CF6'],
    surface: ['#18181B', '#09090B'],
    card: ['rgba(24,24,27,0.9)', 'rgba(24,24,27,0.6)'],
  },
};

// ─── Typography ────────────────────────────────────────────────────────
export const typography = {
  heading: {
    h1: { fontSize: Math.min(32, width * 0.08), fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: Math.min(24, width * 0.06), fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: Math.min(20, width * 0.05), fontWeight: '600' as const, letterSpacing: -0.2 },
    h4: { fontSize: Math.min(18, width * 0.045), fontWeight: '600' as const, letterSpacing: 0 },
  },
  body: {
    large: { fontSize: Math.min(18, width * 0.045), lineHeight: 28 },
    medium: { fontSize: Math.min(16, width * 0.04), lineHeight: 24 },
    small: { fontSize: Math.min(14, width * 0.035), lineHeight: 20 },
    caption: { fontSize: Math.min(12, width * 0.03), lineHeight: 16 },
  },
  label: {
    fontSize: Math.min(12, width * 0.03),
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: liquidGlassTheme.text.tertiary,
  },
};

// ─── Spacing ───────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

// ─── Glass Utility Generators ──────────────────────────────────────────
export const glassUtils = {
  card: {
    backgroundColor: liquidGlassTheme.surface,
    borderColor: liquidGlassTheme.glass.border,
    borderWidth: 1,
    borderRadius: liquidGlassTheme.glass.borderRadius,
    shadowColor: liquidGlassTheme.glass.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPressed: {
    backgroundColor: liquidGlassTheme.elevated,
    borderColor: liquidGlassTheme.glass.borderActive,
  },
  pill: {
    backgroundColor: liquidGlassTheme.elevated,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchBar: {
    backgroundColor: liquidGlassTheme.surface,
    borderColor: liquidGlassTheme.glass.border,
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
};