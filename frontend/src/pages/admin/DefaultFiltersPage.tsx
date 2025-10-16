import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Alert,
  Snackbar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import {
  Save as SaveIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import { api } from '../../api/client';

interface DefaultFilters {
  start_date: Date | null;
  end_date: Date | null;
  assignee_ids: number[];
  status: string[];
  priority: string[];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const DefaultFiltersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [filters, setFilters] = useState<DefaultFilters>({
    start_date: null,
    end_date: null,
    assignee_ids: [],
    status: [],
    priority: [],
  });

  const [availableAssignees, setAvailableAssignees] = useState<{ id: number; name: string }[]>([]);
  const [availableStatuses] = useState<string[]>([
    'New',
    'รับเรื่อง',
    'กำลังดำเนินการ',
    'ดำเนินการเสร็จ',
    'ปิดงาน',
  ]);
  const [availablePriorities] = useState<string[]>(['High', 'Normal', 'Low']);

  useEffect(() => {
    loadFilters();
    loadAssignees();
  }, []);

  const loadFilters = async () => {
    setLoading(true);
    try {
      // Load from localStorage first
      const stored = localStorage.getItem('default_filters');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFilters({
          start_date: parsed.start_date ? new Date(parsed.start_date) : null,
          end_date: parsed.end_date ? new Date(parsed.end_date) : null,
          assignee_ids: parsed.assignee_ids || [],
          status: parsed.status || [],
          priority: parsed.priority || [],
        });
      }

      // Try loading from API (if backend supports it)
      try {
        const response = await api.get('/admin/default-filters');
        if (response.data) {
          setFilters({
            start_date: response.data.start_date ? new Date(response.data.start_date) : null,
            end_date: response.data.end_date ? new Date(response.data.end_date) : null,
            assignee_ids: response.data.assignee_ids || [],
            status: response.data.status || [],
            priority: response.data.priority || [],
          });
        }
      } catch (err) {
        console.log('API not available, using localStorage');
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
      showSnackbar('เกิดข้อผิดพลาดในการโหลดฟิลเตอร์', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignees = async () => {
    try {
      const response = await api.get('/assignees');
      if (response.data) {
        setAvailableAssignees(
          response.data.map((a: any) => ({
            id: a.id,
            name: a.display_name || a.name || `User ${a.id}`,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load assignees:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('default_filters', JSON.stringify(filters));

      // Try saving to API (if backend supports it)
      try {
        await api.post('/admin/default-filters', filters);
      } catch (err) {
        console.log('API save not available, using localStorage only');
      }

      showSnackbar('บันทึกฟิลเตอร์เริ่มต้นสำเร็จ', 'success');
    } catch (error) {
      console.error('Failed to save filters:', error);
      showSnackbar('เกิดข้อผิดพลาดในการบันทึกฟิลเตอร์', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFilters({
      start_date: null,
      end_date: null,
      assignee_ids: [],
      status: [],
      priority: [],
    });
    localStorage.removeItem('default_filters');
    showSnackbar('รีเซ็ตฟิลเตอร์เริ่มต้นสำเร็จ', 'info');
  };

  const handleAssigneeChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      assignee_ids: typeof value === 'string' ? [] : value,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      status: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      priority: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
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
            <FilterListIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                ฟิลเตอร์เริ่มต้น
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                กำหนดฟิลเตอร์เริ่มต้นสำหรับการแสดงผลข้อมูลในระบบ
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Date Range Section */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <DateRangeIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700}>
                    ช่วงวันที่
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="วันที่เริ่มต้น"
                      value={filters.start_date}
                      onChange={(newValue) => setFilters({ ...filters, start_date: newValue })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="วันที่สิ้นสุด"
                      value={filters.end_date}
                      onChange={(newValue) => setFilters({ ...filters, end_date: newValue })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Assignee Section */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <PersonIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700}>
                    ผู้รับผิดชอบ
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <InputLabel id="assignee-label">เลือกผู้รับผิดชอบ</InputLabel>
                  <Select
                    labelId="assignee-label"
                    multiple
                    value={filters.assignee_ids}
                    onChange={handleAssigneeChange}
                    input={<OutlinedInput label="เลือกผู้รับผิดชอบ" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const assignee = availableAssignees.find((a) => a.id === id);
                          return <Chip key={id} label={assignee?.name || `ID: ${id}`} size="small" />;
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {availableAssignees.map((assignee) => (
                      <MenuItem key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Status Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  สถานะ
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="status-label">เลือกสถานะ</InputLabel>
                  <Select
                    labelId="status-label"
                    multiple
                    value={filters.status}
                    onChange={handleStatusChange}
                    input={<OutlinedInput label="เลือกสถานะ" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" color="primary" />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {availableStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Priority Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  ลำดับความสำคัญ
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">เลือกลำดับความสำคัญ</InputLabel>
                  <Select
                    labelId="priority-label"
                    multiple
                    value={filters.priority}
                    onChange={handlePriorityChange}
                    input={<OutlinedInput label="เลือกลำดับความสำคัญ" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" color="secondary" />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {availablePriorities.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box display="flex" gap={2} mt={4} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleReset}
                size="large"
              >
                รีเซ็ต
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                size="large"
                sx={{ minWidth: 150 }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'บันทึก'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Current Filter Summary */}
        {(filters.assignee_ids.length > 0 || filters.status.length > 0 || filters.priority.length > 0) && (
          <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: 'success.lighter' }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2} color="success.dark">
              📋 สรุปฟิลเตอร์ที่เลือก
            </Typography>
            <Stack spacing={1}>
              {filters.start_date && (
                <Typography variant="body2">
                  <strong>วันที่เริ่มต้น:</strong> {filters.start_date.toLocaleDateString('th-TH')}
                </Typography>
              )}
              {filters.end_date && (
                <Typography variant="body2">
                  <strong>วันที่สิ้นสุด:</strong> {filters.end_date.toLocaleDateString('th-TH')}
                </Typography>
              )}
              {filters.assignee_ids.length > 0 && (
                <Typography variant="body2">
                  <strong>ผู้รับผิดชอบ:</strong> {filters.assignee_ids.length} คน
                </Typography>
              )}
              {filters.status.length > 0 && (
                <Typography variant="body2">
                  <strong>สถานะ:</strong> {filters.status.join(', ')}
                </Typography>
              )}
              {filters.priority.length > 0 && (
                <Typography variant="body2">
                  <strong>ลำดับความสำคัญ:</strong> {filters.priority.join(', ')}
                </Typography>
              )}
            </Stack>
          </Paper>
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
    </LocalizationProvider>
  );
};

export default DefaultFiltersPage;
