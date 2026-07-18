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
  Tab,
  Tabs,
  Fade,
  Zoom,
  Badge,
} from '@mui/material'
import {
  Person,
  Save,
  Edit,
  Email,
  Phone,
  Badge as BadgeIcon,
  Lock,
  Logout,
  PhotoCamera,
  CheckCircle,
  Close,
  Security,
  VerifiedUser,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { auth, db } from '../../services/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { useSnackbar } from 'notistack'
import { motion } from 'framer-motion'
import { cloudinaryService } from '../../services/cloudinaryService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export const MiPerfil = () => {
  const theme = useTheme()
  const { user, logout } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    documento: '',
    fechaRegistro: '',
    fotoURL: '',
    rol: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
  })

  useEffect(() => {
    cargarDatosUsuario()
  }, [])

  const cargarDatosUsuario = async () => {
    setLoading(true)
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserData({
          nombre: data.nombre || '',
          email: auth.currentUser?.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          documento: data.documento || '',
          fechaRegistro: data.creadoEn ? new Date(data.creadoEn).toLocaleDateString() : '',
          fotoURL: data.fotoURL || '',
          rol: data.rol || 'VENDEDOR',
        })
        setFormData({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        })
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar('La imagen no debe superar los 2MB', { variant: 'error' })
      return
    }

    setUploading(true)
    try {
      const url = await cloudinaryService.uploadImage(file)

      // Actualizar en Firestore
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      await updateDoc(userRef, { fotoURL: url })

      // Actualizar perfil en Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url })
      }

      setUserData(prev => ({ ...prev, fotoURL: url }))
      enqueueSnackbar('Foto de perfil actualizada correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error subiendo foto:', error)
      enqueueSnackbar('Error al subir la foto', { variant: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleEliminarFoto = async () => {
    if (!userData.fotoURL) return
    setUploading(true)
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      await updateDoc(userRef, { fotoURL: '' })

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: '' })
      }

      setUserData(prev => ({ ...prev, fotoURL: '' }))
      enqueueSnackbar('Foto de perfil eliminada', { variant: 'success' })
    } catch (error) {
      console.error('Error eliminando foto:', error)
      enqueueSnackbar('No se pudo eliminar la foto', { variant: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleGuardarPerfil = async () => {
    setSaving(true)
    try {
      const userRef = doc(db, 'usuarios', auth.currentUser?.uid || '')
      await updateDoc(userRef, {
        nombre: formData.nombre,
        telefono: formData.telefono,
        direccion: formData.direccion,
      })

      // Actualizar displayName en Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: formData.nombre })
      }

      setUserData(prev => ({
        ...prev,
        nombre: formData.nombre,
        telefono: formData.telefono,
        direccion: formData.direccion,
      }))
      setEditMode(false)
      enqueueSnackbar('Perfil actualizado correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error guardando perfil:', error)
      enqueueSnackbar('Error al guardar los cambios', { variant: 'error' })
    } finally {
      setSaving(false)
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

    setSaving(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      const user = auth.currentUser
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, passwordData.newPassword)
        setPasswordSuccess('Contraseña actualizada correctamente')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setOpenPasswordDialog(false), 1500)
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

  const getRolColor = () => {
    switch (userData.rol) {
      case 'ADMIN': return '#ef4444'
      case 'GERENTE': return '#f59e0b'
      default: return '#10b981'
    }
  }

  const getRolLabel = () => {
    switch (userData.rol) {
      case 'ADMIN': return 'Administrador'
      case 'GERENTE': return 'Gerente'
      default: return 'Vendedor'
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
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Mi Perfil
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Gestiona tu información personal y configuración de cuenta
        </Typography>
      </Box>

      

      <Grid container spacing={3}>
        {/* Columna izquierda - Avatar e información */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 20, boxShadow: '0 30px 60px rgba(15, 23, 42, 0.16)' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(getRolColor(), 0.18)} 0%, ${alpha(getRolColor(), 0.06)} 100%)`,
                p: 4,
                textAlign: 'center',
                borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pb: 2, borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}>
                <Box sx={{ position: 'relative', width: 132, height: 132, mx: 'auto' }}>
                  <Avatar
                    src={userData.fotoURL}
                    sx={{
                      width: 132,
                      height: 132,
                      border: `4px solid ${alpha(getRolColor(), 0.8)}`,
                      boxShadow: '0 25px 50px rgba(15, 23, 42, 0.18)',
                      bgcolor: getRolColor(),
                      fontSize: 52,
                    }}
                  >
                    {!userData.fotoURL && userData.nombre?.charAt(0).toUpperCase()}
                  </Avatar>

                  {uploading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.15)',
                      }}
                    >
                      <CircularProgress size={64} thickness={5} color="success" />
                      <Typography variant="caption" fontWeight="bold" color="text.primary">
                        Cargando imagen...
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Tooltip title="Cambiar foto">
                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
                        '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.92) },
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                      <input type="file" hidden accept="image/*" onChange={handleFotoUpload} />
                    </IconButton>
                  </Tooltip>
                  {userData.fotoURL && (
                    <Tooltip title="Eliminar foto">
                      <IconButton
                        onClick={handleEliminarFoto}
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)',
                          '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.92) },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {userData.nombre}
              </Typography>
              <Chip
                label={getRolLabel()}
                size="medium"
                sx={{
                  bgcolor: alpha(getRolColor(), 0.15),
                  color: getRolColor(),
                  fontWeight: 'bold',
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <VerifiedUser sx={{ fontSize: 14 }} />
                Miembro desde {userData.fechaRegistro}
              </Typography>
            </Box>

            <Divider />

            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" /> Correo electrónico
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {userData.email}
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" /> Teléfono
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {userData.telefono || 'No registrado'}
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" /> Dirección
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {userData.direccion || 'No registrada'}
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon fontSize="small" /> Documento
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userData.documento || 'No registrado'}
              </Typography>
            </CardContent>

            <Divider />

            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={logout}
                sx={{ borderRadius: 2 }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Columna derecha - Formularios */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Información Personal" />
              <Tab label="Seguridad" />
            </Tabs>

            {/* Tab 1: Información Personal */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 3 }}>
                {!editMode ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditMode(true)}>
                        Editar Perfil
                      </Button>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Nombre completo</Typography>
                        <Typography variant="body1" fontWeight="medium">{userData.nombre}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Correo electrónico</Typography>
                        <Typography variant="body1" fontWeight="medium">{userData.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Teléfono</Typography>
                        <Typography variant="body1" fontWeight="medium">{userData.telefono || 'No registrado'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Documento</Typography>
                        <Typography variant="body1" fontWeight="medium">{userData.documento || 'No registrado'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
                        <Typography variant="body1" fontWeight="medium">{userData.direccion || 'No registrada'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Editar Información
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nombre completo"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Teléfono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Dirección"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        Cancelar
                      </Button>
                      <Button variant="contained" startIcon={<Save />} onClick={handleGuardarPerfil} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Tab 2: Seguridad */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Seguridad de la Cuenta
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Security sx={{ fontSize: 40, color: theme.palette.warning.main }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Cambiar Contraseña</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Te recomendamos cambiar tu contraseña periódicamente por seguridad
                        </Typography>
                      </Box>
                      <Button variant="contained" onClick={() => setOpenPasswordDialog(true)}>
                        Cambiar Contraseña
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Email sx={{ fontSize: 40, color: theme.palette.info.main }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Correo Electrónico</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tu correo actual es: <strong>{userData.email}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Para cambiar tu correo, contacta al administrador del sistema
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cambiar Contraseña
          <IconButton onClick={() => setOpenPasswordDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          <TextField
            fullWidth
            label="Contraseña actual"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Nueva contraseña"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            helperText="Mínimo 6 caracteres"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirmar nueva contraseña"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCambiarPassword} disabled={saving}>
            {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}