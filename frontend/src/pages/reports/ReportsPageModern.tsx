import React, { useState, useMemo } from 'react';import React, { useState, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';import { useQuery } from '@tantml:invoke>

import { useNavigate } from 'react-router-dom';<parameter name="useNavigate } from 'react-router-dom';

import {import {

  Box,  Box,

  Container,  Container,

  Grid,  Grid,

  Paper,  Paper,

  Typography,  Typography,

  Button,  Button,

  TextField,  TextField,

  MenuItem,  MenuItem,

  Card,  Card,

  CardContent,  CardContent,

  CircularProgress,  CircularProgress,

  Alert,  Alert,

  Stack,  Stack,

  Chip,  Chip,

  IconButton,  IconButton,

  Tooltip,  Tooltip,

  alpha,  alpha,

  useTheme,  useTheme,

  Table,  Divider,

  TableBody,  Table,

  TableCell,  TableBody,

  TableContainer,  TableCell,

  TableHead,  TableContainer,

  TableRow,  TableHead,

  TablePagination,  TableRow,

} from '@mui/material';  TablePagination,

import {} from '@mui/material';

  Download,import {

  Refresh,  Download,

  PictureAsPdf,  FilterList,

  TableChart,  Refresh,

  Assignment,  Assessment,

  CheckCircle,  PictureAsPdf,

  Warning,  TableChart,

  Speed,  DateRange,

  CalendarToday,  Search,

  TrendingUp,  TrendingUp,

} from '@mui/icons-material';  Person,

import {  Assignment,

  BarChart,  Speed,

  Bar,  CheckCircle,

  LineChart,  Schedule,

  Line,  Warning,

  XAxis,  CalendarToday,

  YAxis,} from '@mui/icons-material';

  CartesianGrid,import {

  Tooltip as RechartsTooltip,  BarChart,

  Legend,  Bar,

  ResponsiveContainer,  LineChart,

  PieChart,  Line,

  Pie,  XAxis,

  Cell,  YAxis,

} from 'recharts';  CartesianGrid,

import { wpApi } from '../../api/client';  Tooltip as RechartsTooltip,

import { format, parseISO } from 'date-fns';  Legend,

import { th } from 'date-fns/locale';  ResponsiveContainer,

  PieChart,

// Helper function  Pie,

const extractString = (value: any): string => {  Cell,

  if (!value) return '';} from 'recharts';

  if (typeof value === 'string') return value;import { wpApi } from '../../api/client';

  if (typeof value === 'object' && value !== null) {import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';

    if ('title' in value) return value.title || '';import { th } from 'date-fns/locale';

    if ('name' in value) return value.name || '';

  }// Helper Functions

  return '';const extractString = (value: any): string => {

};  if (!value) return '';

  if (typeof value === 'string') return value;

// Colors  if (typeof value === 'object' && value !== null) {

const STATUS_COLORS = ['#2e7d32', '#0288d1', '#ed6c02', '#d32f2f', '#757575'];    if ('title' in value) return value.title || '';

    if ('name' in value) return value.name || '';

// Report Card Component  }

interface ReportCardProps {  return '';

  title: string;};

  value: string | number;

  subtitle?: string;// Color Palette

  icon: React.ReactNode;const COLORS = {

  color: string;  primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],

}  status: ['#2e7d32', '#0288d1', '#ed6c02', '#d32f2f', '#757575'],

  gradient: {

const ReportCard: React.FC<ReportCardProps> = ({ title, value, subtitle, icon, color }) => {    blue: ['#667eea', '#764ba2'],

  const theme = useTheme();    pink: ['#f093fb', '#f5576c'],

    cyan: ['#4facfe', '#00f2fe'],

  return (    green: ['#43e97b', '#38f9d7'],

    <Card  },

      elevation={0}};

      sx={{

        borderRadius: 3,// Report Card Component

        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,interface ReportCardProps {

        height: '100%',  title: string;

        transition: 'all 0.3s ease',  value: string | number;

        '&:hover': {  subtitle?: string;

          boxShadow: `0 8px 16px ${alpha(color, 0.15)}`,  icon: React.ReactNode;

          transform: 'translateY(-2px)',  color: string;

        },  trend?: number;

      }}}

    >

      <CardContent>const ReportCard: React.FC<ReportCardProps> = ({ title, value, subtitle, icon, color, trend }) => {

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>  const theme = useTheme();

          <Box sx={{ flex: 1 }}>

            <Typography variant="body2" color="text.secondary" gutterBottom>  return (

              {title}    <Card

            </Typography>      elevation={0}

            <Typography variant="h4" sx={{ fontWeight: 700, color, mb: 0.5 }}>      sx={{

              {value}        borderRadius: 3,

            </Typography>        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,

            {subtitle && (        height: '100%',

              <Typography variant="caption" color="text.secondary">        transition: 'all 0.3s ease',

                {subtitle}        '&:hover': {

              </Typography>          boxShadow: `0 8px 16px ${alpha(color, 0.15)}`,

            )}          transform: 'translateY(-2px)',

          </Box>        },

          <Box      }}

            sx={{    >

              width: 56,      <CardContent>

              height: 56,        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

              borderRadius: 2,          <Box sx={{ flex: 1 }}>

              bgcolor: alpha(color, 0.1),            <Typography variant="body2" color="text.secondary" gutterBottom>

              display: 'flex',              {title}

              alignItems: 'center',            </Typography>

              justifyContent: 'center',            <Typography variant="h4" sx={{ fontWeight: 700, color, mb: 0.5 }}>

              color,              {value}

            }}            </Typography>

          >            {subtitle && (

            {icon}              <Typography variant="caption" color="text.secondary">

          </Box>                {subtitle}

        </Box>              </Typography>

      </CardContent>            )}

    </Card>            {trend !== undefined && (

  );              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>

};                <TrendingUp fontSize="small" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }} />

                <Typography variant="caption" sx={{ fontWeight: 600, color: trend > 0 ? 'success.main' : 'error.main' }}>

// Chart Card Component                  {trend > 0 ? '+' : ''}{trend}%

interface ChartCardProps {                </Typography>

  title: string;              </Box>

  children: React.ReactNode;            )}

}          </Box>

          <Box

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {            sx={{

  const theme = useTheme();              width: 56,

              height: 56,

  return (              borderRadius: 2,

    <Paper              bgcolor: alpha(color, 0.1),

      elevation={0}              display: 'flex',

      sx={{              alignItems: 'center',

        p: 3,              justifyContent: 'center',

        borderRadius: 3,              color,

        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,            }}

        height: '100%',          >

      }}            {icon}

    >          </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>        </Box>

        {title}      </CardContent>

      </Typography>    </Card>

      {children}  );

    </Paper>};

  );

};// Chart Card Component

