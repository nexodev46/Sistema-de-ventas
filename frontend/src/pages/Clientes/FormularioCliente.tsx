import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
  Avatar,
  Card,
} from '@mui/material'
import {
  Save,
  ArrowBack,
  Person,
  Email,
  Phone,
  LocationOn,
  Badge,
  Cake,
  Note,
  CheckCircle,
} from '@mui/icons-material'
import { clienteService } from '../../services/clienteService'
import { ClienteFormData } from '../../types/cliente.types'
import { motion } from 'framer-motion'

const initialData: ClienteFormData = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  documento: '',
  tipoDocumento: 'DNI',
  fechaNacimiento: '',
  notas: '',
}

export const FormularioCliente = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const isEditing = !!id

  useEffect(() => {
    if (isEditing) cargarCliente()
  }, [id])

  const cargarCliente = async () => {
    setLoading(true)
    try {
      const cliente = await clienteService.getById(id!)
      if (cliente) {
        setFormData({
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          documento: cliente.documento,
          tipoDocumento: cliente.tipoDocumento,
          fechaNacimiento: cliente.fechaNacimiento || '',
          notas: cliente.notas || '',
        })
      }
    } catch (error) {
      setError('Error al cargar el cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (isEditing) {
        await clienteService.update(id!, formData)
        setSuccess('Cliente actualizado correctamente')
      } else {
        await clienteService.create(formData)
        setSuccess('Cliente creado correctamente')
      }
      setTimeout(() => navigate('/clientes'), 1500)
    } catch (error) {
      setError('Error al guardar el cliente')
    } finally {
      setSaving(false)
    }
  }

  const steps = ['Información Personal', 'Contacto y Documentos']

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/clientes')}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              {activeStep === 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" /> Datos Personales
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nombre completo *"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de documento</InputLabel>
                        <Select
                          value={formData.tipoDocumento}
                          onChange={(e) => setFormData(prev => ({ ...prev, tipoDocumento: e.target.value as any }))}
                          label="Tipo de documento"
                        >
                          <MenuItem value="DNI">DNI</MenuItem>
                          <MenuItem value="RUC">RUC</MenuItem>
                          <MenuItem value="CE">Carnet de Extranjería</MenuItem>
                          <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Número de documento"
                        name="documento"
                        value={formData.documento}
                        onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Badge /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Fecha de nacimiento"
                        name="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Cake /></InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={() => setActiveStep(1)}>
                      Siguiente
                    </Button>
                  </Box>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="primary" /> Contacto y Dirección
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Correo electrónico *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
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
                        label="Notas adicionales"
                        name="notas"
                        value={formData.notas}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        placeholder="Información adicional sobre el cliente..."
                        InputProps={{ startAdornment: <InputAdornment position="start"><Note /></InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" onClick={() => setActiveStep(0)}>
                      Atrás
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar Cliente'}
                    </Button>
                  </Box>
                </motion.div>
              )}
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: theme.palette.info.main, mx: 'auto', mb: 2 }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {formData.nombre || 'Nuevo Cliente'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.tipoDocumento}: {formData.documento || 'No especificado'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">Información de contacto</Typography>
              <Typography variant="body2"><Email fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} /> {formData.email || '—'}</Typography>
              <Typography variant="body2"><Phone fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} /> {formData.telefono || '—'}</Typography>
              <Typography variant="body2"><LocationOn fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} /> {formData.direccion || '—'}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}