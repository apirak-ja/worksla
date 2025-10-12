import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add, Refresh } from '@mui/icons-material'
import { wpApi } from '../../api/client'
import { format } from 'date-fns'

const WorkPackagesPage: React.FC = () => {
  const navigate = useNavigate()
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
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
