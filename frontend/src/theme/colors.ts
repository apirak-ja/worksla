/**
 * WUH Medical System - Color Palette
 * ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์
 * 
 * Primary Color: #7B5BA4 (Purple - สีม่วง)
 * Accent Color: #F17422 (Orange - สีส้ม)
 */

export const brandColors = {
  // Primary - Hospital Purple
  primary: {
    main: '#7B5BA4',
    light: '#9F7DC1',
    lighter: '#E9E1F0',
    dark: '#5A3D7F',
    darker: '#3A2455',
    contrastText: '#FFFFFF',
  },
  
  // Secondary - Accent Orange
  secondary: {
    main: '#F17422',
    light: '#FF9452',
    lighter: '#FFE0CC',
    dark: '#C15412',
    darker: '#8B2E0A',
    contrastText: '#FFFFFF',
  },
  
  // Success - Green
  success: {
    main: '#10B981',
    light: '#34D399',
    lighter: '#D1FAE5',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  
  // Warning - Yellow
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    lighter: '#FEF3C7',
    dark: '#D97706',
    contrastText: '#1A202C',
  },
  
  // Error - Red
  error: {
    main: '#EF4444',
    light: '#F87171',
    lighter: '#FEE2E2',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  
  // Info - Blue
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    lighter: '#DBEAFE',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #7B5BA4 0%, #9F7DC1 100%)',
  secondary: 'linear-gradient(135deg, #F17422 0%, #FF9452 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  dark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  light: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
};