interface ChartCardProps {

// Main Component  title: string;

const ReportsPageModern: React.FC = () => {  children: React.ReactNode;

  const theme = useTheme();  action?: React.ReactNode;

  const navigate = useNavigate();}



  const [dateRange, setDateRange] = useState('30days');const ChartCard: React.FC<ChartCardProps> = ({ title, children, action }) => {

  const [statusFilter, setStatusFilter] = useState('all');  const theme = useTheme();

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);  return (

    <Paper

  const { data: dashboardData, isLoading, error, refetch } = useQuery({      elevation={0}

    queryKey: ['dashboard'],      sx={{

    queryFn: () => wpApi.dashboard().then((res) => res.data),        p: 3,

  });        borderRadius: 3,

        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,

  const { data: wpListData } = useQuery({        height: '100%',

    queryKey: ['workpackages-report', page, rowsPerPage],      }}

    queryFn: () =>    >

      wpApi.list({ page: page + 1, page_size: rowsPerPage, apply_assignee_filter: false }).then((res) => res.data),      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

  });        <Typography variant="h6" sx={{ fontWeight: 600 }}>

          {title}

  const statusData = useMemo(() => {        </Typography>

    if (!dashboardData?.stats?.by_status) return [];        {action}

    return Object.entries(dashboardData.stats.by_status).map(([name, value]) => ({ name, value: value as number }));      </Box>

  }, [dashboardData]);      {children}

    </Paper>

  const priorityData = useMemo(() => {  );

    if (!dashboardData?.stats?.by_priority) return [];};

    return Object.entries(dashboardData.stats.by_priority).map(([name, value]) => ({ name, value: value as number }));

  }, [dashboardData]);// Main Reports Page Component

