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
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  useTheme,
} from '@mui/material'
import {
  ArrowBack,
  Save,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ventaService } from '../../services/ventaService'
import { devolucionService } from '../../services/devolucionService'
import { Venta } from '../../types/venta.types'
import { ProductoDevuelto } from '../../types/devolucion.types'

const metodosReembolso = [
  { id: 'EFECTIVO', label: 'Efectivo' },
  { id: 'TARJETA', label: 'Tarjeta' },
  { id: 'YAPE', label: 'Yape' },
  { id: 'PLIN', label: 'Plin' },
  { id: 'TRANSFERENCIA', label: 'Transferencia' },
]

export const NuevaDevolucion = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [selectedVentaId, setSelectedVentaId] = useState('')
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [productosDevueltos, setProductosDevueltos] = useState<ProductoDevuelto[]>([])
  const [tipoDevolucion, setTipoDevolucion] = useState<'PARCIAL' | 'TOTAL'>('PARCIAL')
  const [motivoGeneral, setMotivoGeneral] = useState('')
  const [metodoReembolso, setMetodoReembolso] = useState<'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'>('EFECTIVO')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        setLoading(true)
        const data = await ventaService.getAll()
        setVentas(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargarVentas()
  }, [])

  useEffect(() => {
    const venta = ventas.find(v => v.id === selectedVentaId) || null
    setSelectedVenta(venta)
    if (!venta) {
      setProductosDevueltos([])
      return
    }

    const productos = venta.productos.map(item => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      cantidad: tipoDevolucion === 'TOTAL' ? item.cantidad : 0,
      precio: item.precio,
      subtotal: tipoDevolucion === 'TOTAL' ? item.subtotal : 0,
      motivo: '',
    }))

    setProductosDevueltos(productos)
  }, [selectedVentaId, ventas, tipoDevolucion])

  const handleCantidadChange = (id: string, value: number) => {
    if (!selectedVenta) return
    setProductosDevueltos(prev => prev.map(item => {
      if (item.id !== id) return item
      const ventaProducto = selectedVenta.productos.find(p => p.id === id)
      const cantidad = Math.min(Math.max(value, 0), ventaProducto?.cantidad ?? 0)
      return {
        ...item,
        cantidad,
        subtotal: cantidad * item.precio,
      }
    }))
  }

  const handleMotivoProducto = (id: string, text: string) => {
    setProductosDevueltos(prev => prev.map(item => item.id === id ? { ...item, motivo: text } : item))
  }

  const total = productosDevueltos.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async () => {
    setError('')
    if (!selectedVenta) {
      setError('Selecciona una venta válida para registrar la devolución.')
      return
    }

    const productos = productosDevueltos.filter(item => item.cantidad > 0)
    if (productos.length === 0) {
      setError('Debes seleccionar al menos un producto para la devolución.')
      return
    }

    if (!motivoGeneral.trim()) {
      setError('Ingresa el motivo general de la devolución.')
      return
    }

    try {
      setLoading(true)
      const fecha = new Date()
      const devolucionData = {
        numero: `D-${fecha.getTime()}`,
        fecha: fecha.toISOString().split('T')[0],
        hora: fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        ventaOriginal: {
          id: selectedVenta.id,
          numero: selectedVenta.numero,
          fecha: selectedVenta.fecha,
        },
        cliente: {
          id: selectedVenta.cliente.id,
          nombre: selectedVenta.cliente.nombre,
          documento: selectedVenta.cliente.documento,
        },
        productos,
        subtotal: total,
        motivoGeneral,
        estado: 'PENDIENTE' as const,
        tipoDevolucion,
        metodoReembolso,
        observaciones,
        creadoPor: {
          id: user?.id ?? 'desconocido',
          nombre: user?.nombre ?? 'Sistema',
        },
        creadoEn: fecha.toISOString(),
      }

      await devolucionService.create(devolucionData)
      setSuccess('Devolución registrada correctamente.')
      setTimeout(() => navigate('/devoluciones'), 1200)
    } catch (err) {
      console.error(err)
      setError('No se pudo registrar la devolución. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Nueva Devolución
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Registra devoluciones vinculadas a una venta existente.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/devoluciones')}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Volver a Devoluciones
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Seleccionar Venta
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Venta</InputLabel>
              <Select
                value={selectedVentaId}
                label="Venta"
                onChange={(e) => setSelectedVentaId(e.target.value)}
              >
                <MenuItem value="">Selecciona una venta</MenuItem>
                {ventas.map((venta) => (
                  <MenuItem key={venta.id} value={venta.id}>
                    {venta.numero} - {venta.cliente.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Tipo de devolución</InputLabel>
              <Select
                value={tipoDevolucion}
                label="Tipo de devolución"
                onChange={(e) => setTipoDevolucion(e.target.value as 'PARCIAL' | 'TOTAL')}
              >
                <MenuItem value="PARCIAL">Parcial</MenuItem>
                <MenuItem value="TOTAL">Total</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Método de reembolso</InputLabel>
              <Select
                value={metodoReembolso}
                label="Método de reembolso"
                onChange={(e) => setMetodoReembolso(e.target.value as any)}
              >
                {metodosReembolso.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Motivo general"
              value={motivoGeneral}
              onChange={(e) => setMotivoGeneral(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 1 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Detalle de productos a devolver
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {!selectedVenta && (
              <Typography variant="body2" color="text.secondary">
                Selecciona primero una venta para ver los productos disponibles para devolución.
              </Typography>
            )}

            {selectedVenta && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Venta: {selectedVenta.numero}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {selectedVenta.cliente.nombre} · Documento: {selectedVenta.cliente.documento}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {selectedVenta.fecha} {selectedVenta.hora || ''}
                </Typography>
              </Box>
            )}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Cant. vendida</TableCell>
                    <TableCell align="center">Cant. devuelta</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosDevueltos.map((item) => {
                    const ventaProducto = selectedVenta?.productos.find(p => p.id === item.id)
                    const cantidadMax = ventaProducto?.cantidad ?? 0
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{item.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.codigo}</Typography>
                        </TableCell>
                        <TableCell align="center">{cantidadMax}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => handleCantidadChange(item.id, parseInt(e.target.value || '0', 10))}
                            inputProps={{ min: 0, max: cantidadMax }}
                            sx={{ width: 90 }}
                          />
                        </TableCell>
                        <TableCell align="right">S/ {item.precio.toFixed(2)}</TableCell>
                        <TableCell align="right">S/ {item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Typography variant="h6">Total devolución</Typography>
              <Typography variant="h5" fontWeight="bold">S/ {total.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/devoluciones')}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading || !selectedVentaId}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Registrar devolución'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
