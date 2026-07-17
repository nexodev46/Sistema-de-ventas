import { useState, useEffect } from 'react'
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
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Business,
  Save,
  Upload,
  Delete,
  Phone,
  Email,
  LocationOn,
  Receipt,
  Language,
  Description,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter,
  Share,
  CheckCircle,
  Close,
  Edit,
  QrCode,
  Settings,
} from '@mui/icons-material'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, storage } from '../../services/firebase'
import { ref, deleteObject } from 'firebase/storage'
import { cloudinaryService } from '../../services/cloudinaryService'
import { useSnackbar } from 'notistack'
import { motion } from 'framer-motion'

interface EmpresaData {
  nombre: string
  ruc: string
  razonSocial: string
  telefono: string
  telefono2: string
  email: string
  email2: string
  direccion: string
  slogan: string
  descripcion: string
  sitioWeb: string
  logo: string
  logoPath: string
  logoPreview: string
  horarioApertura: string
  horarioCierre: string
  diasAtencion: string[]
  redesSociales: {
    facebook: string
    instagram: string
    twitter: string
    whatsapp: string
  }
  configuracionFactura: {
    serie: string
    numeroInicial: number
    iva: number
  }
}

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const Empresa = () => {
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<EmpresaData>({
    nombre: '',
    ruc: '',
    razonSocial: '',
    telefono: '',
    telefono2: '',
    email: '',
    email2: '',
    direccion: '',
    slogan: '',
    descripcion: '',
    sitioWeb: '',
    logo: '',
    logoPath: '',
    logoPreview: '',
    horarioApertura: '09:00',
    horarioCierre: '18:00',
    diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    redesSociales: {
      facebook: '',
      instagram: '',
      twitter: '',
      whatsapp: '',
    },
    configuracionFactura: {
      serie: 'F001',
      numeroInicial: 1,
      iva: 18,
    },
  })

  const [openRedesDialog, setOpenRedesDialog] = useState(false)
  const [tempRedes, setTempRedes] = useState(formData.redesSociales)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const docRef = doc(db, 'configuracion', 'empresa')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<EmpresaData>
        setFormData(prev => ({
          ...prev,
          ...data,
          logo: (data.logo as string) || (data.logoPreview as string) || prev.logo || '',
          logoPath: data.logoPath || prev.logoPath || '',
          logoPreview: (data.logoPreview as string) || (data.logo as string) || prev.logoPreview || '',
          redesSociales: {
            facebook: data.redesSociales?.facebook || prev.redesSociales.facebook || '',
            instagram: data.redesSociales?.instagram || prev.redesSociales.instagram || '',
            twitter: data.redesSociales?.twitter || prev.redesSociales.twitter || '',
            whatsapp: data.redesSociales?.whatsapp || prev.redesSociales.whatsapp || '',
          },
        }))
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EmpresaData] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      if (name === 'nombre' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('empresaNombreUpdated', { detail: { nombre: value } }))
      }
    }
  }

  const handleDiaToggle = (dia: string) => {
    setFormData(prev => ({
      ...prev,
      diasAtencion: prev.diasAtencion.includes(dia)
        ? prev.diasAtencion.filter(d => d !== dia)
        : [...prev.diasAtencion, dia],
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar('La imagen no debe superar los 2MB', { variant: 'error' })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let logoUrl = ''
      let logoPath = ''

      // Primer intento: upload al servidor local para evitar CORS de Firebase en localhost
      try {
        logoUrl = await cloudinaryService.uploadImage(file)
      } catch (error) {
        console.error('Error subiendo logo a Cloudinary:', error)
        throw error
      }

      // Si había un logo antiguo en Firebase, intenta eliminarlo.
      if (formData.logoPath) {
        try {
          const oldRef = ref(storage, formData.logoPath)
          await deleteObject(oldRef)
        } catch (e) {
          console.log('Logo anterior no encontrado o no es Firebase:', e)
        }
      }

      const docRef = doc(db, 'configuracion', 'empresa')
      await setDoc(docRef, {
        logo: logoUrl,
        logoPreview: logoUrl,
        logoPath: '',
        updatedAt: new Date().toISOString(),
      }, { merge: true })

      setFormData(prev => ({ ...prev, logo: logoUrl, logoPath: '', logoPreview: logoUrl }))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('empresaLogoUpdated', { detail: { logo: logoUrl } }))
      }
      enqueueSnackbar('Logo actualizado correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error subiendo logo:', error)
      enqueueSnackbar('Error al subir el logo', { variant: 'error' })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveLogo = async () => {
    if (formData.logoPath) {
      try {
        const oldRef = ref(storage, formData.logoPath)
        await deleteObject(oldRef)
      } catch (e) { console.log('Error eliminando logo en Firebase', e) }
    }

    const docRef = doc(db, 'configuracion', 'empresa')
    try {
      await setDoc(docRef, { logo: '', logoPreview: '', logoPath: '' }, { merge: true })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('empresaLogoUpdated', { detail: { logo: '' } }))
      }
    } catch (error) {
      console.error('Error eliminando logo en Firestore:', error)
    }

    setFormData(prev => ({ ...prev, logo: '', logoPath: '', logoPreview: '' }))
    enqueueSnackbar('Logo eliminado', { variant: 'info' })
  }

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (e?.preventDefault) e.preventDefault()
    setSaving(true)

    try {
      const docRef = doc(db, 'configuracion', 'empresa')
      const dataToSave = {
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      await setDoc(docRef, dataToSave, { merge: true })
      setFormData(prev => ({ ...prev, ...dataToSave }))

      if (typeof window !== 'undefined') {
        if (dataToSave.logo) {
          window.dispatchEvent(new CustomEvent('empresaLogoUpdated', { detail: { logo: dataToSave.logo } }))
        }
        if (dataToSave.nombre) {
          window.dispatchEvent(new CustomEvent('empresaNombreUpdated', { detail: { nombre: dataToSave.nombre } }))
        }
      }
      enqueueSnackbar('Datos guardados correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error guardando datos:', error)
      enqueueSnackbar('Error al guardar los datos', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRedes = () => {
    setFormData(prev => ({ ...prev, redesSociales: tempRedes }))
    setOpenRedesDialog(false)
    enqueueSnackbar('Redes sociales actualizadas', { variant: 'success' })
  }

  const steps = ['Información General', 'Contacto', 'Configuración']

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Configuración de Empresa
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Personaliza la información de tu negocio
            </Typography>
          </Box>
          <Button
            type="button"
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{
              bgcolor: 'white',
              color: theme.palette.secondary.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Logo y tarjeta de información */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 20, boxShadow: 4 }}>
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.secondary.main, 0.08),
              }}
            >
              <Typography variant="subtitle2" fontWeight="700" sx={{ letterSpacing: 0.8, color: theme.palette.text.secondary, mb: 2 }}>
                Logo de la empresa
              </Typography>
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                  boxShadow: 4,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Avatar
                  src={formData.logoPreview || formData.logo}
                  imgProps={{ crossOrigin: 'anonymous' }}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'transparent',
                    borderRadius: '50%',
                    '& img': { objectFit: 'contain' },
                  }}
                >
                  {!formData.logoPreview && <Business sx={{ fontSize: 46, color: theme.palette.secondary.main }} />}
                </Avatar>
                {uploading && (
                  <CircularProgress
                    size={140}
                    thickness={4}
                    sx={{ position: 'absolute', zIndex: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Tooltip title="Cambiar logo">
                  <IconButton
                    component="label"
                    size="medium"
                    sx={{
                      bgcolor: 'white',
                      color: theme.palette.secondary.main,
                      boxShadow: 3,
                      '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.12) },
                    }}
                  >
                    <Upload fontSize="small" />
                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                  </IconButton>
                </Tooltip>
                {formData.logoPreview && (
                  <Tooltip title="Eliminar logo">
                    <IconButton
                      onClick={handleRemoveLogo}
                      size="medium"
                      sx={{
                        bgcolor: 'white',
                        color: theme.palette.error.main,
                        boxShadow: 3,
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {formData.nombre || 'Mi Empresa'}
              </Typography>
              {formData.slogan && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {formData.slogan}
                </Typography>
              )}
              <Box
                sx={{
                  mt: 2,
                  mx: 'auto',
                  px: 2,
                  py: 1.25,
                  borderRadius: 3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: alpha(theme.palette.secondary.main, 0.12),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                }}
              >
                <Business sx={{ color: theme.palette.secondary.dark, fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    RUC
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ letterSpacing: 0.4 }}>
                    {formData.ruc || 'No registrado'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business fontSize="small" /> Datos de Contacto
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{formData.telefono || 'No registrado'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{formData.email || 'No registrado'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{formData.direccion || 'No registrada'}</Typography>
                </Box>
                {formData.sitioWeb && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{formData.sitioWeb}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulario principal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, idx) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>


            <form onSubmit={handleSubmit}>
              {/* Paso 1: Información General */}
              {activeStep === 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business /> Información de la Empresa
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nombre de la empresa *"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="RUC"
                        name="ruc"
                        value={formData.ruc}
                        onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Receipt /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Razón Social"
                        name="razonSocial"
                        value={formData.razonSocial}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Slogan"
                        name="slogan"
                        value={formData.slogan}
                        onChange={handleChange}
                        placeholder="Ej: Productos naturales para tu salud"
                        InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Descripción"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        placeholder="Describe tu negocio..."
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={() => setActiveStep(1)}>Siguiente</Button>
                  </Box>
                </motion.div>
              )}

              {/* Paso 2: Contacto */}
              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone /> Datos de Contacto
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Teléfono principal"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Teléfono secundario"
                        name="telefono2"
                        value={formData.telefono2}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email principal"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email secundario"
                        name="email2"
                        type="email"
                        value={formData.email2}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Dirección"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Sitio web"
                        name="sitioWeb"
                        value={formData.sitioWeb}
                        onChange={handleChange}
                        placeholder="https://tusitio.com"
                        InputProps={{ startAdornment: <InputAdornment position="start"><Language /></InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  {/* Redes Sociales */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Share /> Redes Sociales
                    </Typography>
                    <Button variant="outlined" startIcon={<Edit />} onClick={() => {
                      setTempRedes(formData.redesSociales || {
                        facebook: '',
                        instagram: '',
                        twitter: '',
                        whatsapp: '',
                      })
                      setOpenRedesDialog(true)
                    }}>
                      Configurar
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {formData.redesSociales?.facebook && (
                      <Chip icon={<Facebook />} label="Facebook" size="small" />
                    )}
                    {formData.redesSociales?.instagram && (
                      <Chip icon={<Instagram />} label="Instagram" size="small" />
                    )}
                    {formData.redesSociales?.twitter && (
                      <Chip icon={<Twitter />} label="Twitter" size="small" />
                    )}
                    {formData.redesSociales?.whatsapp && (
                      <Chip icon={<WhatsApp />} label="WhatsApp" size="small" />
                    )}
                    {!formData.redesSociales?.facebook && !formData.redesSociales?.instagram &&
                      !formData.redesSociales?.twitter && !formData.redesSociales?.whatsapp && (
                        <Typography variant="caption" color="text.secondary">No hay redes sociales configuradas</Typography>
                      )}
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" onClick={() => setActiveStep(0)}>Atrás</Button>
                    <Button variant="contained" onClick={() => setActiveStep(2)}>Siguiente</Button>
                  </Box>
                </motion.div>
              )}

              {/* Paso 3: Configuración */}
              {activeStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings /> Horario y Facturación
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horario de apertura"
                        name="horarioApertura"
                        type="time"
                        value={formData.horarioApertura}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horario de cierre"
                        name="horarioCierre"
                        type="time"
                        value={formData.horarioCierre}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Días de atención</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {diasSemana.map(dia => (
                          <Chip
                            key={dia}
                            label={dia}
                            onClick={() => handleDiaToggle(dia)}
                            color={formData.diasAtencion.includes(dia) ? 'primary' : 'default'}
                            variant={formData.diasAtencion.includes(dia) ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                    <Receipt /> Configuración de Facturación
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Serie"
                        name="configuracionFactura.serie"
                        value={formData.configuracionFactura.serie}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Número inicial"
                        name="configuracionFactura.numeroInicial"
                        type="number"
                        value={formData.configuracionFactura.numeroInicial}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="IVA (%)"
                        name="configuracionFactura.iva"
                        type="number"
                        value={formData.configuracionFactura.iva}
                        onChange={handleChange}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" onClick={() => setActiveStep(1)}>Atrás</Button>
                    <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </motion.div>
              )}

            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de redes sociales */}
      <Dialog open={openRedesDialog} onClose={() => setOpenRedesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Redes Sociales
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenRedesDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Facebook"
            value={tempRedes.facebook}
            onChange={(e) => setTempRedes(prev => ({ ...prev, facebook: e.target.value }))}
            placeholder="https://facebook.com/tuempresa"
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Facebook /></InputAdornment> }}
          />
          <TextField
            fullWidth
            label="Instagram"
            value={tempRedes.instagram}
            onChange={(e) => setTempRedes(prev => ({ ...prev, instagram: e.target.value }))}
            placeholder="https://instagram.com/tuempresa"
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Instagram /></InputAdornment> }}
          />
          <TextField
            fullWidth
            label="Twitter"
            value={tempRedes.twitter}
            onChange={(e) => setTempRedes(prev => ({ ...prev, twitter: e.target.value }))}
            placeholder="https://twitter.com/tuempresa"
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Twitter /></InputAdornment> }}
          />
          <TextField
            fullWidth
            label="WhatsApp"
            value={tempRedes.whatsapp}
            onChange={(e) => setTempRedes(prev => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="https://wa.me/51999999999"
            InputProps={{ startAdornment: <InputAdornment position="start"><WhatsApp /></InputAdornment> }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRedesDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveRedes}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}