/**
 * MUI Component Style Overrides
 * การปรับแต่ง style สำหรับ MUI Components
 */

import { alpha, Components, Theme } from '@mui/material/styles';

export const componentOverrides: Components<Omit<Theme, 'components'>> = {
  // Button
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '10px',
        textTransform: 'none',
        fontWeight: 600,
        padding: '10px 24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        background: 'linear-gradient(135deg, #7B5BA4 0%, #9F7DC1 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5A3D7F 0%, #7B5BA4 100%)',
          boxShadow: '0 12px 32px rgba(123, 91, 164, 0.4)',
        },
      },
      containedSecondary: {
        background: 'linear-gradient(135deg, #F17422 0%, #FF9452 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #DC6517 0%, #ED7D3B 100%)',
          boxShadow: '0 12px 32px rgba(241, 116, 34, 0.4)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
          backgroundColor: alpha('#7B5BA4', 0.04),
        },
      },
      text: {
        '&:hover': {
          backgroundColor: alpha('#7B5BA4', 0.04),
        },
      },
      sizeLarge: {
        padding: '12px 32px',
        fontSize: '1rem',
      },
      sizeMedium: {
        padding: '10px 24px',
        fontSize: '0.9375rem',
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.875rem',
      },
    },
    defaultProps: {
      disableElevation: false,
    },
  },

  // Card
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        border: 'none',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-4px)',
        },
      },
    },
  },

  // Paper
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
      elevation2: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)',
      },
      elevation3: {
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
      },
      rounded: {
        borderRadius: '12px',
      },
    },
  },

  // AppBar
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)',
      },
    },
  },

  // Drawer
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },

  // IconButton
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '10px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: alpha('#7B5BA4', 0.08),
        },
      },
    },
  },

  // Chip
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.8125rem',
        transition: 'all 0.2s ease',
      },
      filled: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },

  // TextField
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          '&:hover': {
            '& fieldset': {
              borderColor: '#7B5BA4',
            },
          },
          '&.Mui-focused': {
            '& fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
  },

  // Select
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: '10px',
      },
    },
  },

  // Menu
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        marginTop: '8px',
      },
      list: {
        padding: '8px',
      },
    },
  },

  // MenuItem
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        margin: '2px 0',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: alpha('#7B5BA4', 0.08),
        },
        '&.Mui-selected': {
          backgroundColor: alpha('#7B5BA4', 0.12),
          '&:hover': {
            backgroundColor: alpha('#7B5BA4', 0.16),
          },
        },
      },
    },
  },

  // Dialog
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.20)',
      },
    },
  },

  // Table
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: alpha('#000', 0.08),
      },
      head: {
        fontWeight: 600,
        backgroundColor: alpha('#7B5BA4', 0.04),
      },
    },
  },

  // Tabs
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.9375rem',
        transition: 'all 0.2s ease',
        '&:hover': {
          color: '#7B5BA4',
          backgroundColor: alpha('#7B5BA4', 0.04),
        },
      },
    },
  },

  // Alert
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        padding: '12px 16px',
      },
      filled: {
        fontWeight: 500,
      },
    },
  },

  // Switch
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: 8,
      },
      switchBase: {
        '&.Mui-checked': {
          color: '#7B5BA4',
          '& + .MuiSwitch-track': {
            backgroundColor: '#7B5BA4',
          },
        },
      },
    },
  },

  // Checkbox & Radio
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: alpha('#7B5BA4', 0.6),
        '&.Mui-checked': {
          color: '#7B5BA4',
        },
      },
    },
  },

  MuiRadio: {
    styleOverrides: {
      root: {
        color: alpha('#7B5BA4', 0.6),
        '&.Mui-checked': {
          color: '#7B5BA4',
        },
      },
    },
  },

  // Tooltip
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: alpha('#1A202C', 0.92),
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.8125rem',
      },
      arrow: {
        color: alpha('#1A202C', 0.92),
      },
    },
  },

  // Stepper
  MuiStepIcon: {
    styleOverrides: {
      root: {
        '&.Mui-active': {
          color: '#7B5BA4',
        },
        '&.Mui-completed': {
          color: '#10B981',
        },
      },
    },
  },

  // Linear Progress
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        height: 8,
      },
      bar: {
        borderRadius: '8px',
      },
    },
  },

  // Circular Progress
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        color: '#7B5BA4',
      },
    },
  },
};
