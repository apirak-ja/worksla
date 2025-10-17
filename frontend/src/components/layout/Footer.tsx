/**
 * Footer Component
 * แถบล่างของระบบ - Modern Design
 */

import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider, useTheme, alpha, IconButton } from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';

export const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)'
          : 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #7B5BA4 0%, #F17422 50%, #7B5BA4 100%)',
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Main Footer Content */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          mb={3}
        >
          {/* Organization Info */}
          <Box textAlign={{ xs: 'center', md: 'left' }} maxWidth={400}>
            <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
              ระบบรายงานตัวชี้วัด WorkSLA
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              ระบบติดตามและรายงานการปฏิบัติตาม Service Level Agreement (SLA) 
              สำหรับ Open Project
            </Typography>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }}>
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'info.main' }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'success.main' }}>
                <LanguageIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Contact Info */}
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
              ติดต่อเรา
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  075-672-000
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  info@wuh.ac.th
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
              ลิงก์ด่วน
            </Typography>
            <Stack spacing={0.5}>
              <Link
                href="#"
                underline="hover"
                color="text.secondary"
                variant="caption"
                sx={{
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                คู่มือการใช้งาน
              </Link>
              <Link
                href="#"
                underline="hover"
                color="text.secondary"
                variant="caption"
                sx={{
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link
                href="#"
                underline="hover"
                color="text.secondary"
                variant="caption"
                sx={{
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                เงื่อนไขการใช้งาน
              </Link>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Bottom Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Credits */}
          <Box textAlign={{ xs: 'center', sm: 'left' }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap',
              }}
            >
              พัฒนาด้วย <FavoriteIcon sx={{ fontSize: 12, color: 'error.main', animation: 'heartbeat 1.5s ease-in-out infinite' }} /> โดย
              <Typography component="span" variant="caption" fontWeight={700} color="primary.main">
                กลุ่มงานโครงสร้างพื้นฐานดิจิทัลทางการแพทย์
              </Typography>
            </Typography>
          </Box>

          {/* Version & Copyright */}
          <Box textAlign={{ xs: 'center', sm: 'right' }}>
            <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />} justifyContent={{ xs: 'center', sm: 'flex-end' }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                v2.0.0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                © {currentYear} WUH
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Container>

      {/* Add heartbeat animation */}
      <style>
        {`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
            50% { transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
};

export default Footer;
