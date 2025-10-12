import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Assessment as AssessmentIcon,
  Cable as CableIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Setting {
  key: string;
  value: string;
  description?: string;
}

interface SettingsGroup {
  [key: string]: string;
}

const SettingsAdminPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const [settings, setSettings] = useState<SettingsGroup>({
    // OpenProject settings
    OPENPROJECT_BASE_URL: '',
    OPENPROJECT_API_KEY: '',
    
    // General settings
    REFRESH_INTERVAL_MINUTES: '5',
    DEFAULT_PROJECT_IDS: '',
    DEFAULT_STATUS: '',
    DEFAULT_PRIORITY: '',
    
    // SLA settings
    SLA_DUE_SOON_DAYS: '7',
    SLA_OVERDUE_CRITICAL_DAYS: '30',
    SLA_ESCALATION_HOURS: '24',
    
    // Security settings
    PASSWORD_MIN_LENGTH: '8',
    SESSION_TTL_MINUTES: '480',
    MAX_LOGIN_ATTEMPTS: '5',
    
    // UI settings
    DEFAULT_THEME: 'light',
    BRAND_COLOR: '#7C3AED'
  });

  const queryClient = useQueryClient();

  // Fetch settings for each tab
  const { data: openprojectData } = useQuery({
    queryKey: ['admin-settings-openproject'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/openproject');
      return response.data;
    }
  });

  const { data: generalData } = useQuery({
    queryKey: ['admin-settings-general'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/general');
      return response.data;
    }
  });

  const { data: slaData } = useQuery({
    queryKey: ['admin-settings-sla'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/sla');
      return response.data;
    }
  });

  const { data: securityData } = useQuery({
    queryKey: ['admin-settings-security'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/security');
      return response.data;
    }
  });

  const { data: uiData } = useQuery({
    queryKey: ['admin-settings-ui'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/ui');
      return response.data;
    }
  });

  // Update settings from API data
  useEffect(() => {
    if (openprojectData) {
      setSettings(prev => ({ ...prev, 
        OPENPROJECT_BASE_URL: openprojectData.base_url || '',
        OPENPROJECT_API_KEY: openprojectData.api_key || ''
      }));
    }
  }, [openprojectData]);

  useEffect(() => {
    if (generalData) {
      setSettings(prev => ({ ...prev,
        REFRESH_INTERVAL_MINUTES: generalData.refresh_interval?.toString() || '5',
        DEFAULT_PROJECT_IDS: generalData.default_project_ids || '',
        DEFAULT_STATUS: generalData.default_status || '',
        DEFAULT_PRIORITY: generalData.default_priority || ''
      }));
    }
  }, [generalData]);

  useEffect(() => {
    if (slaData) {
      setSettings(prev => ({ ...prev,
        SLA_DUE_SOON_DAYS: slaData.due_soon_days?.toString() || '7',
        SLA_OVERDUE_CRITICAL_DAYS: slaData.overdue_critical_days?.toString() || '30',
        SLA_ESCALATION_HOURS: slaData.escalation_hours?.toString() || '24'
      }));
    }
  }, [slaData]);

  useEffect(() => {
    if (securityData) {
      setSettings(prev => ({ ...prev,
        PASSWORD_MIN_LENGTH: securityData.password_min_length?.toString() || '8',
        SESSION_TTL_MINUTES: securityData.session_ttl_minutes?.toString() || '480',
        MAX_LOGIN_ATTEMPTS: securityData.max_login_attempts?.toString() || '5'
      }));
    }
  }, [securityData]);

  useEffect(() => {
    if (uiData) {
      setSettings(prev => ({ ...prev,
        DEFAULT_THEME: uiData.default_theme || 'light',
        BRAND_COLOR: uiData.brand_color || '#7C3AED'
      }));
    }
  }, [uiData]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ tab, data }: { tab: string; data: any }) => {
      const response = await api.put(`/admin/settings/${tab}`, data);
      return response.data;
    },
    onSuccess: (_, { tab }) => {
      queryClient.invalidateQueries({ queryKey: [`admin-settings-${tab}`] });
      showSnackbar(`อัปเดตการตั้งค่า${getTabName(tab)}สำเร็จ`, 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า', 'error');
    }
  });

  // Test OpenProject connection
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/settings/test_openproject');
      return response.data;
    },
    onSuccess: (data) => {
      setConnectionStatus(data);
      showSnackbar(data.message, data.success ? 'success' : 'error');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Connection test failed';
      setConnectionStatus({ success: false, message });
      showSnackbar(message, 'error');
    }
  });

  const getTabName = (tab: string) => {
    const names: { [key: string]: string } = {
      openproject: 'OpenProject',
      general: 'ทั่วไป',
      sla: 'SLA',
      security: 'ความปลอดภัย',
      ui: 'หน้าตา'
    };
    return names[tab] || tab;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof value === 'boolean' ? (value ? '1' : '0') : value
    }));
  };

  const handleSaveSettings = (tab?: string) => {
    if (tab) {
      // Save specific tab
      let data: any = {};
      switch (tab) {
        case 'openproject':
          data = {
            base_url: settings.OPENPROJECT_BASE_URL,
            api_key: settings.OPENPROJECT_API_KEY
          };
          break;
        case 'general':
          data = {
            refresh_interval: parseInt(settings.REFRESH_INTERVAL_MINUTES),
            default_project_ids: settings.DEFAULT_PROJECT_IDS,
            default_status: settings.DEFAULT_STATUS,
            default_priority: settings.DEFAULT_PRIORITY
          };
          break;
        case 'sla':
          data = {
            due_soon_days: parseInt(settings.SLA_DUE_SOON_DAYS),
            overdue_critical_days: parseInt(settings.SLA_OVERDUE_CRITICAL_DAYS),
            escalation_hours: parseInt(settings.SLA_ESCALATION_HOURS)
          };
          break;
        case 'security':
          data = {
            password_min_length: parseInt(settings.PASSWORD_MIN_LENGTH),
            session_ttl_minutes: parseInt(settings.SESSION_TTL_MINUTES),
            max_login_attempts: parseInt(settings.MAX_LOGIN_ATTEMPTS)
          };
          break;
        case 'ui':
          data = {
            default_theme: settings.DEFAULT_THEME,
            brand_color: settings.BRAND_COLOR
          };
          break;
      }
      updateSettingsMutation.mutate({ tab, data });
    } else {
      // Save all settings (legacy)
      const openprojectData = {
        base_url: settings.OPENPROJECT_BASE_URL,
        api_key: settings.OPENPROJECT_API_KEY
      };
      updateSettingsMutation.mutate({ tab: 'openproject', data: openprojectData });
    }
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          การตั้งค่าระบบ
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<CableIcon />} label="การเชื่อมต่อ OpenProject" />
            <Tab icon={<SettingsIcon />} label="การตั้งค่าทั่วไป" />
            <Tab icon={<AssessmentIcon />} label="การตั้งค่า SLA" />
            <Tab icon={<SecurityIcon />} label="ความปลอดภัย" />
            <Tab icon={<PaletteIcon />} label="ส่วนติดต่อผู้ใช้" />
          </Tabs>
        </Box>

        {/* OpenProject Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                การเชื่อมต่อ OpenProject
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                ตั้งค่าการเชื่อมต่อกับระบบ OpenProject เพื่อซิงค์ข้อมูล Work Package และผู้ใช้งาน
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL ฐาน OpenProject"
                value={settings.OPENPROJECT_BASE_URL}
                onChange={(e) => handleSettingChange('OPENPROJECT_BASE_URL', e.target.value)}
                placeholder="https://openproject.example.com"
                helperText="URL ฐานของระบบ OpenProject ของคุณ"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="รหัส API Key"
                type="password"
                value={settings.OPENPROJECT_API_KEY}
                onChange={(e) => handleSettingChange('OPENPROJECT_API_KEY', e.target.value)}
                placeholder="API Key ของ OpenProject"
                helperText="สร้าง API Key ในการตั้งค่าผู้ใช้ของ OpenProject"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('openproject')}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleTestConnection}
                  disabled={testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
                </Button>

                {connectionStatus && (
                  <Chip
                    label={connectionStatus.message}
                    color={connectionStatus.success ? 'success' : 'error'}
                    variant="outlined"
                  />
                )}
              </Box>

              {connectionStatus?.details && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    รายละเอียดการเชื่อมต่อ:
                  </Typography>
                  <Typography variant="body2">
                    ระบบ: {connectionStatus.details.instance_name}
                  </Typography>
                  <Typography variant="body2">
                    เวอร์ชัน: {connectionStatus.details.version}
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* General Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                การตั้งค่าทั่วไปของระบบ
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ช่วงเวลาการรีเฟรช (นาที)"
                type="number"
                value={settings.REFRESH_INTERVAL_MINUTES}
                onChange={(e) => handleSettingChange('REFRESH_INTERVAL_MINUTES', e.target.value)}
                helperText="ความถี่ในการรีเฟรชข้อมูล Work Package"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Project IDs"
                value={settings.DEFAULT_PROJECT_IDS}
                onChange={(e) => handleSettingChange('DEFAULT_PROJECT_IDS', e.target.value)}
                placeholder="1,2,3"
                helperText="Comma-separated list of default project IDs"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Status"
                value={settings.DEFAULT_STATUS}
                onChange={(e) => handleSettingChange('DEFAULT_STATUS', e.target.value)}
                placeholder="In Progress"
                helperText="Default status filter for work packages"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Priority"
                value={settings.DEFAULT_PRIORITY}
                onChange={(e) => handleSettingChange('DEFAULT_PRIORITY', e.target.value)}
                placeholder="Normal"
                helperText="Default priority filter for work packages"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('general')}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* SLA Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                SLA Configuration
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Define thresholds for SLA calculations and reporting.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Due Soon (days)"
                type="number"
                value={settings.SLA_DUE_SOON_DAYS}
                onChange={(e) => handleSettingChange('SLA_DUE_SOON_DAYS', e.target.value)}
                helperText="Days before due date to mark as 'due soon'"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Overdue Critical (days)"
                type="number"
                value={settings.SLA_OVERDUE_CRITICAL_DAYS}
                onChange={(e) => handleSettingChange('SLA_OVERDUE_CRITICAL_DAYS', e.target.value)}
                helperText="Days overdue to mark as critical"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Escalation Time (hours)"
                type="number"
                value={settings.SLA_ESCALATION_HOURS}
                onChange={(e) => handleSettingChange('SLA_ESCALATION_HOURS', e.target.value)}
                helperText="Hours before automatic escalation"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('sla')}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Password Min Length"
                type="number"
                value={settings.PASSWORD_MIN_LENGTH}
                onChange={(e) => handleSettingChange('PASSWORD_MIN_LENGTH', e.target.value)}
                helperText="Minimum password length"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Session TTL (minutes)"
                type="number"
                value={settings.SESSION_TTL_MINUTES}
                onChange={(e) => handleSettingChange('SESSION_TTL_MINUTES', e.target.value)}
                helperText="Session timeout in minutes"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                value={settings.MAX_LOGIN_ATTEMPTS}
                onChange={(e) => handleSettingChange('MAX_LOGIN_ATTEMPTS', e.target.value)}
                helperText="Maximum failed login attempts"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('security')}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* UI Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                User Interface Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Default Theme"
                value={settings.DEFAULT_THEME}
                onChange={(e) => handleSettingChange('DEFAULT_THEME', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand Color"
                value={settings.BRAND_COLOR}
                onChange={(e) => handleSettingChange('BRAND_COLOR', e.target.value)}
                placeholder="#7C3AED"
                helperText="Hex color code for branding"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('ui')}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsAdminPage;
