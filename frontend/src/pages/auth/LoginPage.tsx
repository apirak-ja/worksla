import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
} from '@mui/material'
import { Work, Login as LoginIcon } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, textAlign: 'center' }}>
            <Work sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              WorkSLA
            </Typography>
            <Typography variant="subtitle1">
              Open Project - SLA Reporting System
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2, opacity: 0.9 }}>
              Medical Center, Walailak University
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Paper>
        <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 3, color: 'white' }}>
          © 2025 Digital Medical Infrastructure Team
        </Typography>
      </Container>
    </Box>
  )
}

export default LoginPage
