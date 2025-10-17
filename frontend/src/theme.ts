import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

// Enhanced Brand Colors - WUH Medical System
const brandColors = {
  primary: {
    main: '#6B4FA5',
    light: '#9B7BC4',
    lighter: '#E7E0F0',
    dark: '#4A2F7F',
    darker: '#2D1B4D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F17422',
    light: '#FF9452',
    lighter: '#FFE0CC',
    dark: '#C15412',
    darker: '#8B2E0A',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    lighter: '#D1FAE5',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    lighter: '#FEF3C7',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    lighter: '#FEE2E2',
    dark: '#DC2626',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    lighter: '#DBEAFE',
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
  h1: { fontWeight: 800, fontSize: '2.75rem', lineHeight: 1.1, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2, letterSpacing: '-0.01em' },
  h3: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.3, letterSpacing: '-0.005em' },
  h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
  h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.5 },
  h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
  subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
  subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6 },
  body1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.6, letterSpacing: '0.3px' },
  body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.6, letterSpacing: '0.25px' },
  button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.3px' },
  caption: { fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.4 },
};

const commonComponentStyles = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none' as const,
        fontWeight: 600,
        padding: '10px 20px',
        transition: 'all 0.3s ease',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #6B4FA5 0%, #8B6FB8 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5A3B8F 0%, #7A5DA2 100%)',
        },
      },
      containedSecondary: {
        background: 'linear-gradient(135deg, #F17422 0%, #FF9452 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #DC6517 0%, #ED7D3B 100%)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
      },
      text: {
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    defaultProps: {
      disableElevation: false,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        border: 'none',
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: '12px',
      },
      elevation0: {
        boxShadow: 'none',
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.75rem',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            '& fieldset': {
              borderColor: 'currentColor',
            },
          },
        },
      },
    },
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        border: 'none',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: alpha('#000', 0.08),
      },
    },
  },
};

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...brandColors,
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      disabled: '#CBD5E0',
    },
    divider: '#E2E8F0',
    action: {
      hover: alpha('#6B4FA5', 0.04),
      selected: alpha('#6B4FA5', 0.08),
    },
  },
  typography,
  shape: { borderRadius: 12 },
  components: commonComponentStyles,
};

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...brandColors,
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E0',
      disabled: '#64748B',
    },
    divider: '#334155',
    action: {
      hover: alpha('#9B7BC4', 0.08),
      selected: alpha('#9B7BC4', 0.12),
    },
  },
  typography,
  shape: { borderRadius: 12 },
  components: commonComponentStyles,
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
export const theme = lightTheme; // default