const ReportsPageModern: React.FC = () => {

  const trendData = [  const theme = useTheme();

    { month: 'ม.ค.', completed: 45, pending: 23, overdue: 5 },  const navigate = useNavigate();

    { month: 'ก.พ.', completed: 52, pending: 18, overdue: 3 },

    { month: 'มี.ค.', completed: 61, pending: 22, overdue: 7 },  // States

    { month: 'เม.ย.', completed: 58, pending: 15, overdue: 4 },  const [dateRange, setDateRange] = useState('30days');

    { month: 'พ.ค.', completed: 70, pending: 20, overdue: 2 },  const [statusFilter, setStatusFilter] = useState('all');

    { month: 'มิ.ย.', completed: 65, pending: 17, overdue: 6 },  const [page, setPage] = useState(0);

  ];  const [rowsPerPage, setRowsPerPage] = useState(10);



  const handleExportCSV = () => {  // Fetch data

    if (!wpListData?.items) return;  const { data: dashboardData, isLoading, error, refetch } = useQuery({

    const csvContent = [    queryKey: ['dashboard'],

      ['ID', 'หัวข้อ', 'สถานะ', 'ความสำคัญ', 'ผู้รับผิดชอบ', 'วันที่สร้าง', 'วันที่อัพเดท'].join(','),    queryFn: () => wpApi.dashboard().then((res) => res.data),

      ...wpListData.items.map((wp: any) =>  });

        [

          wp.wp_id,  const { data: wpListData } = useQuery({

          `"${wp.subject}"`,    queryKey: ['workpackages-report', page, rowsPerPage],

          extractString(wp.status),    queryFn: () =>

          extractString(wp.priority),      wpApi

          extractString(wp.assignee) || wp.assignee_name || '-',        .list({

          wp.created_at ? format(parseISO(wp.created_at), 'dd/MM/yyyy') : '-',          page: page + 1,

          wp.updated_at ? format(parseISO(wp.updated_at), 'dd/MM/yyyy HH:mm') : '-',          page_size: rowsPerPage,

        ].join(',')          apply_assignee_filter: false,

      ),        })

    ].join('\n');        .then((res) => res.data),

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });  });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);  // Process chart data

    link.download = `workpackages_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;  const statusData = useMemo(() => {

    link.click();    if (!dashboardData?.stats?.by_status) return [];

  };    return Object.entries(dashboardData.stats.by_status).map(([name, value]) => ({

      name,

  if (isLoading) {      value: value as number,

    return (    }));

      <Container maxWidth="xl" sx={{ py: 4 }}>  }, [dashboardData]);

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>

          <CircularProgress size={60} />  const priorityData = useMemo(() => {

        </Box>    if (!dashboardData?.stats?.by_priority) return [];

      </Container>    return Object.entries(dashboardData.stats.by_priority).map(([name, value]) => ({

    );      name,

  }      value: value as number,

    }));

  if (error) {  }, [dashboardData]);

    return (

      <Container maxWidth="xl" sx={{ py: 4 }}>  // Mock trend data (in real app, fetch from backend)

        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>ลองอีกครั้ง</Button>}>  const trendData = [

          เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน    { month: 'ม.ค.', completed: 45, pending: 23, overdue: 5 },

        </Alert>    { month: 'ก.พ.', completed: 52, pending: 18, overdue: 3 },

      </Container>    { month: 'มี.ค.', completed: 61, pending: 22, overdue: 7 },

    );    { month: 'เม.ย.', completed: 58, pending: 15, overdue: 4 },

  }    { month: 'พ.ค.', completed: 70, pending: 20, overdue: 2 },

    { month: 'มิ.ย.', completed: 65, pending: 17, overdue: 6 },

  const stats = dashboardData?.stats;  ];



  return (  // Export functions

    <Container maxWidth="xl" sx={{ py: 4 }}>  const handleExportPDF = () => {

      {/* Header */}    alert('ฟังก์ชัน Export PDF จะถูกพัฒนาในเวอร์ชันถัดไป');

      <Box sx={{ mb: 4 }}>  };

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>

          <Box>  const handleExportCSV = () => {

            <Typography    if (!wpListData?.items) return;

              variant="h4"

              sx={{    const csvContent = [

                fontWeight: 700,      ['ID', 'หัวข้อ', 'สถานะ', 'ความสำคัญ', 'ผู้รับผิดชอบ', 'วันที่สร้าง', 'วันที่อัพเดท'].join(','),

                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,      ...wpListData.items.map((wp: any) =>

                WebkitBackgroundClip: 'text',        [

                WebkitTextFillColor: 'transparent',          wp.wp_id,

                mb: 0.5,          `"${wp.subject}"`,

              }}          extractString(wp.status),

            >          extractString(wp.priority),

              📊 รายงาน          extractString(wp.assignee) || wp.assignee_name || '-',

            </Typography>          wp.created_at ? format(parseISO(wp.created_at), 'dd/MM/yyyy') : '-',

            <Typography variant="body2" color="text.secondary">          wp.updated_at ? format(parseISO(wp.updated_at), 'dd/MM/yyyy HH:mm') : '-',

              รายงานและสถิติการทำงานของระบบ        ].join(',')

            </Typography>      ),

          </Box>    ].join('\n');

          <Stack direction="row" spacing={2}>

            <Button    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });

              variant="contained"    const link = document.createElement('a');

              startIcon={<TableChart />}    link.href = URL.createObjectURL(blob);

              onClick={handleExportCSV}    link.download = `workpackages_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;

              sx={{    link.click();

                textTransform: 'none',  };

                borderRadius: 2,

                fontWeight: 600,  // Loading State

                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,  if (isLoading) {

              }}    return (

            >      <Container maxWidth="xl" sx={{ py: 4 }}>

              Export CSV        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>

            </Button>          <CircularProgress size={60} thickness={4} />

            <Tooltip title="รีเฟรช">        </Box>

              <IconButton      </Container>

                onClick={() => refetch()}    );

                sx={{  }

                  bgcolor: alpha(theme.palette.primary.main, 0.1),

                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },  // Error State

                }}  if (error) {

              >    return (

                <Refresh />      <Container maxWidth="xl" sx={{ py: 4 }}>

              </IconButton>        <Alert

            </Tooltip>          severity="error"

          </Stack>          action={

        </Box>            <Button color="inherit" size="small" onClick={() => refetch()}>

              ลองอีกครั้ง

        {/* Filters */}            </Button>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>          }

          <Grid container spacing={2} alignItems="center">        >

            <Grid item xs={12} md={3}>          เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน

              <TextField        </Alert>

                fullWidth      </Container>

                select    );

                label="ช่วงเวลา"  }

                value={dateRange}

                onChange={(e) => setDateRange(e.target.value)}  const stats = dashboardData?.stats;

                size="small"

                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}  return (

              >    <Container maxWidth="xl" sx={{ py: 4 }}>

                <MenuItem value="7days">7 วันที่แล้ว</MenuItem>      {/* Header */}

                <MenuItem value="30days">30 วันที่แล้ว</MenuItem>      <Box sx={{ mb: 4 }}>

                <MenuItem value="3months">3 เดือนที่แล้ว</MenuItem>        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>

                <MenuItem value="6months">6 เดือนที่แล้ว</MenuItem>          <Box>

              </TextField>            <Typography

            </Grid>              variant="h4"

            <Grid item xs={12} md={3}>              sx={{

              <TextField                fontWeight: 700,

                fullWidth                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,

                select                WebkitBackgroundClip: 'text',

                label="สถานะ"                WebkitTextFillColor: 'transparent',

                value={statusFilter}                mb: 0.5,

                onChange={(e) => setStatusFilter(e.target.value)}              }}

                size="small"            >

                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}              📊 รายงาน

              >            </Typography>

                <MenuItem value="all">ทั้งหมด</MenuItem>            <Typography variant="body2" color="text.secondary">

                <MenuItem value="completed">เสร็จสิ้น</MenuItem>              รายงานและสถิติการทำงานของระบบ

                <MenuItem value="in_progress">กำลังดำเนินการ</MenuItem>            </Typography>

              </TextField>          </Box>

            </Grid>

            <Grid item xs={12} md={6}>          <Stack direction="row" spacing={2}>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>            <Tooltip title="Export PDF">

                <Chip icon={<CalendarToday />} label={format(new Date(), 'dd MMM yyyy', { locale: th })} />              <Button

              </Box>                variant="outlined"

            </Grid>                startIcon={<PictureAsPdf />}

          </Grid>                onClick={handleExportPDF}

        </Paper>                sx={{

      </Box>                  textTransform: 'none',

                  borderRadius: 2,

      {/* Summary Cards */}                  fontWeight: 600,

      <Grid container spacing={3} sx={{ mb: 4 }}>                }}

        <Grid item xs={12} sm={6} lg={3}>              >

          <ReportCard                PDF

            title="งานทั้งหมด"              </Button>

            value={stats?.total || 0}            </Tooltip>

            subtitle="รายการทั้งหมดในระบบ"

            icon={<Assignment sx={{ fontSize: 32 }} />}            <Tooltip title="Export CSV">

            color={theme.palette.info.main}              <Button

          />                variant="contained"

        </Grid>                startIcon={<TableChart />}

        <Grid item xs={12} sm={6} lg={3}>                onClick={handleExportCSV}

          <ReportCard                sx={{

            title="เสร็จสมบูรณ์"                  textTransform: 'none',

            value={stats?.by_status?.completed || 0}                  borderRadius: 2,

            subtitle={`${((stats?.by_status?.completed / stats?.total) * 100 || 0).toFixed(1)}% ของทั้งหมด`}                  fontWeight: 600,

            icon={<CheckCircle sx={{ fontSize: 32 }} />}                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,

            color={theme.palette.success.main}                }}

          />              >

        </Grid>                Export CSV

        <Grid item xs={12} sm={6} lg={3}>              </Button>

          <ReportCard            </Tooltip>

            title="เกินกำหนด"

            value={stats?.overdue_count || 0}            <Tooltip title="รีเฟรช">

            subtitle="ต้องเร่งดำเนินการ"              <IconButton

            icon={<Warning sx={{ fontSize: 32 }} />}                onClick={() => refetch()}

            color={theme.palette.error.main}                sx={{

          />                  bgcolor: alpha(theme.palette.primary.main, 0.1),

        </Grid>                  '&:hover': {

        <Grid item xs={12} sm={6} lg={3}>                    bgcolor: alpha(theme.palette.primary.main, 0.2),

          <ReportCard                  },

            title="เฉลี่ยต่อเดือน"                }}

            value={Math.round((stats?.total || 0) / 6)}              >

            subtitle="ในช่วง 6 เดือนที่แล้ว"                <Refresh />

            icon={<Speed sx={{ fontSize: 32 }} />}              </IconButton>

            color={theme.palette.warning.main}            </Tooltip>

          />          </Stack>

        </Grid>        </Box>

      </Grid>

        {/* Filters */}

      {/* Charts */}        <Paper

      <Grid container spacing={3} sx={{ mb: 4 }}>          elevation={0}

        <Grid item xs={12} lg={8}>          sx={{

          <ChartCard title="📈 แนวโน้มการทำงาน">            p: 2.5,

            <ResponsiveContainer width="100%" height={300}>            borderRadius: 2,

              <LineChart data={trendData}>            bgcolor: alpha(theme.palette.primary.main, 0.02),

                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,

                <XAxis dataKey="month" />          }}

                <YAxis />        >

                <RechartsTooltip />          <Grid container spacing={2} alignItems="center">

                <Legend />            <Grid item xs={12} md={3}>

                <Line type="monotone" dataKey="completed" stroke={theme.palette.success.main} strokeWidth={2} name="เสร็จสิ้น" />              <TextField

                <Line type="monotone" dataKey="pending" stroke={theme.palette.info.main} strokeWidth={2} name="รอดำเนินการ" />                fullWidth

                <Line type="monotone" dataKey="overdue" stroke={theme.palette.error.main} strokeWidth={2} name="เกินกำหนด" />                select

              </LineChart>                label="ช่วงเวลา"

            </ResponsiveContainer>                value={dateRange}

          </ChartCard>                onChange={(e) => setDateRange(e.target.value)}

        </Grid>                size="small"

        <Grid item xs={12} lg={4}>                sx={{

          <ChartCard title="📊 สัดส่วนสถานะ">                  '& .MuiOutlinedInput-root': {

            {statusData.length > 0 ? (                    borderRadius: 2,

              <ResponsiveContainer width="100%" height={300}>                    bgcolor: 'background.paper',

                <PieChart>                  },

                  <Pie                }}

                    data={statusData}              >

                    cx="50%"                <MenuItem value="7days">7 วันที่แล้ว</MenuItem>

                    cy="50%"                <MenuItem value="30days">30 วันที่แล้ว</MenuItem>

                    labelLine={false}                <MenuItem value="3months">3 เดือนที่แล้ว</MenuItem>

                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}                <MenuItem value="6months">6 เดือนที่แล้ว</MenuItem>

                    outerRadius={80}                <MenuItem value="1year">1 ปีที่แล้ว</MenuItem>

                    dataKey="value"              </TextField>

                  >            </Grid>

                    {statusData.map((entry, index) => (

                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />            <Grid item xs={12} md={3}>

                    ))}              <TextField

                  </Pie>                fullWidth

                  <RechartsTooltip />                select

                </PieChart>                label="สถานะ"

              </ResponsiveContainer>                value={statusFilter}

            ) : (                onChange={(e) => setStatusFilter(e.target.value)}

              <Box sx={{ textAlign: 'center', py: 8 }}>                size="small"

                <Typography color="text.secondary">ไม่มีข้อมูล</Typography>                sx={{

              </Box>                  '& .MuiOutlinedInput-root': {

            )}                    borderRadius: 2,

          </ChartCard>                    bgcolor: 'background.paper',

        </Grid>                  },

        <Grid item xs={12}>                }}

          <ChartCard title="🎯 การกระจายตามความสำคัญ">              >

            {priorityData.length > 0 ? (                <MenuItem value="all">ทั้งหมด</MenuItem>

              <ResponsiveContainer width="100%" height={250}>                <MenuItem value="completed">เสร็จสิ้น</MenuItem>

                <BarChart data={priorityData}>                <MenuItem value="in_progress">กำลังดำเนินการ</MenuItem>

                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />                <MenuItem value="pending">รอดำเนินการ</MenuItem>

                  <XAxis dataKey="name" />              </TextField>

                  <YAxis />            </Grid>

                  <RechartsTooltip />

                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />            <Grid item xs={12} md={6}>

                </BarChart>              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>

              </ResponsiveContainer>                <Chip icon={<CalendarToday />} label={format(new Date(), 'dd MMM yyyy', { locale: th })} />

            ) : (              </Box>

              <Box sx={{ textAlign: 'center', py: 8 }}>            </Grid>

                <Typography color="text.secondary">ไม่มีข้อมูล</Typography>          </Grid>

              </Box>        </Paper>

            )}      </Box>

          </ChartCard>

        </Grid>      {/* Summary Cards */}

      </Grid>      <Grid container spacing={3} sx={{ mb: 4 }}>

        <Grid item xs={12} sm={6} lg={3}>

      {/* Data Table */}          <ReportCard

      <ChartCard title="📋 รายการ Work Packages">            title="งานทั้งหมด"

        <TableContainer>            value={stats?.total || 0}

          <Table>            subtitle="รายการทั้งหมดในระบบ"

            <TableHead>            icon={<Assignment sx={{ fontSize: 32 }} />}

              <TableRow>            color={theme.palette.info.main}

                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>          />

                <TableCell sx={{ fontWeight: 700 }}>หัวข้อ</TableCell>        </Grid>

                <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>

                <TableCell sx={{ fontWeight: 700 }}>ความสำคัญ</TableCell>        <Grid item xs={12} sm={6} lg={3}>

                <TableCell sx={{ fontWeight: 700 }}>ผู้รับผิดชอบ</TableCell>          <ReportCard

                <TableCell sx={{ fontWeight: 700 }}>วันที่อัพเดท</TableCell>            title="เสร็จสมบูรณ์"

              </TableRow>            value={stats?.by_status?.completed || 0}

            </TableHead>            subtitle={`${((stats?.by_status?.completed / stats?.total) * 100 || 0).toFixed(1)}% ของทั้งหมด`}

            <TableBody>            icon={<CheckCircle sx={{ fontSize: 32 }} />}

              {wpListData?.items && wpListData.items.length > 0 ? (            color={theme.palette.success.main}

                wpListData.items.map((wp: any) => (            trend={12}

                  <TableRow key={wp.wp_id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/workpackages/${wp.wp_id}`)}>          />

                    <TableCell><Chip label={`#${wp.wp_id}`} size="small" color="primary" /></TableCell>        </Grid>

                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{wp.subject}</Typography></TableCell>

                    <TableCell><Chip label={extractString(wp.status)} size="small" /></TableCell>        <Grid item xs={12} sm={6} lg={3}>

                    <TableCell><Chip label={extractString(wp.priority)} size="small" variant="outlined" /></TableCell>          <ReportCard

                    <TableCell><Typography variant="body2">{extractString(wp.assignee) || wp.assignee_name || '-'}</Typography></TableCell>            title="เกินกำหนด"

                    <TableCell><Typography variant="caption" color="text.secondary">{wp.updated_at ? format(parseISO(wp.updated_at), 'dd MMM yyyy HH:mm', { locale: th }) : '-'}</Typography></TableCell>            value={stats?.overdue_count || 0}

                  </TableRow>            subtitle="ต้องเร่งดำเนินการ"

                ))            icon={<Warning sx={{ fontSize: 32 }} />}

              ) : (            color={theme.palette.error.main}

                <TableRow>            trend={-8}

                  <TableCell colSpan={6} align="center">          />

                    <Typography color="text.secondary" sx={{ py: 4 }}>ไม่มีข้อมูล</Typography>        </Grid>

                  </TableCell>

                </TableRow>        <Grid item xs={12} sm={6} lg={3}>

              )}          <ReportCard

            </TableBody>            title="เฉลี่ยต่อเดือน"

          </Table>            value={Math.round((stats?.total || 0) / 6)}

        </TableContainer>            subtitle="ในช่วง 6 เดือนที่แล้ว"

        <TablePagination            icon={<Speed sx={{ fontSize: 32 }} />}

          component="div"            color={theme.palette.warning.main}

          count={wpListData?.total || 0}          />

          page={page}        </Grid>

          onPageChange={(e, newPage) => setPage(newPage)}      </Grid>

          rowsPerPage={rowsPerPage}

          onRowsPerPageChange={(e) => {      {/* Charts Section */}

            setRowsPerPage(parseInt(e.target.value, 10));      <Grid container spacing={3} sx={{ mb: 4 }}>

            setPage(0);        {/* Trend Chart */}

          }}        <Grid item xs={12} lg={8}>

          labelRowsPerPage="แถวต่อหน้า:"          <ChartCard title="📈 แนวโน้มการทำงาน">

          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}            <ResponsiveContainer width="100%" height={300}>

        />              <LineChart data={trendData}>

      </ChartCard>                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />

    </Container>                <XAxis dataKey="month" />

  );                <YAxis />

};                <RechartsTooltip />

                <Legend />

