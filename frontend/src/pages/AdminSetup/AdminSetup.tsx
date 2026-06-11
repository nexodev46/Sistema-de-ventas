import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Box, Paper, Typography, TextField, Button, Alert, Stepper, Step, StepLabel, IconButton, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff, AdminPanelSettings, Security } from '@mui/icons-material'
import { firebaseAuthService } from '../../services/firebaseAuthService'

export const AdminSetup = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirmPassword: '', telefono: '', direccion: '', codigoSecreto: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const validateStep1 = () => {
    if (!formData.nombre.trim()) { setError('Nombre obligatorio'); return false }
    if (!formData.email.trim()) { setError('Email obligatorio'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Email inválido'); return false }
    if (!formData.password) { setError('Contraseña obligatoria'); return false }
    if (formData.password.length < 6) { setError('Mínimo 6 caracteres'); return false }
    if (formData.password !== formData.confirmPassword) { setError('Contraseñas no coinciden'); return false }
    setError(''); return true
  }

  const validateStep2 = () => {
    if (formData.codigoSecreto !== 'KAITA2024') { setError('Código secreto incorrecto'); return false }
    setError(''); return true
  }

  const handleNext = () => activeStep === 0 ? (validateStep1() && setActiveStep(1)) : (validateStep2() && handleCreateAdmin())
  const handleBack = () => { setActiveStep(0); setError('') }

  const handleCreateAdmin = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const userCredential = await firebaseAuthService.register(formData.email, formData.password, formData.nombre, formData.telefono, formData.direccion)
      await firebaseAuthService.changeUserRole(userCredential.user.uid, 'ADMIN')
      setSuccess('ADMIN creado exitosamente. Redirigiendo...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) { setError(err.code === 'auth/email-already-in-use' ? 'Email ya registrado' : 'Error al crear ADMIN') } finally { setLoading(false) }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' }}>
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{ borderRadius: 4, p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}><AdminPanelSettings sx={{ fontSize: 60, color: 'primary.main' }} /><Typography variant="h4" fontWeight="bold">Configuración de ADMIN</Typography><Typography variant="body2" color="text.secondary">Crea el usuario administrador</Typography></Box>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}><Step><StepLabel>Datos personales</StepLabel></Step><Step><StepLabel>Verificación</StepLabel></Step></Stepper>
          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
          {activeStep === 0 && (<Box><TextField fullWidth label="Nombre completo *" name="nombre" value={formData.nombre} onChange={handleChange} margin="normal" required disabled={loading} /><TextField fullWidth label="Correo electrónico *" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" required disabled={loading} /><TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} margin="normal" disabled={loading} /><TextField fullWidth label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} margin="normal" disabled={loading} /><TextField fullWidth label="Contraseña *" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} margin="normal" required disabled={loading} helperText="Mínimo 6 caracteres" InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} /><TextField fullWidth label="Confirmar contraseña *" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} margin="normal" required disabled={loading} /></Box>)}
          {activeStep === 1 && (<Box><Alert severity="info" sx={{ mb: 3 }}>Configuración de seguridad. Solo el dueño debe acceder.</Alert><TextField fullWidth label="Código secreto *" name="codigoSecreto" type="password" value={formData.codigoSecreto} onChange={handleChange} margin="normal" required disabled={loading} helperText="Código: KAITA2024" /></Box>)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}><Button onClick={handleBack} disabled={activeStep === 0 || loading}>Atrás</Button><Button variant="contained" onClick={handleNext} disabled={loading} startIcon={<Security />}>{activeStep === 1 ? (loading ? 'Creando...' : 'Crear ADMIN') : 'Siguiente'}</Button></Box>
        </Paper>
      </Container>
    </Box>
  )
}