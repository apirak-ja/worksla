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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { api } from '../../api/client';

interface EndpointTest {
  name: string;
  path: string;
  method: 'GET' | 'POST';
  status: 'pending' | 'success' | 'warning' | 'error';
  statusCode?: number;
  responseTime?: number;
  payloadSize?: number;
  error?: string;
}

const defaultEndpoints: Omit<EndpointTest, 'status'>[] = [
  { name: 'Health Check', path: '/api/health', method: 'GET' },
  { name: 'Auth - Login', path: '/api/auth/login', method: 'POST' },
  { name: 'Work Packages List', path: '/api/workpackages', method: 'GET' },
  { name: 'Work Package Detail', path: '/api/workpackages/1', method: 'GET' },
  { name: 'Assignees List', path: '/api/assignees', method: 'GET' },
  { name: 'Users List', path: '/api/users', method: 'GET' },
  { name: 'Admin - Settings', path: '/api/admin/settings', method: 'GET' },
  { name: 'Admin - Sync', path: '/api/admin/workpackages-sync', method: 'POST' },
];

const AdminRouteCheckerPage: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [editingBaseUrl, setEditingBaseUrl] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://10.251.150.222:3346');
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);
  const [endpoints, setEndpoints] = useState<EndpointTest[]>(
    defaultEndpoints.map(e => ({ ...e, status: 'pending' as const }))
  );
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  React.useEffect(() => {
    const stored = localStorage.getItem('api_base_url');
    if (stored) {
      setBaseUrl(stored);
      setTempBaseUrl(stored);
    }
  }, []);

  const testEndpoint = async (endpoint: Omit<EndpointTest, 'status'>): Promise<EndpointTest> => {
    const startTime = Date.now();
    
    try {
      const url = `${baseUrl}${endpoint.path}`;
      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      };

      // For POST requests that require body (like login)
      if (endpoint.method === 'POST' && endpoint.path.includes('login')) {
        fetchOptions.body = JSON.stringify({ username: 'test', password: 'test' });
      }

      const response = await fetch(url, fetchOptions);
      const responseTime = Date.now() - startTime;
      
      let payloadSize = 0;
      try {
        const data = await response.text();
        payloadSize = new Blob([data]).size;
      } catch (e) {
        // Ignore payload size errors
      }

      let status: EndpointTest['status'] = 'success';
      if (response.status >= 500) {
        status = 'error';
      } else if (response.status >= 400) {
        status = 'warning';
      }

      return {
        ...endpoint,
        status,
        statusCode: response.status,
        responseTime,
        payloadSize,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        ...endpoint,
        status: 'error',
        responseTime,
        error: error.message || 'Network error',
      };
    }
  };

  const testAllEndpoints = async () => {
    setTesting(true);
    const results: EndpointTest[] = [];

    for (const endpoint of defaultEndpoints) {
      const result = await testEndpoint(endpoint);
      results.push(result);
      setEndpoints([...results, ...defaultEndpoints.slice(results.length).map(e => ({ ...e, status: 'pending' as const }))]);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    }

    setTesting(false);
    
    const failedCount = results.filter(r => r.status === 'error').length;
    if (failedCount === 0) {
      showSnackbar('✅ ทุก Endpoint ทำงานปกติ', 'success');
    } else {
      showSnackbar(`⚠️ พบปัญหา ${failedCount} endpoints`, 'warning');
    }
  };

  const handleSaveBaseUrl = () => {
    setBaseUrl(tempBaseUrl);
    localStorage.setItem('api_base_url', tempBaseUrl);
    setEditingBaseUrl(false);
    showSnackbar('บันทึก Base URL สำเร็จ', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity: severity === 'warning' ? 'error' : severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusIcon = (status: EndpointTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'default';
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'default';
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
          <NetworkCheckIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              ตรวจสอบ API Routes
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              ทดสอบการเชื่อมต่อกับ API Endpoints ทั้งหมด
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Base URL Configuration */}
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <SettingsIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Base URL Configuration
            </Typography>
          </Box>
          
          {editingBaseUrl ? (
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                fullWidth
                value={tempBaseUrl}
                onChange={(e) => setTempBaseUrl(e.target.value)}
                placeholder="https://10.251.150.222:3346"
                variant="outlined"
                size="small"
              />
              <IconButton color="primary" onClick={handleSaveBaseUrl}>
                <SaveIcon />
              </IconButton>
              <IconButton color="error" onClick={() => setEditingBaseUrl(false)}>
                <ErrorIcon />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" gap={2} alignItems="center">
              <Chip label={baseUrl} color="primary" variant="outlined" sx={{ fontSize: '0.95rem', fontWeight: 600 }} />
              <IconButton size="small" onClick={() => setEditingBaseUrl(true)}>
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Test Button */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={testing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={testAllEndpoints}
          disabled={testing}
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
          {testing ? 'กำลังทดสอบ...' : 'ทดสอบทั้งหมด'}
        </Button>
      </Box>

      {/* Results Table */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell width={50}>Status</TableCell>
                  <TableCell><strong>Endpoint</strong></TableCell>
                  <TableCell><strong>Method</strong></TableCell>
                  <TableCell><strong>Path</strong></TableCell>
                  <TableCell align="center"><strong>Status Code</strong></TableCell>
                  <TableCell align="right"><strong>Response Time</strong></TableCell>
                  <TableCell align="right"><strong>Payload Size</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {endpoints.map((endpoint, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { bgcolor: 'grey.50' },
                      bgcolor: endpoint.status === 'error' ? 'error.lighter' : endpoint.status === 'warning' ? 'warning.lighter' : 'transparent',
                    }}
                  >
                    <TableCell>{getStatusIcon(endpoint.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {endpoint.name}
                      </Typography>
                      {endpoint.error && (
                        <Typography variant="caption" color="error">
                          {endpoint.error}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={endpoint.method}
                        size="small"
                        color={endpoint.method === 'GET' ? 'primary' : 'secondary'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace">
                        {endpoint.path}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {endpoint.statusCode && (
                        <Chip
                          label={endpoint.statusCode}
                          size="small"
                          color={getStatusColor(endpoint.statusCode)}
                          sx={{ fontWeight: 700, minWidth: 60 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {endpoint.responseTime !== undefined && (
                        <Typography variant="body2" fontWeight={600}>
                          {endpoint.responseTime} ms
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {endpoint.payloadSize !== undefined && (
                        <Typography variant="body2">
                          {(endpoint.payloadSize / 1024).toFixed(2)} KB
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      {!testing && endpoints.some(e => e.status !== 'pending') && (
        <Card elevation={2} sx={{ borderRadius: 3, mt: 3, bgcolor: 'grey.50' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              📊 สรุปผลการทดสอบ
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                icon={<CheckCircleIcon />}
                label={`Success: ${endpoints.filter(e => e.status === 'success').length}`}
                color="success"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                icon={<WarningIcon />}
                label={`Warning: ${endpoints.filter(e => e.status === 'warning').length}`}
                color="warning"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                icon={<ErrorIcon />}
                label={`Error: ${endpoints.filter(e => e.status === 'error').length}`}
                color="error"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

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

export default AdminRouteCheckerPage;
