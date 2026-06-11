import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Zoom,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material'
import {
  Save,
  ArrowBack,
  Inventory,
  Remove,
  CheckCircle,
  Warning,
  Person,
  Note,
  Refresh,
  Receipt,
  ShoppingCart,
  Upload as UploadIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { productoService } from '../../../services/productoService'
import { inventarioService } from '../../../services/inventarioService'
import { Producto } from '../../../types/producto.types'
import { motion } from 'framer-motion'

// Componente de tarjeta de resumen
const SummaryCard = ({ title, value, icon, color, prefix = '', suffix = '' }: any) => {
  const theme = useTheme()
  return (
    <Zoom in>
      <Card sx={{ borderRadius: 2, bgcolor: alpha(color, 0.1), borderLeft: 4, borderColor: color }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">{title}</Typography>
              <Typography variant="h6" fontWeight="bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.2), width: 40, height: 40 }}>{icon}</Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  )
}

// Componente de alerta de stock bajo
const LowStockAlert = ({ stock, minStock }: { stock: number; minStock: number }) => {
  if (stock === 0) {
    return (
      <Chip
        icon={<Warning />}
        label="Producto AGOTADO - No se puede retirar"
        color="error"
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    )
  }
  if (stock <= minStock) {
    return (
      <Chip
        icon={<Warning />}
        label={`Stock BAJO (${stock} unidades) - Stock mínimo: ${minStock}`}
        color="warning"
        size="small"
      />
    )
  }
  return null
}

export const Salidas = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productoIdParam = queryParams.get('producto')

  const [productos, setProductos] = useState<Producto[]>([])
  const [selectedProducto, setSelectedProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState('venta')
  const [observacion, setObservacion] = useState('')
  const [cliente, setCliente] = useState('')
  const [precioVenta, setPrecioVenta] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    if (productoIdParam && productos.length > 0) {
      setSelectedProducto(productoIdParam)
      const producto = productos.find(p => p.id === productoIdParam)
      if (producto) {
        setPrecioVenta(producto.precioVenta)
      }
    }
  }, [productoIdParam, productos])

  const cargarProductos = async () => {
    setLoading(true)
    try {
      const data = await productoService.getAll()
      setProductos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const productoSeleccionado = productos.find(p => p.id === selectedProducto)
  const valorTotal = cantidad * precioVenta
  const stockActual = productoSeleccionado?.stockActual || 0
  const stockDespues = stockActual - cantidad
  const isStockSuficiente = cantidad <= stockActual && stockActual > 0

  const handleProductoChange = (productoId: string) => {
    setSelectedProducto(productoId)
    const producto = productos.find(p => p.id === productoId)
    if (producto) {
      setPrecioVenta(producto.precioVenta)
      setCantidad(1)
    }
    setActiveStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProducto) {
      setError('Selecciona un producto')
      return
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }
    if (cantidad > stockActual) {
      setError(`Stock insuficiente. Solo hay ${stockActual} unidades disponibles`)
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const stockAntes = stockActual
      await productoService.updateStock(selectedProducto, cantidad, 'decrementar')
      await inventarioService.registrarMovimiento({
        productoId: selectedProducto,
        productoNombre: productoSeleccionado?.nombre ?? '',
        tipo: 'salida',
        cantidad,
        motivo,
        observacion,
        cliente,
        precioUnitario: precioVenta,
        stockAntes,
        stockDespues: stockAntes - cantidad,
        registradoEn: new Date().toISOString(),
      })
      setSuccess(`✅ Se retiraron ${cantidad} unidades de ${productoSeleccionado?.nombre}`)
      setActiveStep(2)
      setTimeout(() => {
        navigate('/inventario')
      }, 2000)
    } catch (error) {
      setError('Error al registrar la salida')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSelectedProducto('')
    setCantidad(1)
    setMotivo('venta')
    setObservacion('')
    setCliente('')
    setPrecioVenta(0)
    setError('')
    setSuccess('')
    setActiveStep(0)
  }

  const steps = ['Seleccionar Producto', 'Ingresar Detalles', 'Confirmar Salida']

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
          background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/inventario')}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Volver
              </Button>
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Registrar Salida de Stock
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Retira unidades del inventario por ventas, devoluciones o mermas
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
            <UploadIcon sx={{ fontSize: 40 }} />
          </Avatar>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Formulario principal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel StepIconProps={{ active: activeStep >= index, completed: activeStep > index }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Fade in>
                <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
                  {success}
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleSubmit}>
              {/* Paso 1: Seleccionar Producto */}
              {activeStep === 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Inventory color="warning" /> Seleccionar Producto
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <FormControl fullWidth required>
                    <InputLabel>Producto *</InputLabel>
                    <Select
                      value={selectedProducto}
                      onChange={(e) => handleProductoChange(e.target.value)}
                      label="Producto *"
                    >
                      {productos.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span>{p.nombre}</span>
                            <span style={{ color: p.stockActual === 0 ? '#f44336' : p.stockActual <= p.stockMinimo ? '#ff9800' : '#4caf50', fontSize: '0.8rem' }}>
                              Stock: {p.stockActual} | S/ {p.precioVenta}
                            </span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => selectedProducto && setActiveStep(1)}
                      disabled={!selectedProducto}
                      sx={{ borderRadius: 2 }}
                    >
                      Continuar
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Paso 2: Ingresar Detalles */}
              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Note color="warning" /> Detalles de la Salida
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {/* Información del producto */}
                  {productoSeleccionado && (
                    <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="warning.main" gutterBottom>
                          Producto seleccionado
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Código</Typography>
                            <Typography variant="body2" fontWeight="bold">{productoSeleccionado.codigo}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Nombre</Typography>
                            <Typography variant="body2" fontWeight="bold">{productoSeleccionado.nombre}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Stock actual</Typography>
                            <Chip 
                              label={`${productoSeleccionado.stockActual} unidades`} 
                              size="small" 
                              color={productoSeleccionado.stockActual === 0 ? 'error' : productoSeleccionado.stockActual <= productoSeleccionado.stockMinimo ? 'warning' : 'success'} 
                            />
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Stock mínimo</Typography>
                            <Typography variant="body2">{productoSeleccionado.stockMinimo} unidades</Typography>
                          </Grid>
                        </Grid>
                        
                        {/* Alerta de stock bajo */}
                        <Box sx={{ mt: 2 }}>
                          <LowStockAlert stock={stockActual} minStock={productoSeleccionado.stockMinimo} />
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Cantidad a retirar *"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, Math.min(parseInt(e.target.value) || 0, stockActual)))}
                        required
                        error={cantidad > stockActual}
                        helperText={cantidad > stockActual ? `Máximo disponible: ${stockActual} unidades` : `Disponible: ${stockActual} unidades`}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Remove /></InputAdornment>,
                          inputProps: { min: 1, max: stockActual },
                        }}
                      />
                      {stockActual > 0 && (
                        <LinearProgress 
                          variant="determinate" 
                          value={(cantidad / stockActual) * 100} 
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          color={cantidad > stockActual ? 'error' : 'warning'}
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Precio de venta (S/)"
                        type="number"
                        value={precioVenta}
                        onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Motivo</InputLabel>
                        <Select value={motivo} onChange={(e) => setMotivo(e.target.value)} label="Motivo">
                          <MenuItem value="venta">🛒 Venta</MenuItem>
                          <MenuItem value="devolucion">🔄 Devolución a proveedor</MenuItem>
                          <MenuItem value="merma">⚠️ Merma / Pérdida</MenuItem>
                          <MenuItem value="ajuste">⚙️ Ajuste de inventario</MenuItem>
                          <MenuItem value="muestra">🎁 Muestra / Donación</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Cliente (opcional)"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        placeholder="Nombre del cliente"
                        InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Observación"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Notas adicionales sobre esta salida (factura, motivo, responsable...)"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" onClick={() => setActiveStep(0)}>
                      Atrás
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="warning"
                      startIcon={<Save />} 
                      disabled={saving || !isStockSuficiente}
                    >
                      {saving ? 'Registrando...' : 'Registrar Salida'}
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Paso 3: Confirmación */}
              {activeStep === 2 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      ¡Salida Registrada!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Se retiraron {cantidad} unidades de {productoSeleccionado?.nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      Stock restante: <strong>{stockDespues}</strong> unidades
                      {stockDespues <= (productoSeleccionado?.stockMinimo || 0) && (
                        <Chip icon={<Warning />} label="Stock bajo" size="small" color="warning" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Button variant="contained" color="warning" onClick={handleReset} startIcon={<Refresh />}>
                      Registrar otra salida
                    </Button>
                  </Box>
                </motion.div>
              )}
            </form>
          </Paper>
        </Grid>

        {/* Sidebar informativo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 3, mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt /> Resumen de Salida
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Producto:</Typography>
              <Typography variant="body2" fontWeight="bold">{productoSeleccionado?.nombre || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Cantidad:</Typography>
              <Typography variant="body2" fontWeight="bold">{cantidad} unidades</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">Precio unitario:</Typography>
              <Typography variant="body2">S/ {precioVenta.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Valor total:</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">S/ {valorTotal.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Stock después:</Typography>
              <Typography variant="body2" fontWeight="bold" color={stockDespues <= 0 ? 'error.main' : stockDespues <= (productoSeleccionado?.stockMinimo || 0) ? 'warning.main' : 'success.main'}>
                {stockDespues} unidades
              </Typography>
            </Box>
          </Card>

          {/* Tarjetas de estadísticas */}
          <SummaryCard title="Total Productos" value={productos.length} icon={<Inventory />} color={theme.palette.primary.main} />
          <Box sx={{ mt: 2 }}>
            <SummaryCard title="Stock total actual" value={productos.reduce((sum, p) => sum + p.stockActual, 0)} icon={<ShoppingCart />} color={theme.palette.info.main} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <SummaryCard title="Productos con stock bajo" value={productos.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0).length} icon={<Warning />} color={theme.palette.warning.main} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}