import React, { useState } from 'react'
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
  Stepper,
  Step,
  StepLabel,
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
  PersonAdd,
  Store,
  CheckCircle,
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

export const Register = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { register, signInWithGoogle, signInWithFacebook } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
    ruc: '',
    razonSocial: '',
    aceptaTerminos: false,
  })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validateStep1 = () => {
    if (!formData.nombre.trim()) { setError('El nombre es obligatorio'); return false }
    if (!formData.email.trim()) { setError('El correo es obligatorio'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Correo inválido'); return false }
    if (!formData.password) { setError('La contraseña es obligatoria'); return false }
    if (formData.password.length < 6) { setError('Mínimo 6 caracteres'); return false }
    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return false }
    setError(''); return true
  }

  const validateStep2 = () => {
    if (!formData.aceptaTerminos) { setError('Acepta los términos'); return false }
    setError(''); return true
  }

  const handleNext = () => activeStep === 0 ? (validateStep1() && setActiveStep(1)) : (validateStep2() && handleRegister())
  const handleBack = () => { setActiveStep(0); setError('') }

  const handleRegister = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await register(formData.email, formData.password, formData.nombre, formData.telefono, formData.direccion)
      setSuccess('Registro exitoso. Redirigiendo...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? 'Correo ya registrado' : 'Error al registrar')
    } finally { setLoading(false) }
  }

  const handleGoogleLogin = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google')
    } finally { setLoading(false) }
  }

  const handleFacebookLogin = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await signInWithFacebook()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Facebook')
    } finally { setLoading(false) }
  }

  const features = [
    { icon: <Dashboard />, title: 'Dashboard inteligente', description: 'Métricas en tiempo real', color: '#3b82f6' },
    { icon: <Inventory />, title: 'Gestión completa', description: 'Ventas, productos, inventario', color: '#10b981' },
    { icon: <Security />, title: 'Seguro y confiable', description: 'Información protegida', color: '#8b5cf6' },
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        py: 4,
      }}
    >
      <BackgroundRotator images={[foto5, foto6, foto7, foto8, foto9, foto10]} interval={6000} opacity={1} />
      {/* Patrón de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
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
            }}
          >
            {/* Background confined to Paper so top area remains as before */}
            {/* Background confined to Paper so top area remains as before */}
            {/* BackgroundRotator removed from here */}
            <Grid container>
              {/* Columna izquierda - Información premium */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Box sx={{ width: 45, height: 45, borderRadius: 2, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                    <PersonAdd sx={{ fontSize: 28, color: '#667eea' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" letterSpacing={1}>Sistema de ventas</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 2 }}>SALES SYSTEM</Typography>
                  </Box>
                </Box>

                <Typography variant="h4" fontWeight="bold" gutterBottom>Crea tu cuenta gratis</Typography>
                <Typography variant="body2" sx={{ mb: 4, opacity: 0.9 }}>
                  Regístrate para comenzar a gestionar tu negocio.
                </Typography>

                <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
                  <Stack spacing={2}>
                    {features.map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                        <Paper elevation={2} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2, bgcolor: 'transparent', color: 'white' }}>
                          <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.color, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
                            {React.cloneElement(f.icon, { sx: { color: 'white', fontSize: 20 } })}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>{f.title}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}>{f.description}</Typography>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              {/* Columna derecha - Formulario */}
              <Grid item xs={12} md={7} sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Crear cuenta
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Completa tus datos para registrarte</Typography>
                </Box>

                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                  <Step><StepLabel>Datos de cuenta</StepLabel></Step>
                  <Step><StepLabel>Información adicional</StepLabel></Step>
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<CheckCircle />}>{success}</Alert>}

                {activeStep === 0 && (
                  <Box>
                    <TextField fullWidth label="Nombre completo *" name="nombre" value={formData.nombre} onChange={handleChange} margin="normal" required disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField fullWidth label="Correo electrónico *" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" required disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} margin="normal" disabled={loading} placeholder="Opcional" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField fullWidth label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} margin="normal" disabled={loading} placeholder="Opcional" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField
                      fullWidth label="Contraseña *" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} margin="normal" required disabled={loading} helperText="Mínimo 6 caracteres"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                      }}
                    />
                    <TextField
                      fullWidth label="Confirmar contraseña *" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} margin="normal" required disabled={loading}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                      }}
                    />
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box>
                    <TextField fullWidth label="RUC (si aplica)" name="ruc" value={formData.ruc} onChange={handleChange} margin="normal" disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField fullWidth label="Razón social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} margin="normal" disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <FormControlLabel
                      control={<Checkbox name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} color="primary" sx={{ '& .MuiSvgIcon-root': { borderRadius: 1 } }} />}
                      label={<Typography variant="body2">Acepto los <Link href="#">términos</Link> y la <Link href="#">política de privacidad</Link></Typography>}
                      sx={{ mt: 2 }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button onClick={handleBack} disabled={activeStep === 0 || loading} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>Atrás</Button>
                  <Button variant="contained" onClick={handleNext} disabled={loading} sx={{ borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #667eea, #764ba2)', '&:hover': { background: 'linear-gradient(135deg, #5a67d8, #6b46c1)' } }}>
                    {activeStep === 1 ? (loading ? 'Registrando...' : 'Registrarme') : 'Siguiente'}
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }}>o regístrate con</Divider>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button fullWidth variant="outlined" startIcon={<Google />} disabled={loading} sx={{ borderRadius: 2, py: 1 }} onClick={handleGoogleLogin}>Google</Button>
                  <Button fullWidth variant="outlined" startIcon={<Facebook />} disabled={loading} sx={{ borderRadius: 2, py: 1 }} onClick={handleFacebookLogin}>Facebook</Button>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">¿Ya tienes una cuenta? <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Inicia sesión aquí</Link></Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}