export default ReportsPageModern;                <Line type="monotone" dataKey="completed" stroke={theme.palette.success.main} strokeWidth={2} name="เสร็จสิ้น" />

                <Line type="monotone" dataKey="pending" stroke={theme.palette.info.main} strokeWidth={2} name="รอดำเนินการ" />
                <Line type="monotone" dataKey="overdue" stroke={theme.palette.error.main} strokeWidth={2} name="เกินกำหนด" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <ChartCard title="📊 สัดส่วนสถานะ">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12}>
          <ChartCard title="🎯 การกระจายตามความสำคัญ">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">ไม่มีข้อมูล</Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Data Table */}
      <ChartCard title="📋 รายการ Work Packages">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>หัวข้อ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ความสำคัญ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ผู้รับผิดชอบ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>วันที่อัพเดท</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wpListData?.items && wpListData.items.length > 0 ? (
                wpListData.items.map((wp: any) => (
                  <TableRow
                    key={wp.wp_id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
                  >
                    <TableCell>
                      <Chip label={`#${wp.wp_id}`} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {wp.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={extractString(wp.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={extractString(wp.priority)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {extractString(wp.assignee) || wp.assignee_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {wp.updated_at ? format(parseISO(wp.updated_at), 'dd MMM yyyy HH:mm', { locale: th }) : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      ไม่มีข้อมูล
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={wpListData?.total || 0}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="แถวต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
        />
      </ChartCard>
    </Container>
  );
};

export default ReportsPageModern;
