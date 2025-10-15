import { createTheme, ThemeOptions } from '@mui/material/styles';

// Brand Colors - Purple/Orange Modern (WUH)
const brandColors = {
  primary: {
    main: '#7B5BA4',
    light: '#9B7BC4',
    dark: '#5B3B84',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F17422',
    light: '#FF9452',
    dark: '#C15412',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
};

const typography = {
  fontFamily: [
    '"IBM Plex Sans Thai"',
    'IBM Plex Sans',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ].join(','),
  h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
  h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.3 },
  h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.4 },
  h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
  h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.5 },
  h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
  button: { fontWeight: 500, textTransform: 'none' as const },
};

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...brandColors,
    background: { default: '#F8F9FA', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280' },
  },
  typography,
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: 'none' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7B5BA4 0%, #9B7BC4 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      },
    },
  },
};

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...brandColors,
    background: { default: '#111827', paper: '#1F2937' },
    text: { primary: '#F9FAFB', secondary: '#D1D5DB' },
  },
  typography,
  shape: { borderRadius: 12 },
  components: lightThemeOptions.components,
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
export const theme = lightTheme; // default
