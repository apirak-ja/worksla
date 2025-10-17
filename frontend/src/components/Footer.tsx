import { Box, Container, Typography, Link, Divider, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Copyright, Favorite } from '@mui/icons-material'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
            : 'linear-gradient(180deg, #1a1a2e 0%, #16172a 100%)',
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Left Side - Copyright */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Copyright sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {currentYear} <strong>ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์</strong>
            </Typography>
          </Stack>

          {/* Center - Made with */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              สร้างด้วย
            </Typography>
            <Favorite sx={{ fontSize: 16, color: '#EF4444' }} />
            <Typography variant="body2" color="text.secondary">
              โดย <strong>Digital Medical Infrastructure Team</strong>
            </Typography>
          </Stack>

          {/* Right Side - Links */}
          <Stack direction="row" spacing={2}>
            <Link
              href="https://wuhhospital.wu.ac.th"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              เว็บไซต์
            </Link>
            <Divider orientation="vertical" flexItem />
            <Link
              href="https://wuhhospital.wu.ac.th/contact"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              ติดต่อเรา
            </Link>
            <Divider orientation="vertical" flexItem />
            <Link
              href="/worksla/help"
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' },
              }}
            >
              ช่วยเหลือ
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
