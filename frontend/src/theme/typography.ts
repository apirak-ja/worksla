/**
 * Typography System
 * IBM Plex Sans Thai + IBM Plex Sans
 */

export const typography = {
  fontFamily: [
    '"IBM Plex Sans Thai"',
    'IBM Plex Sans',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  
  // Headings
  h1: {
    fontWeight: 800,
    fontSize: '2.75rem',    // 44px
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.25rem',    // 36px
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 700,
    fontSize: '1.875rem',   // 30px
    lineHeight: 1.3,
    letterSpacing: '-0.005em',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',     // 24px
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',    // 20px
    lineHeight: 1.5,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',       // 16px
    lineHeight: 1.5,
  },
  
  // Body
  subtitle1: {
    fontWeight: 500,
    fontSize: '1rem',       // 16px
    lineHeight: 1.5,
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '0.875rem',   // 14px
    lineHeight: 1.6,
  },
  body1: {
    fontWeight: 400,
    fontSize: '1rem',       // 16px
    lineHeight: 1.6,
    letterSpacing: '0.3px',
  },
  body2: {
    fontWeight: 400,
    fontSize: '0.875rem',   // 14px
    lineHeight: 1.6,
    letterSpacing: '0.25px',
  },
  
  // Button
  button: {
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.3px',
    fontSize: '0.9375rem',  // 15px
  },
  
  // Caption & Overline
  caption: {
    fontWeight: 400,
    fontSize: '0.75rem',    // 12px
    lineHeight: 1.4,
  },
  overline: {
    fontWeight: 600,
    fontSize: '0.75rem',    // 12px
    lineHeight: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
};
