import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout/Layout'
import { CircularProgress, Box } from '@mui/material'

export const PrivateRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}