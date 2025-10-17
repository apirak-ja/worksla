/**
 * Footer Component
 * แถบล่างของระบบ
 */

import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider, useTheme, alpha } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';

export const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.5)
          : alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Organization Info */}
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Typography variant="body2" fontWeight={600} color="text.primary" gutterBottom>
              ระบบรายงานตัวชี้วัด (Open Project - SLA)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              พัฒนาด้วย <FavoriteIcon sx={{ fontSize: 12, color: 'error.main' }} /> โดย
              <Typography component="span" variant="caption" fontWeight={600} color="primary.main">
                กลุ่มงานโครงสร้างพื้นฐานดิจิทัลทางการแพทย์
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์
            </Typography>
          </Box>

          {/* Links */}
          <Stack
            direction="row"
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
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

          {/* Version & Copyright */}
          <Box textAlign={{ xs: 'center', md: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Version 2.0.0
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              © {currentYear} Walailak University Hospital
            </Typography>
          </Box>
        </Stack>

        {/* Mobile Links */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ display: { xs: 'flex', md: 'none' }, mt: 2 }}
        >
          <Link href="#" underline="hover" color="text.secondary" variant="caption">
            คู่มือ
          </Link>
          <Link href="#" underline="hover" color="text.secondary" variant="caption">
            นโยบาย
          </Link>
          <Link href="#" underline="hover" color="text.secondary" variant="caption">
            เงื่อนไข
          </Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
