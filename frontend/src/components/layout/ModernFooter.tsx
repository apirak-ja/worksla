/**
 * Modern Footer Component
 * ออกแบบใหม่ - สวยงาม ทันสมัย มีสีสัน
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Chip,
  Divider,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

export const ModernFooter: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
        borderTop: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.8),
        backdropFilter: 'blur(10px)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            {/* Brand & Description */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 400 }}>
              <Typography 
                variant="h6" 
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                WorkSLA Pro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                ระบบบริหารจัดการและติดตามตัวชี้วัด SLA สำหรับโรงพยาบาลวไลยอลงกรณ์ ในพระบรมราชูปถัมภ์
              </Typography>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Chip
                  label="v3.0 Ultra"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                />
                <Chip
                  label="Production"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                />
              </Stack>
            </Box>

            {/* Contact Info */}
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom color="primary">
                ติดต่อเรา
              </Typography>
              <Stack spacing={1} alignItems={{ xs: 'center', md: 'flex-end' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    โรงพยาบาลวไลยอลงกรณ์ ในพระบรมราชูปถัมภ์
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    075-672000
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    info@wuh.go.th
                  </Typography>
                </Stack>
              </Stack>
              
              {/* Social Links */}
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-end' }} sx={{ mt: 2 }}>
                <Tooltip title="GitHub Repository">
                  <IconButton
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Email Support">
                  <IconButton
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.info.main, 0.2),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Copyright */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary" textAlign={{ xs: 'center', sm: 'left' }}>
              © {currentYear} WorkSLA Pro. All rights reserved. โรงพยาบาลวไลยอลงกรณ์ ในพระบรมราชูปถัมภ์
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Made with
              </Typography>
              <FavoriteIcon sx={{ fontSize: 14, color: 'error.main', animation: 'heartbeat 1.5s ease-in-out infinite' }} />
              <Typography variant="caption" color="text.secondary">
                by IT Team
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Container>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.2); }
          20%, 40% { transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
};

export default ModernFooter;
