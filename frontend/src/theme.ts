import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7C3AED', // Purple
      light: '#A855F7',
      dark: '#5B21B6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EC4899', // Pink
      light: '#F472B6',
      dark: '#BE185D',
    },
    success: {
      main: '#10B981', // Emerald
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6', // Blue
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#FAFAFA', // Neutral-50
      paper: '#FFFFFF',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#374151',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6B7280',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#9CA3AF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          paddingX: '1rem',
          paddingY: '0.5rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          border: '1px solid #F3F4F6',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          border: '1px solid #F3F4F6',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: '#EDE9FE',
          color: '#7C3AED',
        },
        colorSuccess: {
          backgroundColor: '#D1FAE5',
          color: '#059669',
        },
        colorWarning: {
          backgroundColor: '#FEF3C7',
          color: '#D97706',
        },
        colorError: {
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.75rem',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#A855F7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#7C3AED',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #F3F4F6',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FAFAFA',
          borderRight: '1px solid #F3F4F6',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          margin: '0.25rem 0.5rem',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          '&.Mui-selected': {
            backgroundColor: '#EDE9FE',
            color: '#7C3AED',
            '&:hover': {
              backgroundColor: '#DDD6FE',
            },
          },
        },
      },
    },
  },
} as any)
