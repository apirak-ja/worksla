import { Box, Container, Typography, Link, Divider, Grid, Stack, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Copyright,
  LocalHospital,
  Computer,
  LocationOn,
  Phone,
  Email,
  Public,
  Facebook,
  YouTube,
} from '@mui/icons-material'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 6,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, #ffffff 0%, #eef2ff 100%)'
            : 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        color: (theme) => (theme.palette.mode === 'light' ? theme.palette.text.primary : theme.palette.grey[100]),
        borderTop: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                <LocalHospital color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    กลุ่มงานโครงสร้างพื้นฐานดิจิทัลทางการแพทย์
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                ระบบถูกออกแบบเพื่อยกระดับการติดตาม SLA ให้มีความรวดเร็ว โปร่งใส และสามารถเข้าถึงข้อมูลสำคัญได้ตลอดเวลา ทั้งสำหรับเจ้าหน้าที่และผู้บริหาร
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <IconButton
                  size="small"
                  color="primary"
                  aria-label="Facebook"
                  href="https://www.facebook.com/WalailakHospital"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  aria-label="YouTube"
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YouTube fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  aria-label="Website"
                  href="https://wuhhospital.wu.ac.th"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Public fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="subtitle1" fontWeight={700}>
                ช่องทางการติดต่อ
              </Typography>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                <LocationOn color="primary" />
                <Typography variant="body2" color="text.secondary">
                  222 หมู่ 5 ต.ไทยบุรี อ.ท่าศาลา จ.นครศรีธรรมราช 80160
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                <Phone color="primary" />
                <Typography variant="body2" color="text.secondary">
                  โทรศัพท์: 0-7567-3000 ต่อ 3210
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
                <Email color="primary" />
                <Link
                  href="mailto:support@wuhhospital.wu.ac.th"
                  color="inherit"
                  underline="hover"
                >
                  support@wuhhospital.wu.ac.th
                </Link>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="subtitle1" fontWeight={700}>
                ลิงก์ที่สำคัญ
              </Typography>
              <Stack spacing={1}>
                <Link
                  href="https://wuhhospital.wu.ac.th"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  underline="hover"
                >
                  เกี่ยวกับศูนย์การแพทย์
                </Link>
                <Link
                  href="https://opencms.wu.ac.th"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  underline="hover"
                >
                  ระบบสารสนเทศอื่น ๆ
                </Link>
                <Link
                  href="https://github.com/apirak-ja/worksla"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  underline="hover"
                >
                  เอกสารการพัฒนา
                </Link>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                เวอร์ชันระบบ 1.0.0 · ปรับปรุง {currentYear}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: (theme) => alpha(theme.palette.text.primary, 0.08) }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Copyright fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {currentYear} Walailak University Hospital. All rights reserved.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" color="text.secondary">
              ข้อมูลได้รับการปกป้องตามมาตรฐาน ISO/IEC 27001
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ปฏิบัติตามนโยบาย PDPA
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default Footer
