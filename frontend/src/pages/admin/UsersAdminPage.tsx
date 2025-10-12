import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment
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
  Edit as EditIcon,
  VpnKey as ResetPasswordIcon,
  Person as PersonIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

interface User {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface UserFormData {
  username: string;
  password?: string;
  role: string;
  is_active: boolean;
}

const UsersAdminPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'viewer',
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch users with pagination
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin-users', paginationModel.page + 1, paginationModel.pageSize, searchTerm],
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams({
        page: (paginationModel.page + 1).toString(),
        page_size: paginationModel.pageSize.toString(),
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/admin/users`, { params: Object.fromEntries(params) });
      return response.data;
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await api.post('/admin/users', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOpen(false);
      resetForm();
      showSnackbar('สร้างผู้ใช้งานสำเร็จ', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน', 'error');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormData> }) => {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOpen(false);
      setEditUser(null);
      resetForm();
      showSnackbar('อัปเดตผู้ใช้งานสำเร็จ', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน', 'error');
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.post(`/admin/users/${userId}/reset_password`);
      return response.data;
    },
    onSuccess: (data) => {
      setResetPasswordUser(null);
      showSnackbar(
        `รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่: ${data.new_password}`,
        'success'
      );
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน', 'error');
    }
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'viewer',
      is_active: true
    });
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setFormData({
      username: user.username,
      role: user.role,
      is_active: user.is_active
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (editUser) {
      // Update existing user
      const updateData: Partial<UserFormData> = {
        role: formData.role,
        is_active: formData.is_active
      };
      updateUserMutation.mutate({ id: editUser.id, userData: updateData });
    } else {
      // Create new user
      createUserMutation.mutate(formData);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'analyst': return 'warning';
      case 'viewer': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'analyst': return 'นักวิเคราะห์';
      case 'viewer': return 'ผู้ดู';
      default: return role;
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'username', 
      headerName: 'ชื่อผู้ใช้', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" />
          {params.value}
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'บทบาท',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getRoleLabel(params.value)}
          color={getRoleColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'is_active',
      headerName: 'สถานะ',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'ใช้งาน' : 'ปิดการใช้งาน'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'วันที่สร้าง',
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
          icon={<EditIcon />}
          label="แก้ไข"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<ResetPasswordIcon />}
          label="รีเซ็ตรหัสผ่าน"
          onClick={() => setResetPasswordUser(params.row)}
        />
      ]
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          จัดการผู้ใช้งาน
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setEditUser(null);
            setOpen(true);
          }}
        >
          เพิ่มผู้ใช้งาน
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="ค้นหาชื่อผู้ใช้..."
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
          </Box>
          
          <DataGrid
            rows={usersResponse?.items || []}
            columns={columns}
            loading={isLoading}
            autoHeight
            disableRowSelectionOnClick
            pagination
            paginationMode="server"
            rowCount={usersResponse?.total || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            localeText={{
              noRowsLabel: 'ไม่พบข้อมูลผู้ใช้งาน',
              MuiTablePagination: {
                labelRowsPerPage: 'แถวต่อหน้า:',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editUser ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้งานใหม่'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="ชื่อผู้ใช้"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!!editUser} // Disable username edit for existing users
              sx={{ mb: 2 }}
            />
            
            {!editUser && (
              <TextField
                margin="dense"
                label="รหัสผ่าน"
                type="password"
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>บทบาท</InputLabel>
              <Select
                value={formData.role}
                label="บทบาท"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="viewer">ผู้ดู</MenuItem>
                <MenuItem value="analyst">นักวิเคราะห์</MenuItem>
                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
              </Select>
            </FormControl>

            {editUser && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="เปิดใช้งาน"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ยกเลิก</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createUserMutation.isPending || updateUserMutation.isPending}
          >
            {editUser ? 'อัปเดต' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Confirmation Dialog */}
      <Dialog
        open={!!resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่ต้องการรีเซ็ตรหัสผ่านสำหรับผู้ใช้ "{resetPasswordUser?.username}"?
            ระบบจะสร้างรหัสผ่านใหม่แบบสุ่ม
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordUser(null)}>ยกเลิก</Button>
          <Button
            onClick={() => resetPasswordUser && resetPasswordMutation.mutate(resetPasswordUser.id)}
            variant="contained"
            color="warning"
            disabled={resetPasswordMutation.isPending}
          >
            รีเซ็ตรหัสผ่าน
          </Button>
        </DialogActions>
      </Dialog>

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

export default UsersAdminPage;
