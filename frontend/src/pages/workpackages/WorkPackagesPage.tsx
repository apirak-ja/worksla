import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material'
import { Chip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add, Refresh } from '@mui/icons-material'
import { wpApi, WorkPackage } from '../../api/client'
import { format } from 'date-fns'

const WorkPackagesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wpIdParam = searchParams.get('wp_id')
  const wpId = useMemo(() => {
    const n = parseInt(wpIdParam || '')
    return Number.isFinite(n) && n > 0 ? n : undefined
  }, [wpIdParam])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [filters, setFilters] = useState<any>({})
  const [applyAssigneeFilter, setApplyAssigneeFilter] = useState(true)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workpackages', page, pageSize, filters, applyAssigneeFilter],
    queryFn: () => wpApi.list({ 
      page, 
      page_size: pageSize, 
      apply_assignee_filter: applyAssigneeFilter,
      ...filters 
    }).then((res) => res.data),
  })

  // Fetch a single Work Package when wp_id query exists
  const { data: wpDetail, isLoading: isDetailLoading, error: detailError } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId as number).then((res) => res.data),
    enabled: !!wpId,
  })

  const columns: GridColDef[] = [
    { field: 'wp_id', headerName: 'ID', width: 80 },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 200 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'priority', headerName: 'Priority', width: 100 },
    { field: 'assignee_name', headerName: 'Assignee', width: 150 },
    {
      field: 'due_date',
      headerName: 'Due Date',
      width: 120,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'PP') : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => navigate(`/workpackages/${params.row.wp_id}`)}
        >
          View
        </Button>
      ),
    },
  ]

  if (isLoading && !wpId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error && !wpId) {
    return <Alert severity="error">Failed to load work packages.</Alert>
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Work Packages
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* If wp_id query is present, show the details panel */}
      {wpId && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            รายละเอียด Work Package #{wpId}
          </Typography>
          {isDetailLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={18} />
              <Typography variant="body2">กำลังโหลดข้อมูล...</Typography>
            </Box>
          ) : detailError ? (
            <Alert severity="error">ไม่สามารถโหลดข้อมูล Work Package นี้ได้</Alert>
          ) : wpDetail ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" fontWeight={600}>{wpDetail.subject || '-'}</Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={`Status: ${wpDetail.status || '-'}`} size="small" />
                    <Chip label={`Priority: ${wpDetail.priority || '-'}`} size="small" />
                    <Chip label={`Type: ${wpDetail.type || '-'}`} size="small" />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} gap={1}>
                    <Button size="small" component={Link} to={`/workpackages/${wpId}`}>เปิดหน้าเต็ม</Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">Assignee: {wpDetail.assignee_name || '-'}</Typography>
                  <Typography variant="body2">Project: {wpDetail.project_name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">Start: {wpDetail.start_date ? format(new Date(wpDetail.start_date), 'PP p') : '-'}</Typography>
                  <Typography variant="body2">Due: {wpDetail.due_date ? format(new Date(wpDetail.due_date), 'PP p') : '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>รายละเอียด</Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 240, overflow: 'auto' }}>
                    {/* wpDetail.description เป็น HTML */}
                    <div dangerouslySetInnerHTML={{ __html: wpDetail.description || '<i>ไม่มีรายละเอียด</i>' }} />
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">ไม่พบข้อมูลสำหรับ ID นี้</Alert>
          )}
        </Paper>
      )}

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Status"
              select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Priority"
              select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by subject..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={applyAssigneeFilter}
                  onChange={(e) => setApplyAssigneeFilter(e.target.checked)}
                  size="small"
                />
              }
              label="กรองตาม Assignee Allowlist"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <DataGrid
          rows={data?.items || []}
          columns={columns}
          getRowId={(row) => row.wp_id}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          rowCount={data?.total || 0}
          pageSizeOptions={[25, 50, 100]}
          paginationMode="server"
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  )
}

export default WorkPackagesPage
