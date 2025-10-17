/**
 * Light Theme Configuration
 * โหมดสว่าง
 */

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';
import { brandColors } from './colors';
import { typography } from './typography';
import { componentOverrides } from './components';

const lightPalette = {
  mode: 'light' as const,
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
    active: '#7B5BA4',
    hover: alpha('#7B5BA4', 0.04),
    selected: alpha('#7B5BA4', 0.08),
    disabled: '#CBD5E0',
    disabledBackground: '#E2E8F0',
  },
};

export const lightThemeOptions: ThemeOptions = {
  palette: lightPalette,
  typography,
  shape: {
    borderRadius: 12,
  },
  components: componentOverrides,
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.10)',
    '0 12px 24px rgba(0,0,0,0.12)',
    '0 16px 32px rgba(0,0,0,0.14)',
    '0 20px 40px rgba(0,0,0,0.16)',
    '0 24px 48px rgba(0,0,0,0.18)',
    '0 28px 56px rgba(0,0,0,0.20)',
    '0 32px 64px rgba(0,0,0,0.22)',
    '0 36px 72px rgba(0,0,0,0.24)',
    '0 40px 80px rgba(0,0,0,0.26)',
    '0 44px 88px rgba(0,0,0,0.28)',
    '0 48px 96px rgba(0,0,0,0.30)',
    '0 52px 104px rgba(0,0,0,0.32)',
    '0 56px 112px rgba(0,0,0,0.34)',
    '0 60px 120px rgba(0,0,0,0.36)',
    '0 64px 128px rgba(0,0,0,0.38)',
    '0 68px 136px rgba(0,0,0,0.40)',
    '0 72px 144px rgba(0,0,0,0.42)',
    '0 76px 152px rgba(0,0,0,0.44)',
    '0 80px 160px rgba(0,0,0,0.46)',
    '0 84px 168px rgba(0,0,0,0.48)',
    '0 88px 176px rgba(0,0,0,0.50)',
    '0 92px 184px rgba(0,0,0,0.52)',
  ],
};

export const lightTheme = createTheme(lightThemeOptions);
