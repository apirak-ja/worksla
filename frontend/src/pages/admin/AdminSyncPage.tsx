import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { api } from '../../api/client';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface SyncResult {
  success: boolean;
  message: string;
  workpackages_synced?: number;
  duration?: number;
  timestamp?: string;
}

const AdminSyncPage: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    loadLastSyncTime();
  }, []);

  const loadLastSyncTime = async () => {
    try {
      const stored = localStorage.getItem('last_sync_time');
      if (stored) {
        setLastSyncTime(new Date(stored));
      }

      // Try loading from API
      try {
        const response = await api.get('/admin/sync-status');
        if (response.data?.last_sync) {
          const syncTime = new Date(response.data.last_sync);
          setLastSyncTime(syncTime);
          localStorage.setItem('last_sync_time', syncTime.toISOString());
        }
      } catch (err) {
        console.log('API not available, using localStorage');
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const startTime = Date.now();

    try {
      const response = await api.post('/admin/workpackages-sync');
      const duration = (Date.now() - startTime) / 1000;

      const result: SyncResult = {
        success: true,
        message: response.data?.message || 'Sync completed successfully',
        workpackages_synced: response.data?.workpackages_synced || 0,
        duration,
        timestamp: new Date().toISOString(),
      };

      setSyncResult(result);
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now.toISOString());
      showSnackbar('ซิงค์ข้อมูลสำเร็จ! 🎉', 'success');
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      const result: SyncResult = {
        success: false,
        message: error.response?.data?.detail || error.message || 'Sync failed',
        duration,
        timestamp: new Date().toISOString(),
      };
      setSyncResult(result);
      showSnackbar('เกิดข้อผิดพลาดในการซิงค์ข้อมูล', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatLastSync = (date: Date) => {
    return format(date, 'dd MMMM yyyy, HH:mm:ss น.', { locale: th });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <CloudSyncIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              ซิงค์ข้อมูล Work Packages
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              ดึงข้อมูลล่าสุดจาก OpenProject API
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Last Sync Info */}
          {lastSyncTime && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <ScheduleIcon color="info" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2" color="info.dark" fontWeight={600}>
                    ซิงค์ล่าสุดเมื่อ:
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {formatLastSync(lastSyncTime)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Sync Button */}
          <Box display="flex" justifyContent="center" mb={4}>
            <Button
              variant="contained"
              size="large"
              startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={handleSync}
              disabled={syncing}
              sx={{
                minWidth: 250,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a4293 100%)',
                },
              }}
            >
              {syncing ? 'กำลังซิงค์...' : 'ซิงค์ทันที'}
            </Button>
          </Box>

          {/* Progress Bar */}
          {syncing && (
            <Box mb={4}>
              <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
              <Typography variant="caption" color="text.secondary" align="center" display="block" mt={1}>
                กำลังดึงข้อมูลจาก OpenProject...
              </Typography>
            </Box>
          )}

          {/* Sync Result */}
          {syncResult && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: syncResult.success ? 'success.lighter' : 'error.lighter',
                borderRadius: 2,
                border: '2px solid',
                borderColor: syncResult.success ? 'success.main' : 'error.main',
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                {syncResult.success ? (
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                ) : (
                  <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                )}
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color={syncResult.success ? 'success.dark' : 'error.dark'}>
                    {syncResult.success ? '✅ ซิงค์สำเร็จ!' : '❌ ซิงค์ล้มเหลว'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {syncResult.message}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1}>
                    {syncResult.workpackages_synced !== undefined && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${syncResult.workpackages_synced} Work Packages`}
                          size="small"
                          color={syncResult.success ? 'success' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    )}
                    {syncResult.duration !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        ⏱️ ระยะเวลา: {syncResult.duration.toFixed(2)} วินาที
                      </Typography>
                    )}
                    {syncResult.timestamp && (
                      <Typography variant="caption" color="text.secondary">
                        🕒 เวลา: {formatLastSync(new Date(syncResult.timestamp))}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card elevation={2} sx={{ borderRadius: 3, bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <InfoIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              ℹ️ ข้อมูลการซิงค์
            </Typography>
          </Box>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              • การซิงค์จะดึงข้อมูล Work Packages ทั้งหมดจาก OpenProject
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • ข้อมูลที่ดึงมาจะถูกอัปเดตในฐานข้อมูลท้องถิ่น
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • ระบบจะซิงค์อัตโนมัติทุกชั่วโมง (หรือตามที่ตั้งค่าไว้)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • หากพบปัญหา กรุณาตรวจสอบการเชื่อมต่อ API ใน Settings
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSyncPage;
