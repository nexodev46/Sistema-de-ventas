import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Security,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Close,
  Phone,
  Email,
  Computer,
  Smartphone,
  Laptop,
  Watch,
  LocationOn,
  AccessTime,
  VerifiedUser,
  Shield,
  Key,
  Fingerprint,
  QrCode,
  Warning,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { auth, db } from '../../services/firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { useSnackbar } from 'notistack'
import { motion } from 'framer-motion'

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, delay = 0 }: any) => {
  const theme = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Componente de dispositivo
const DispositivoItem = ({ dispositivo, onRevocar }: any) => {
  const getDeviceIcon = (tipo: string) => {
    switch (tipo) {
      case 'movil': return <Smartphone />
      case 'tablet': return <Smartphone />
      case 'desktop': return <Computer />
      default: return <Laptop />
    }
  }

  return (
    <ListItem sx={{ bgcolor: 'action.hover', borderRadius: 2, mb: 1 }}>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: alpha(dispositivo.color, 0.1), color: dispositivo.color }}>
          {getDeviceIcon(dispositivo.tipo)}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={dispositivo.nombre}
        secondary={
          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              <LocationOn sx={{ fontSize: 12, mr: 0.5 }} /> {dispositivo.ubicacion}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <AccessTime sx={{ fontSize: 12, mr: 0.5 }} /> Último acceso: {dispositivo.ultimoAcceso}
            </Typography>
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <Tooltip title="Revocar acceso">
          <IconButton edge="end" onClick={() => onRevocar(dispositivo.id)} size="small" color="error">
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export const Seguridad = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const [open2FADialog, setOpen2FADialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [notificacionesSeguridad, setNotificacionesSeguridad] = useState(true)
  const [sessions, setSessions] = useState([
    {
      id: 1,
      nombre: 'Chrome - Windows 11',
      tipo: 'desktop',
      ubicacion: 'Cusco, Perú',
      ultimoAcceso: 'Hace 5 minutos',
      color: '#3b82f6',
      actual: true,
    },
    {
      id: 2,
      nombre: 'Firefox - MacBook',
      tipo: 'desktop',
      ubicacion: 'Lima, Perú',
      ultimoAcceso: 'Hace 2 días',
      color: '#f59e0b',
      actual: false,
    },
    {
      id: 3,
      nombre: 'Safari - iPhone 13',
      tipo: 'movil',
      ubicacion: 'Arequipa, Perú',
      ultimoAcceso: 'Hace 1 semana',
      color: '#10b981',
      actual: false,
    },
  ])

  useEffect(() => {
    cargarDatosSeguridad()
  }, [])

  const cargarDatosSeguridad = async () => {
    setLoading(true)
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const data = userDoc.data()
        setTwoFAEnabled(data.twoFAEnabled || false)
        setNotificacionesSeguridad(data.notificacionesSeguridad !== false)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setSaving(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      const currentUser = auth.currentUser
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword)
        await reauthenticateWithCredential(currentUser, credential)
        await updatePassword(currentUser, passwordData.newPassword)
        setPasswordSuccess('Contraseña actualizada correctamente')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setOpenChangePassword(false), 1500)
        enqueueSnackbar('Contraseña actualizada correctamente', { variant: 'success' })
      }
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Contraseña actual incorrecta')
      } else {
        setPasswordError('Error al cambiar la contraseña')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRevocarSesion = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id))
    enqueueSnackbar('Sesión cerrada correctamente', { variant: 'info' })
  }

  const handleToggle2FA = async () => {
    const newState = !twoFAEnabled
    setTwoFAEnabled(newState)
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      await updateDoc(userRef, { twoFAEnabled: newState })
      enqueueSnackbar(
        newState ? 'Autenticación en dos pasos activada' : 'Autenticación en dos pasos desactivada',
        { variant: 'success' }
      )
    } catch (error) {
      console.error('Error actualizando 2FA:', error)
      setTwoFAEnabled(!newState)
    }
  }

  const handleToggleNotificaciones = async () => {
    const newState = !notificacionesSeguridad
    setNotificacionesSeguridad(newState)
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      await updateDoc(userRef, { notificacionesSeguridad: newState })
    } catch (error) {
      console.error('Error actualizando notificaciones:', error)
      setNotificacionesSeguridad(!newState)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header con gradiente */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Seguridad
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Protege tu cuenta y controla el acceso a tu información
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Nivel de Seguridad" value="Alto" icon={<Shield />} color={theme.palette.success.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Sesiones Activas" value={sessions.length} icon={<Computer />} color={theme.palette.primary.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Último Cambio" value="Hace 30 días" icon={<Key />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="2FA" value={twoFAEnabled ? "Activado" : "Desactivado"} icon={<Fingerprint />} color={twoFAEnabled ? theme.palette.success.main : theme.palette.grey[500]} delay={400} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Columna izquierda - Cambiar contraseña */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                  <Lock />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Cambiar Contraseña</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Te recomendamos cambiar tu contraseña cada 3 meses
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tu contraseña debe tener:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography component="li" variant="caption" color="text.secondary">Mínimo 6 caracteres</Typography>
                  <Typography component="li" variant="caption" color="text.secondary">Incluir números y letras</Typography>
                  <Typography component="li" variant="caption" color="text.secondary">No usar contraseñas comunes</Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Key />}
                onClick={() => setOpenChangePassword(true)}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha - Autenticación en dos pasos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                  <Fingerprint />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Autenticación en Dos Pasos (2FA)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Capa adicional de seguridad para tu cuenta
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">Estado</Typography>
                  <Chip
                    label={twoFAEnabled ? 'Activado' : 'Desactivado'}
                    size="small"
                    color={twoFAEnabled ? 'success' : 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Button
                  variant={twoFAEnabled ? 'outlined' : 'contained'}
                  color={twoFAEnabled ? 'error' : 'primary'}
                  onClick={handleToggle2FA}
                >
                  {twoFAEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                </Button>
              </Box>

              {twoFAEnabled && (
                <Alert severity="success" icon={<VerifiedUser />} sx={{ mt: 2 }}>
                  Tu cuenta está protegida con autenticación en dos pasos
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sesiones activas */}
      <Card sx={{ borderRadius: 3, mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
              <Computer />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">Sesiones Activas</Typography>
              <Typography variant="caption" color="text.secondary">
                Dispositivos donde has iniciado sesión
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <List>
            {sessions.map((dispositivo) => (
              <DispositivoItem
                key={dispositivo.id}
                dispositivo={dispositivo}
                onRevocar={handleRevocarSesion}
              />
            ))}
            {sessions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay sesiones activas
                </Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Historial de accesos */}
      <Card sx={{ borderRadius: 3, mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
              <AccessTime />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">Historial de Accesos</Typography>
              <Typography variant="caption" color="text.secondary">
                Últimos 10 accesos a tu cuenta
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Hoy, 10:30 AM</TableCell>
                  <TableCell>Chrome - Windows 11</TableCell>
                  <TableCell>Cusco, Perú</TableCell>
                  <TableCell>190.237.xx.xx</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ayer, 3:15 PM</TableCell>
                  <TableCell>Chrome - Windows 11</TableCell>
                  <TableCell>Cusco, Perú</TableCell>
                  <TableCell>190.237.xx.xx</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>02/06/2026, 9:45 AM</TableCell>
                  <TableCell>Firefox - MacBook</TableCell>
                  <TableCell>Lima, Perú</TableCell>
                  <TableCell>181.64.xx.xx</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ textAlign: 'center', py: 4 }} colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      Mostrando los últimos accesos
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Notificaciones de seguridad */}
      <Card sx={{ borderRadius: 3, mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
              <Email />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">Notificaciones de Seguridad</Typography>
              <Typography variant="caption" color="text.secondary">
                Recibe alertas sobre actividad sospechosa
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" fontWeight="medium">Alertas de nuevos accesos</Typography>
              <Typography variant="caption" color="text.secondary">
                Recibe un correo cuando alguien acceda desde un dispositivo nuevo
              </Typography>
            </Box>
            <Switch checked={notificacionesSeguridad} onChange={handleToggleNotificaciones} />
          </Box>
        </CardContent>
      </Card>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={openChangePassword} onClose={() => setOpenChangePassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cambiar Contraseña
          <IconButton onClick={() => setOpenChangePassword(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          <TextField
            fullWidth
            label="Contraseña actual"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
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
          <TextField
            fullWidth
            label="Nueva contraseña"
            type={showNewPassword ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            helperText="Mínimo 6 caracteres"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirmar nueva contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenChangePassword(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCambiarPassword} disabled={saving}>
            {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}