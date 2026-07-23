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
  TextField,
  InputAdornment,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Zoom,
  Divider,
} from '@mui/material'
import {
  Tune,
  Search,
  Close,
  
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Delete,
} from '@mui/icons-material'
import { productoService } from '../../../services/productoService'
import { ajusteService } from '../../../services/ajusteService'
import { Producto } from '../../../types/producto.types'
import { AjusteInventario } from '../../../types/ajuste.types'
import { useAuth } from '../../../contexts/AuthContext'


// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, prefix = '', delay = 0 }: any) => {
  const theme = useTheme()
  return (
    <Zoom in style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          borderRadius: 3,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[12],
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  )
}

const getMotivoColor = (motivo: string) => {
  switch (motivo) {
    case 'CORRECCION': return 'info'
    case 'MERMA': return 'error'
    case 'SOBRANTE': return 'success'
    case 'CADUCIDAD': return 'warning'
    case 'ROTURA': return 'error'
    default: return 'default'
  }
}

const getMotivoLabel = (motivo: string) => {
  switch (motivo) {
    case 'CORRECCION': return 'Corrección'
    case 'MERMA': return 'Merma'
    case 'SOBRANTE': return 'Sobrante'
    case 'CADUCIDAD': return 'Caducidad'
    case 'ROTURA': return 'Rotura'
    default: return 'Otro'
  }
}

