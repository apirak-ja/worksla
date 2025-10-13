import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Autocomplete,
  Checkbox,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridPaginationModel
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

interface Assignee {
  id: number;
  op_user_id: number;
  display_name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface AssigneeListResponse {
  items: Assignee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface OpenProjectAssignee {
  op_user_id: number;
  display_name: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

const AssigneesAdminPage: React.FC = () => {
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedOPAssignees, setSelectedOPAssignees] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const queryClient = useQueryClient();

  // Fetch assignees with pagination
  const { data: assigneesResponse, isLoading } = useQuery({
    queryKey: ['admin-assignees', paginationModel.page + 1, paginationModel.pageSize, searchTerm, showActiveOnly],
    queryFn: async (): Promise<AssigneeListResponse> => {
      const params = new URLSearchParams({
        page: (paginationModel.page + 1).toString(),
        page_size: paginationModel.pageSize.toString(),
        active_only: showActiveOnly.toString(),
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/admin/assignees`, { params: Object.fromEntries(params) });
      return response.data;
    }
  });

  // Fetch OpenProject assignees for adding
  const { data: opAssignees = [], isLoading: isLoadingOP } = useQuery({
    queryKey: ['admin-assignees-openproject'],
    queryFn: async (): Promise<OpenProjectAssignee[]> => {
      const response = await api.get('/admin/assignees/openproject');
      return response.data;
    },
    enabled: openAddDialog
  });

  // Add assignees mutation
  const addAssigneeMutation = useMutation({
    mutationFn: async (assigneeData: { op_user_id: number; display_name: string; email?: string }) => {
      const response = await api.post('/admin/assignees', assigneeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignees'] });
      showSnackbar('เพิ่มผู้รับผิดชอบสำเร็จ', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการเพิ่มผู้รับผิดชอบ', 'error');
    }
  });

  // Update assignee mutation
  const updateAssigneeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { active: boolean } }) => {
      const response = await api.put(`/admin/assignees/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignees'] });
      showSnackbar('อัปเดตผู้รับผิดชอบสำเร็จ', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปเดตผู้รับผิดชอบ', 'error');
    }
  });

  // Delete assignee mutation
  const deleteAssigneeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/assignees/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignees'] });
      showSnackbar('ลบผู้รับผิดชอบสำเร็จ', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบผู้รับผิดชอบ', 'error');
    }
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; assignee?: Assignee }>({ open: false });

  const handleRequestDelete = (assignee: Assignee) => {
    setDeleteDialog({ open: true, assignee });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.assignee) return;
    deleteAssigneeMutation.mutate(deleteDialog.assignee.id);
    setDeleteDialog({ open: false });
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false });
  };

  const handleAddAssignees = () => {
    const selectedAssignees = opAssignees.filter(a => selectedOPAssignees.includes(a.op_user_id));
    
    // Add each selected assignee
    selectedAssignees.forEach(assignee => {
      addAssigneeMutation.mutate({
        op_user_id: assignee.op_user_id,
        display_name: assignee.display_name,
        email: assignee.email
      });
    });
    
    setOpenAddDialog(false);
    setSelectedOPAssignees([]);
  };

  const handleToggleActive = (assignee: Assignee) => {
    updateAssigneeMutation.mutate({
      id: assignee.id,
      data: { active: !assignee.active }
    });
  };

  const handleDelete = (assignee: Assignee) => handleRequestDelete(assignee);

  const columns: GridColDef[] = [
    { 
      field: 'op_user_id', 
      headerName: 'ID', 
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" color="textSecondary">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'display_name', 
      headerName: 'ชื่อผู้รับผิดชอบ', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'active',
      headerName: 'สถานะ',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'ใช้งาน' : 'ปิดการใช้งาน'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'วันที่เพิ่ม',
      width: 180,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'การดำเนินการ',
      width: 150,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={
            <Tooltip title={params.row.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}>
              <IconButton size="small" color="primary">
                {params.row.active ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />}
              </IconButton>
            </Tooltip>
          }
          label={params.row.active ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
          onClick={() => handleToggleActive(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="ลบผู้รับผิดชอบ">
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          }
          label="ลบ"
          onClick={() => handleDelete(params.row)}
        />
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
              จัดการผู้รับผิดชอบ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              จัดการรายชื่อผู้รับผิดชอบที่สามารถเข้าถึงระบบ
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            size="large"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1.5
            }}
          >
            เพิ่มผู้รับผิดชอบ
          </Button>
        </Box>
      </Paper>

      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="ค้นหาชื่อผู้รับผิดชอบ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                />
              }
              label="แสดงเฉพาะที่ใช้งาน"
            />
          </Box>
          
          <DataGrid
            rows={assigneesResponse?.items || []}
            columns={columns}
            loading={isLoading}
            autoHeight
            disableRowSelectionOnClick
            pagination
            paginationMode="server"
            rowCount={assigneesResponse?.total || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            localeText={{
              noRowsLabel: 'ไม่พบข้อมูลผู้รับผิดชอบ',
              MuiTablePagination: {
                labelRowsPerPage: 'แถวต่อหน้า:',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Add Assignees Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>เพิ่มผู้รับผิดชอบจาก OpenProject</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            เลือกผู้รับผิดชอบที่ต้องการเพิ่มจากรายชื่อทั้งหมดใน OpenProject:
          </Typography>
          
          <Autocomplete
            multiple
            options={opAssignees}
            value={opAssignees.filter(a => selectedOPAssignees.includes(a.op_user_id))}
            onChange={(event, newValue) => {
              setSelectedOPAssignees(newValue.map(a => a.op_user_id));
            }}
            getOptionLabel={(option) => `${option.display_name} (${option.op_user_id})`}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<RadioButtonUncheckedIcon />}
                  checkedIcon={<CheckCircleIcon />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                <Box>
                  <Typography variant="body1">{option.display_name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {option.op_user_id} {option.email && `• ${option.email}`}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="ค้นหาและเลือกผู้รับผิดชอบ"
                placeholder="พิมพ์ชื่อหรือเลือกจากรายการ..."
                helperText={`แสดง ${opAssignees.length} ผู้รับผิดชอบจาก OpenProject`}
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.op_user_id}
                  label={`${option.display_name} (${option.op_user_id})`}
                  size="small"
                />
              ))
            }
            loading={isLoadingOP}
            loadingText="กำลังโหลดรายชื่อผู้รับผิดชอบ..."
            noOptionsText="ไม่พบผู้รับผิดชอบ"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleAddAssignees}
            variant="contained"
            disabled={selectedOPAssignees.length === 0 || addAssigneeMutation.isPending}
          >
            เพิ่มผู้รับผิดชอบ ({selectedOPAssignees.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCancelDelete}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ว่าต้องการลบ "{deleteDialog.assignee?.display_name}" ออกจากรายการ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>ยกเลิก</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">ลบ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssigneesAdminPage;
