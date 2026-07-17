import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Box,
  Paper,
  Typography,
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
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  CheckCircle,
  Storefront,
  TrendingUp,
  Lock,
  Email,
  Person,
  Phone,
  LocationCity,
  FilePresent,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import { useSnackbar } from 'notistack'

const registerBg = new URL('../../assets/images/login1.png', import.meta.url).href

export const Register = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const { register, signInWithGoogle, signInWithFacebook } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
    aceptaTerminos: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) return 'El nombre es obligatorio'
    if (!formData.email.trim()) return 'El correo es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Correo inválido'
    if (!formData.password) return 'La contraseña es obligatoria'
    if (formData.password.length < 6) return 'Mínimo 6 caracteres'
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden'
    if (!formData.aceptaTerminos) return 'Debes aceptar los términos y condiciones'
    return ''
  }

  const handleRegister = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      await register(formData.email, formData.password, formData.nombre, formData.telefono, formData.direccion)
      enqueueSnackbar('¡Registro exitoso! Redirigiendo a login...', { variant: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      const errorMsg = err.code === 'auth/email-already-in-use' ? 'Este correo ya está registrado' : 'Error al registrar. Intenta de nuevo.'
      setError(errorMsg)
      enqueueSnackbar(errorMsg, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error al iniciar sesión con Google', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    try {
      await signInWithFacebook()
      navigate('/dashboard')
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error al iniciar sesión con Facebook', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    { icon: <Storefront sx={{ fontSize: 24 }} />, title: 'Control Total', description: 'Gestiona todos los aspectos de tu negocio', color: '#10b981' },
    { icon: <TrendingUp sx={{ fontSize: 24 }} />, title: 'Reportes Avanzados', description: 'Análisis de ventas en tiempo real', color: '#3b82f6' },
    { icon: <Lock sx={{ fontSize: 24 }} />, title: 'Seguridad Premium', description: 'Datos encriptados y protegidos', color: '#f59e0b' },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#F8FAFC',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        fontFamily: 'Inter, Poppins, sans-serif',
        backgroundImage: `linear-gradient(180deg, rgba(6, 10, 20, 0.84), rgba(10, 16, 34, 0.88)), url(${registerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Container maxWidth="xl" sx={{ height: '100%', minHeight: 'calc(100vh - 64px)' }}>
        <Grid
          container
          sx={{
            height: '100%',
            minHeight: 720,
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'center',
            gap: { xs: 4, md: 0 },
          }}
        >
          {/* Panel Izquierdo - Información */}
          <Grid item xs={12} md={7} sx={{ transform: { md: 'translateX(-20px)' } }}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 'auto', md: '100%' },
                borderRadius: 4,
                overflow: 'hidden',
                backgroundImage: `linear-gradient(135deg, rgba(7, 11, 24, 0.64), rgba(11, 15, 32, 0.88)), url(${registerBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                border: '1px solid rgba(124, 58, 237, 0.55)',
                boxShadow: '0 40px 125px rgba(1, 8, 26, 0.5), 0 0 0 1px rgba(124, 58, 237, 0.22), 0 0 30px rgba(124, 58, 237, 0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 30, 0.55), rgba(8, 12, 24, 0.65))',
                }}
              />

              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  p: { xs: 4, md: 6 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: { xs: 'auto', md: 560 },
                }}
              >
                <Box sx={{ maxWidth: 520, zIndex: 2 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.24), rgba(59, 130, 246, 0.12))',
                        border: '1px solid rgba(255,255,255,0.14)',
                        boxShadow: '0 20px 60px rgba(124, 58, 237, 0.18)',
                      }}
                    >
                      <Storefront sx={{ color: '#D8B048', fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#A7B4FF', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1.6, fontSize: 13 }}>
                        Únete a
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.05em', mt: 0.5, color: '#F8FAFC' }}>
                        Sistema de Ventas
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ color: '#CBD5E1', maxWidth: 520, lineHeight: 1.8, mb: 4 }}>
                    Acceso inmediato a herramientas potentes para gestionar tu negocio.
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 2, zIndex: 2 }}>
                  {benefits.map((item) => (
                    <Paper
                      key={item.title}
                      elevation={0}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 3,
                        py: 2.2,
                        borderRadius: 3,
                        background: 'rgba(15, 23, 42, 0.72)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 22px 50px rgba(0, 0, 0, 0.16)',
                        transition: 'transform 220ms ease, border-color 220ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          background: 'rgba(255,255,255,0.11)',
                          borderColor: 'rgba(124, 58, 237, 0.24)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: 2,
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#F8FAFC' }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Panel Derecho - Formulario */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <Paper
                elevation={20}
                sx={{
                  borderRadius: 5,
                  p: { xs: 4, md: 5 },
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, rgba(5, 9, 21, 0.98), rgba(10, 15, 33, 0.96))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(26px)',
                  boxShadow: '0 45px 130px rgba(0, 0, 0, 0.52)',
                  maxHeight: { xs: 'auto', md: '85vh' },
                  overflowY: { xs: 'visible', md: 'auto' },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -32,
                    right: -32,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    bgcolor: 'rgba(124, 58, 237, 0.16)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -22,
                    left: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'rgba(59, 130, 246, 0.12)',
                    filter: 'blur(28px)',
                    pointerEvents: 'none',
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 2, display: 'grid', gap: 3 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        px: 2.5,
                        py: 0.75,
                        mb: 2,
                        borderRadius: 99,
                        bgcolor: 'rgba(124, 58, 237, 0.14)',
                        border: '1px solid rgba(124, 58, 237, 0.24)',
                        color: '#E9D5FF',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 16 }} />
                      Registro Rápido
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color: '#FFFFFF',
                        mb: 1,
                      }}
                    >
                      Crea tu cuenta
                    </Typography>
                    <Typography sx={{ color: '#CBD5E1' }}>
                      Regístrate en menos de 2 minutos
                    </Typography>
                  </Box>

                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: 3,
                        backgroundColor: 'rgba(248,113,113,0.12)',
                        color: '#FEE2E2',
                        border: '1px solid rgba(248,113,113,0.2)',
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {/* Formulario */}
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleRegister() }} sx={{ display: 'grid', gap: 2.2 }}>
                    {/* Nombre */}
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      name="nombre"
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#8B5CF6' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(10, 18, 38, 0.96)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(20px)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                          '&:hover fieldset': { borderColor: 'rgba(124, 58, 237, 0.32)' },
                          '&.Mui-focused fieldset': { borderColor: '#8B5CF6', boxShadow: '0 0 0 4px rgba(124, 58, 237, 0.12)' },
                          '& .MuiOutlinedInput-input': { color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', userSelect: 'text', caretColor: '#FFFFFF' },
                          '& input:-webkit-autofill': { WebkitBoxShadow: '0 0 0 100px rgba(10, 18, 38, 0.96) inset', WebkitTextFillColor: '#FFFFFF' },
                        },
                      }}
                    />

                    {/* Email */}
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#8B5CF6' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(10, 18, 38, 0.96)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255,255,255,0.12)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                          '&:hover fieldset': { borderColor: 'rgba(124, 58, 237, 0.32)' },
                          '&.Mui-focused fieldset': { borderColor: '#8B5CF6', boxShadow: '0 0 0 4px rgba(124, 58, 237, 0.12)' },
                          '& .MuiOutlinedInput-input': { color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', userSelect: 'text', caretColor: '#FFFFFF' },
                        },
                      }}
                    />

                    {/* Teléfono y Dirección */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Teléfono"
                          name="telefono"
                          placeholder="999-000-000"
                          value={formData.telefono}
                          onChange={handleChange}
                          disabled={loading}
                          InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone sx={{ color: '#38BDF8', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: 'rgba(10, 18, 38, 0.96)',
                              color: '#FFFFFF',
                              border: '1px solid rgba(255,255,255,0.12)',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                              '&.Mui-focused fieldset': { borderColor: '#38BDF8', boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.12)' },
                              '& .MuiOutlinedInput-input': { color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', userSelect: 'text', caretColor: '#FFFFFF' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Dirección"
                          name="direccion"
                          placeholder="Calle Principal 123"
                          value={formData.direccion}
                          onChange={handleChange}
                          disabled={loading}
                          InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationCity sx={{ color: '#FACC15', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: 'rgba(10, 18, 38, 0.96)',
                              color: '#FFFFFF',
                              border: '1px solid rgba(255,255,255,0.12)',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                              '&.Mui-focused fieldset': { borderColor: '#FACC15', boxShadow: '0 0 0 4px rgba(250, 204, 21, 0.12)' },
                              '& .MuiOutlinedInput-input': { color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', userSelect: 'text', caretColor: '#FFFFFF' },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Contraseña */}
                    <TextField
                      fullWidth
                      label="Contraseña"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#10B981' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }} disabled={loading}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(10, 18, 38, 0.96)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255,255,255,0.12)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                          '&:hover fieldset': { borderColor: 'rgba(16, 185, 129, 0.28)' },
                          '&.Mui-focused fieldset': { borderColor: '#10B981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.12)' },
                          '& .MuiOutlinedInput-input': { color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', userSelect: 'text', caretColor: '#FFFFFF' },
                        },
                      }}
                    />

                    {/* Confirmar Contraseña */}
                    <TextField
                      fullWidth
                      label="Confirmar contraseña"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#10B981' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#94a3b8' }} disabled={loading}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(10, 18, 38, 0.96)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255,255,255,0.12)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                          '&:hover fieldset': { borderColor: 'rgba(16, 185, 129, 0.28)' },
                          '&.Mui-focused fieldset': { borderColor: '#10B981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.12)' },
                          '& .MuiOutlinedInput-input': { color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', userSelect: 'text', caretColor: '#FFFFFF' },
                        },
                      }}
                    />

                    {/* Términos */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="aceptaTerminos"
                          checked={formData.aceptaTerminos}
                          onChange={handleChange}
                          disabled={loading}
                          sx={{
                            color: '#94a3b8',
                            '&.Mui-checked': { color: '#8B5CF6' },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          Acepto los{' '}
                          <Link href="#" sx={{ color: '#C4B5FD', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            términos
                          </Link>
                          {' '}y{' '}
                          <Link href="#" sx={{ color: '#C4B5FD', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            privacidad
                          </Link>
                        </Typography>
                      }
                      sx={{ mb: 1 }}
                    />

                    {/* Botón Registrar */}
                    <Button
                      type="submit"
                      fullWidth
                      disabled={loading}
                      sx={{
                        py: 1.9,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 700,
                        letterSpacing: 0.35,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 45%, #2563EB 100%)',
                        color: '#fff',
                        boxShadow: '0 22px 60px rgba(124, 58, 237, 0.24)',
                        transition: 'transform 250ms ease, box-shadow 250ms ease, filter 250ms ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 32px 85px rgba(124, 58, 237, 0.28)',
                          filter: 'brightness(1.08)',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                          Registrando...
                        </>
                      ) : (
                        'Crear Mi Cuenta'
                      )}
                    </Button>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', opacity: 0.75 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        o regístrate con
                      </Typography>
                    </Divider>
                  </Box>

                  {/* Social Buttons */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled={loading}
                        onClick={handleGoogleLogin}
                        startIcon={<Google sx={{ color: '#FB923C' }} />}
                        sx={{
                          borderRadius: 3,
                          color: '#F8FAFC',
                          borderColor: 'rgba(124, 58, 237, 0.18)',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          py: 1.25,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                          '&:hover': {
                            borderColor: '#A78BFA',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          },
                        }}
                      >
                        Google
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled={loading}
                        onClick={handleFacebookLogin}
                        startIcon={<Facebook sx={{ color: '#3B82F6' }} />}
                        sx={{
                          borderRadius: 3,
                          color: '#F8FAFC',
                          borderColor: 'rgba(124, 58, 237, 0.18)',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          py: 1.25,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                          '&:hover': {
                            borderColor: '#A78BFA',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          },
                        }}
                      >
                        Facebook
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Link a Login */}
                  <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid rgba(148, 163, 184, 0.18)' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      ¿Ya tienes cuenta?{' '}
                      <Link
                        component={RouterLink}
                        to="/login"
                        sx={{
                          color: '#C4B5FD',
                          textDecoration: 'none',
                          fontWeight: 700,
                          '&:hover': { color: '#E9D5FF', textDecoration: 'underline' },
                        }}
                      >
                        Inicia sesión
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}