export const AjustesInventario = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [ajustes, setAjustes] = useState<AjusteInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nuevaCantidad: 0,
    motivo: 'CORRECCION',
    observacion: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [productosData, ajustesData] = await Promise.all([
        productoService.getAll(),
        ajusteService.getAll(),
      ])
      setProductos(productosData)
      setAjustes(ajustesData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProducto = (producto: Producto) => {
    setSelectedProducto(producto)
    setFormData({
      nuevaCantidad: producto.stockActual,
      motivo: 'CORRECCION',
      observacion: '',
    })
    setActiveStep(1)
  }

  const handleNuevoAjuste = () => {
    setSelectedProducto(null)
    setFormData({
      nuevaCantidad: 0,
      motivo: 'CORRECCION',
      observacion: '',
    })
    setActiveStep(0)
    setError('')
    setSuccess('')
    setOpenDialog(true)
  }

  const handleGuardarAjuste = async () => {
    if (!selectedProducto) {
      setError('Selecciona un producto')
      return
    }
    if (formData.nuevaCantidad < 0) {
      setError('La cantidad no puede ser negativa')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await ajusteService.realizarAjuste(
        {
          productoId: selectedProducto.id,
          nuevaCantidad: formData.nuevaCantidad,
          motivo: formData.motivo as any,
          observacion: formData.observacion,
        },
        user?.nombre || 'Admin'
      )
      setSuccess('Ajuste realizado correctamente')
      setActiveStep(2)
      setTimeout(() => {
        setOpenDialog(false)
        cargarDatos()
        setActiveStep(0)
        setSelectedProducto(null)
      }, 1500)
    } catch (error) {
      setError('Error al realizar el ajuste')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSelectedProducto(null)
    setFormData({
      nuevaCantidad: 0,
      motivo: 'CORRECCION',
      observacion: '',
    })
    setActiveStep(0)
    setError('')
    setSuccess('')
  }

  const diferencia = selectedProducto ? formData.nuevaCantidad - selectedProducto.stockActual : 0
  const esAumento = diferencia > 0

  const ajustesFiltrados = ajustes.filter(a => {
    if (tabValue === 1) return a.diferencia > 0
    if (tabValue === 2) return a.diferencia < 0
    return true
  })

  const totalAjustes = ajustes.length

  const handleEliminarAjuste = async (ajusteId: string) => {
    if (!window.confirm('¿Eliminar este ajuste de inventario? Esta acción no revertirá el stock automáticamente.')) {
      return
    }

    try {
      await ajusteService.delete(ajusteId)
      setAjustes(prev => prev.filter(a => a.id !== ajusteId))
      setSuccess('Ajuste eliminado correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error eliminando ajuste:', error)
      setError('No se pudo eliminar el ajuste. Revisa la consola.')
    }
  }
  const totalAumentos = ajustes.filter(a => a.diferencia > 0).reduce((sum, a) => sum + a.diferencia, 0)
  const totalDisminuciones = ajustes.filter(a => a.diferencia < 0).reduce((sum, a) => sum + Math.abs(a.diferencia), 0)

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
              Ajustes de Inventario
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Correcciones manuales de stock por mermas, sobrantes o caducidad
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Tune />}
            onClick={handleNuevoAjuste}
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nuevo Ajuste
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Ajustes" value={totalAjustes} icon={<Tune />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Unidades Aumentadas" value={totalAumentos} icon={<TrendingUp />} color={theme.palette.success.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Unidades Disminuidas" value={totalDisminuciones} icon={<TrendingDown />} color={theme.palette.error.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ajustes Pendientes" value="0" icon={<Warning />} color={theme.palette.warning.main} delay={400} />
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Todos" />
          <Tab label="Aumentos" />
          <Tab label="Disminuciones" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar ajustes por producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />
        </Box>
      </Paper>

      {/* Tabla de ajustes */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.08) }}>
                <TableCell>Fecha</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Stock Anterior</TableCell>
                <TableCell align="center">Stock Nuevo</TableCell>
                <TableCell align="center">Diferencia</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ajustesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Tune sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay ajustes registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ajustesFiltrados.map((ajuste) => (
                  <TableRow key={ajuste.id} hover>
                    <TableCell>
                      <Typography variant="body2">{ajuste.fecha}</Typography>
                      <Typography variant="caption" color="text.secondary">{ajuste.hora}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{ajuste.producto.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{ajuste.producto.codigo}</Typography>
                    </TableCell>
                    <TableCell align="center">{ajuste.cantidadAnterior}</TableCell>
                    <TableCell align="center">{ajuste.cantidadNueva}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${ajuste.diferencia > 0 ? '+' : ''}${ajuste.diferencia}`}
                        size="small"
                        color={ajuste.diferencia > 0 ? 'success' : 'error'}
                        icon={ajuste.diferencia > 0 ? <TrendingUp /> : <TrendingDown />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMotivoLabel(ajuste.motivo)}
                        size="small"
                        color={getMotivoColor(ajuste.motivo) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ajuste.observacion || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ajuste.creadoPor.nombre}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar ajuste">
                        <IconButton size="small" color="error" onClick={() => handleEliminarAjuste(ajuste.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de nuevo ajuste */}
      <Dialog open={openDialog} onClose={() => !saving && setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Nuevo Ajuste de Inventario</Typography>
            <IconButton onClick={() => !saving && setOpenDialog(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
            <Step><StepLabel>Seleccionar Producto</StepLabel></Step>
            <Step><StepLabel>Ingresar Datos</StepLabel></Step>
            <Step><StepLabel>Confirmar</StepLabel></Step>
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {activeStep === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Selecciona el producto a ajustar</Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                {productos.map(p => (
                  <Card key={p.id} sx={{ mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => handleSelectProducto(p)}>
                    <CardContent sx={{ py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{p.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.codigo}</Typography>
                      </Box>
                      <Chip label={`Stock: ${p.stockActual}`} size="small" />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {activeStep === 1 && selectedProducto && (
            <Box>
              <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>Producto seleccionado</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedProducto.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">Código: {selectedProducto.codigo}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <Chip label={`Stock actual: ${selectedProducto.stockActual}`} size="small" />
                    <Chip label={`Stock mínimo: ${selectedProducto.stockMinimo}`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>

              <TextField
                fullWidth
                label="Nueva cantidad"
                type="number"
                value={formData.nuevaCantidad}
                onChange={(e) => setFormData({ ...formData, nuevaCantidad: parseInt(e.target.value) || 0 })}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 0 } }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Motivo</InputLabel>
                <Select value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} label="Motivo">
                  <MenuItem value="CORRECCION">Corrección de inventario</MenuItem>
                  <MenuItem value="MERMA">Merma / Pérdida</MenuItem>
                  <MenuItem value="SOBRANTE">Sobrante encontrado</MenuItem>
                  <MenuItem value="CADUCIDAD">Producto caducado</MenuItem>
                  <MenuItem value="ROTURA">Rotura / Daño</MenuItem>
                  <MenuItem value="OTRO">Otro</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Observación"
                value={formData.observacion}
                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                multiline
                rows={2}
                placeholder="Detalla el motivo del ajuste..."
              />

              {diferencia !== 0 && (
                <Alert severity={esAumento ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {esAumento ? `Se aumentarán ${diferencia} unidades` : `Se disminuirán ${Math.abs(diferencia)} unidades`}
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>¡Ajuste Completado!</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProducto?.nombre} - Stock actualizado de {selectedProducto?.stockActual} a {formData.nuevaCantidad} unidades
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {activeStep === 0 && (
            <Button variant="outlined" onClick={() => setOpenDialog(false)}>Cancelar</Button>
          )}
          {activeStep === 1 && (
            <>
              <Button variant="outlined" onClick={() => setActiveStep(0)}>Atrás</Button>
              <Button variant="contained" onClick={handleGuardarAjuste} disabled={saving}>
                {saving ? 'Guardando...' : 'Realizar Ajuste'}
              </Button>
            </>
          )}
          {activeStep === 2 && (
            <Button variant="contained" onClick={handleReset}>Nuevo Ajuste</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}