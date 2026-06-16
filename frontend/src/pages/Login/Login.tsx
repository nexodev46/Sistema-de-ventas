import React, { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Dashboard,
  Inventory,
  Security,
  Store,
  TrendingUp,
  People,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import BackgroundRotator from '../../components/Common/BackgroundRotator'
import foto5 from '../../assets/images/foto5.png'
import foto6 from '../../assets/images/foto6.png'
import foto7 from '../../assets/images/foto7.png'
import foto8 from '../../assets/images/foto8.png'
import foto9 from '../../assets/images/foto9.png'
import foto10 from '../../assets/images/foto10.png'

export const Login = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { login, signInWithGoogle, signInWithFacebook } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => Number(sessionStorage.getItem('loginFailedAttempts') || '0'))
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const value = sessionStorage.getItem('loginLockoutUntil')
    return value ? Number(value) : null
  })

  const MAX_FAILED_ATTEMPTS = 5
  const LOCKOUT_DURATION_MS = 30_000
  const isLockedOut = lockoutUntil !== null && lockoutUntil > Date.now()

  useEffect(() => {
    if (!lockoutUntil) return
    const interval = window.setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null)
        setFailedAttempts(0)
        sessionStorage.removeItem('loginFailedAttempts')
        sessionStorage.removeItem('loginLockoutUntil')
      }
    }, 1000)
    return () => window.clearInterval(interval)
  }, [lockoutUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) {
      setError('Formulario inválido')
      return
    }

    if (isLockedOut) {
      setError(getLockoutMessage() || 'Demasiados intentos. Intenta de nuevo más tarde.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await login(email, password, rememberMe)
      setFailedAttempts(0)
      setLockoutUntil(null)
      sessionStorage.removeItem('loginFailedAttempts')
      sessionStorage.removeItem('loginLockoutUntil')
      navigate('/dashboard')
    } catch (error: any) {
      const nextAttempts = failedAttempts + 1
      setFailedAttempts(nextAttempts)
      sessionStorage.setItem('loginFailedAttempts', String(nextAttempts))

      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        const unlockAt = Date.now() + LOCKOUT_DURATION_MS
        setLockoutUntil(unlockAt)
        sessionStorage.setItem('loginLockoutUntil', String(unlockAt))
        setError('Demasiados intentos. Intenta de nuevo en 30 segundos.')
      } else {
        setError('Correo o contraseña incorrectos')
      }

      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google')
      console.error('Google login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithFacebook()
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Facebook')
      console.error('Facebook login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLockoutMessage = () => {
    if (!isLockedOut || !lockoutUntil) return null
    const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000)
    return `Demasiados intentos. Intenta de nuevo en ${secondsLeft} segundos.`
  }

  const features = [
    { icon: <Dashboard />, title: 'Dashboard inteligente', description: 'Métricas y reportes en tiempo real', color: '#3b82f6' },
    { icon: <Inventory />, title: 'Gestión completa', description: 'Ventas, productos, inventario y clientes', color: '#10b981' },
    { icon: <Security />, title: 'Seguro y confiable', description: 'Tu información siempre protegida', color: '#8b5cf6' },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Full-screen background images (visible clearly) */}
      <BackgroundRotator images={[foto5, foto6, foto7, foto8, foto9, foto10]} interval={6000} opacity={1} />

      {/* Círculos decorativos */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05))',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
        }}
      />

      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: 5,
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Grid container sx={{ position: 'relative', zIndex: 2 }}>
              {/* Columna izquierda - Información premium */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  p: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decoración interior */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />

                {/* Logo y nombre */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Store sx={{ fontSize: 30, color: '#667eea' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" letterSpacing={1}>
                      Sistema de ventas
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 2 }}>
                      SALES SYSTEM
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
                  Bienvenido de nuevo
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, position: 'relative', zIndex: 1 }}>
                  Inicia sesión para gestionar tus ventas, productos, clientes e inventario.
                </Typography>

                {/* Redesigned features list */}
                <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
                  <Stack spacing={2}>
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Paper elevation={2} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2, bgcolor: 'transparent', color: 'white' }}>
                          <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: feature.color, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
                            {React.cloneElement(feature.icon, { sx: { color: 'white', fontSize: 20 } })}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}>
                              {feature.description}
                            </Typography>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>

                {/* Imagen decorativa inferior */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    opacity: 0.15,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 80 }} />
                </Box>
              </Grid>

              {/* Columna derecha - Formulario */}
              <Grid item xs={12} md={6} sx={{ p: 5 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Iniciar sesión
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresa tus credenciales para acceder al sistema
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
                {isLockedOut && !error && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    {getLockoutMessage()}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                    style={{ display: 'none' }}
                    aria-hidden="true"
                  />
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    type="email"
                    placeholder="ejemplo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          color="primary"
                          sx={{ '& .MuiSvgIcon-root': { borderRadius: 1 } }}
                        />
                      }
                      label="Recordarme"
                    />
                    <Link href="#" variant="body2" underline="hover" sx={{ color: theme.palette.primary.main }}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || isLockedOut}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      mb: 2,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
                      },
                    }}
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ¿No tienes una cuenta?{' '}
                      <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        Regístrate aquí
                      </Link>
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      o continúa con
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Google />}
                      disabled={loading || isLockedOut}
                      sx={{ borderRadius: 2, py: 1 }}
                      onClick={handleGoogleLogin}
                    >
                      Google
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Facebook />}
                      disabled={loading || isLockedOut}
                      sx={{ borderRadius: 2, py: 1 }}
                      onClick={handleFacebookLogin}
                    >
                      Facebook
                    </Button>
                  </Box>
                </form>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}