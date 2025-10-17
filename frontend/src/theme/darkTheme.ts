/**
 * Dark Theme Configuration
 * โหมดมืด
 */

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';
import { brandColors } from './colors';
import { typography } from './typography';
import { componentOverrides } from './components';

const darkPalette = {
  mode: 'dark' as const,
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
    active: '#9F7DC1',
    hover: alpha('#9F7DC1', 0.08),
    selected: alpha('#9F7DC1', 0.12),
    disabled: '#64748B',
    disabledBackground: '#334155',
  },
};

export const darkThemeOptions: ThemeOptions = {
  palette: darkPalette,
  typography,
  shape: {
    borderRadius: 12,
  },
  components: componentOverrides,
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.25)',
    '0 4px 8px rgba(0,0,0,0.28)',
    '0 8px 16px rgba(0,0,0,0.30)',
    '0 12px 24px rgba(0,0,0,0.32)',
    '0 16px 32px rgba(0,0,0,0.34)',
    '0 20px 40px rgba(0,0,0,0.36)',
    '0 24px 48px rgba(0,0,0,0.38)',
    '0 28px 56px rgba(0,0,0,0.40)',
    '0 32px 64px rgba(0,0,0,0.42)',
    '0 36px 72px rgba(0,0,0,0.44)',
    '0 40px 80px rgba(0,0,0,0.46)',
    '0 44px 88px rgba(0,0,0,0.48)',
    '0 48px 96px rgba(0,0,0,0.50)',
    '0 52px 104px rgba(0,0,0,0.52)',
    '0 56px 112px rgba(0,0,0,0.54)',
    '0 60px 120px rgba(0,0,0,0.56)',
    '0 64px 128px rgba(0,0,0,0.58)',
    '0 68px 136px rgba(0,0,0,0.60)',
    '0 72px 144px rgba(0,0,0,0.62)',
    '0 76px 152px rgba(0,0,0,0.64)',
    '0 80px 160px rgba(0,0,0,0.66)',
    '0 84px 168px rgba(0,0,0,0.68)',
    '0 88px 176px rgba(0,0,0,0.70)',
    '0 92px 184px rgba(0,0,0,0.72)',
  ],
};

export const darkTheme = createTheme(darkThemeOptions);
