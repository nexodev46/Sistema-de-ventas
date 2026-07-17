import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton as MuiIconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Search,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Payment,
  Close,
  CheckCircle,
  Print,
  Receipt,
  LocalOffer,
  Person,
  QrCode,
  AttachMoney,
  CreditCard,
  WhatsApp,
  Email,
} from '@mui/icons-material'
import { productoService } from '../../services/productoService'
import { clienteService } from '../../services/clienteService'
import { ventaService } from '../../services/ventaService'
import { useAuth } from '../../contexts/AuthContext'
import { Producto } from '../../types/producto.types'
import { Cliente } from '../../types/cliente.types'
import { isValidImageUrl } from '../../utils/validators'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductoVenta {
  id: string
  codigo: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
  stock: number
  imagen?: string
}

const metodosPago = [
  { id: 'EFECTIVO', nombre: 'Efectivo', icono: <AttachMoney />, color: '#10b981' },
  { id: 'TARJETA', nombre: 'Tarjeta', icono: <CreditCard />, color: '#3b82f6' },
  { id: 'YAPE', nombre: 'Yape', icono: <QrCode />, color: '#8b5cf6' },
  { id: 'PLIN', nombre: 'Plin', icono: <QrCode />, color: '#06b6d4' },
  { id: 'TRANSFERENCIA', nombre: 'Transferencia', icono: <Receipt />, color: '#f59e0b' },
]

export const PuntoVenta = () => {
  const theme = useTheme()
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ProductoVenta[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [searchCliente, setSearchCliente] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [openClienteDialog, setOpenClienteDialog] = useState(false)
  const [openPagoDialog, setOpenPagoDialog] = useState(false)
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [montoRecibido, setMontoRecibido] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [success, setSuccess] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubProductos = productoService.subscribeAll((data) => {
      setProductos(data)
      setFilteredProductos(data)
    }, console.error)

    const unsubClientes = clienteService.subscribeAll((data) => {
      setClientes(data)
    }, console.error)

    return () => {
      unsubProductos()
      unsubClientes()
    }
  }, [])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    setFilteredProductos(
      productos.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term)
      )
    )
  }, [searchTerm, productos])

  const displayedProductos = filteredProductos.filter((producto) => {
    if (tabValue === 1) return producto.destacado
    if (tabValue === 2) return producto.oferta
    return true
  })

  const agregarAlCarrito = (producto: Producto) => {
    const existing = carrito.find(p => p.id === producto.id)
    const cantidadNueva = selectedProducto ? cantidad : 1

    if (existing) {
      if (existing.cantidad + cantidadNueva > producto.stockActual) {
        alert(`Stock insuficiente. Solo hay ${producto.stockActual} unidades`)
        return
      }
      setCarrito(carrito.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad + cantidadNueva, subtotal: (p.cantidad + cantidadNueva) * p.precio }
          : p
      ))
    } else {
      if (cantidadNueva > producto.stockActual) {
        alert(`Stock insuficiente. Solo hay ${producto.stockActual} unidades`)
        return
      }
      setCarrito([...carrito, {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precioVenta,
        cantidad: cantidadNueva,
        subtotal: producto.precioVenta * cantidadNueva,
        stock: producto.stockActual,
        imagen: producto.imagenes?.[0],
      }])
    }
    setSelectedProducto(null)
    setCantidad(1)
    inputRef.current?.focus()
  }

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    const producto = carrito.find(p => p.id === id)
    const productoOriginal = productos.find(p => p.id === id)
    if (producto && productoOriginal) {
      if (nuevaCantidad > productoOriginal.stockActual) {
        alert(`Stock insuficiente. Solo hay ${productoOriginal.stockActual} unidades`)
        return
      }
      if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id)
      } else {
        setCarrito(carrito.map(p =>
          p.id === id
            ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio }
            : p
        ))
      }
    }
  }

  const eliminarDelCarrito = (id: string) => {
    setCarrito(carrito.filter(p => p.id !== id))
  }

  const subtotal = carrito.reduce((sum, p) => sum + p.subtotal, 0)
  const total = subtotal
  const cambio = montoRecibido - total

  const handleConfirmarVenta = async () => {
    if (carrito.length === 0) {
      alert('Agrega productos al carrito')
      return
    }
    setOpenPagoDialog(true)
  }

  const { user } = useAuth()

  const handleProcesarVenta = async () => {
    setLoading(true)
    try {
      const fecha = new Date()
      const ventaData = {
        numero: `V-${fecha.getTime()}`,
        fecha: fecha.toISOString().split('T')[0],
        hora: fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        cliente: cliente ? {
          id: cliente.id,
          nombre: cliente.nombre,
          documento: cliente.documento,
        } : {
          id: 'general',
          nombre: 'Cliente general',
          documento: '00000000',
        },
        productos: carrito.map(item => ({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          subtotal: item.subtotal,
          imagen: item.imagen,
        })),
        subtotal,
        igv: 0,
        total,
        metodoPago: metodoPago as 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA',
        estado: 'COMPLETADA' as const,
        vendedor: user ? { id: user.id, nombre: user.nombre } : { id: 'desconocido', nombre: 'Vendedor desconocido' },
      }

      await ventaService.create(ventaData)

      for (const item of carrito) {
        await productoService.updateStock(item.id, item.cantidad, 'decrementar')
      }

      setSuccess('Venta completada exitosamente')
      setOpenPagoDialog(false)
      setCarrito([])
      setCliente(null)
      setMontoRecibido(0)
      setMetodoPago('EFECTIVO')

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error procesando venta:', error)
      alert('Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  const handleImprimirTicket = () => {
    window.print()
  }

  const clienteSeleccionado = clientes.find(c => c.id === cliente?.id)

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          p: 3,
          mb: 3,
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Punto de Venta
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Registra ventas de forma rápida y sencilla
        </Typography>
      </Box>

      {success && (
        <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel izquierdo - Productos */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <TextField
              fullWidth
              autoFocus
              inputRef={inputRef}
              placeholder="Buscar producto por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Paper>

          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
              <Tab label="Todos" />
              <Tab label="Destacados" />
              <Tab label="Ofertas" />
            </Tabs>
            <Divider />

            <Box sx={{ p: 2, maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
              <Grid container spacing={2}>
                {displayedProductos.map((producto, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={producto.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                          position: 'relative',
                          overflow: 'visible',
                        }}
                        onClick={() => agregarAlCarrito(producto)}
                      >
                        {producto.stockActual <= producto.stockMinimo && (
                          <Chip
                            label={producto.stockActual === 0 ? 'Agotado' : 'Stock bajo'}
                            size="small"
                            color={producto.stockActual === 0 ? 'error' : 'warning'}
                            sx={{ position: 'absolute', top: -8, right: 8, zIndex: 1 }}
                          />
                        )}
                        <CardMedia
                          component="img"
                          image={isValidImageUrl(producto.imagenes?.[0]) ? producto.imagenes?.[0] : 'https://via.placeholder.com/200x120?text=Producto'}
                          alt={producto.nombre}
                          crossOrigin="anonymous"
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 200,
                            objectFit: 'contain',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          }}
                        />
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            {producto.codigo}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {producto.nombre}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              S/ {producto.precioVenta.toFixed(2)}
                            </Typography>
                            <Chip
                              label={`Stock: ${producto.stockActual}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Panel derecho - Carrito */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 20 }}>
            {/* Cliente */}
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" /> Cliente
                </Typography>
                <Button size="small" onClick={() => setOpenClienteDialog(true)}>
                  {cliente ? 'Cambiar' : 'Seleccionar'}
                </Button>
              </Box>
              {cliente ? (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{cliente.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{cliente.documento}</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Cliente general
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Tabla del carrito */}
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Cant</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {carrito.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Carrito vacío
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      carrito.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 150 }}>
                              {item.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.codigo}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton size="small" onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography variant="body2" sx={{ mx: 1, minWidth: 30, textAlign: 'center' }}>
                                {item.cantidad}
                              </Typography>
                              <IconButton size="small" onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">S/ {item.precio.toFixed(2)}</TableCell>
                          <TableCell align="right">S/ {item.subtotal.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => eliminarDelCarrito(item.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Divider />

            {/* Totales */}
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Total</Typography>
                <Typography variant="body2">S/ {total.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  S/ {total.toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Payment />}
                onClick={handleConfirmarVenta}
                disabled={carrito.length === 0}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Cobrar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de selección de cliente */}
      <Dialog open={openClienteDialog} onClose={() => setOpenClienteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Seleccionar Cliente
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenClienteDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Buscar cliente por nombre o documento..."
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {clientes.filter(c => 
              c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
              c.documento.includes(searchCliente)
            ).map(c => (
              <Card key={c.id} sx={{ mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => { setCliente(c); setOpenClienteDialog(false); }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="body2" fontWeight="bold">{c.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.documento} | {c.telefono}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCliente(null); setOpenClienteDialog(false); }}>Cliente general</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de pago */}
      <Dialog open={openPagoDialog} onClose={() => setOpenPagoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment /> Completar Venta
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Resumen</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Productos ({carrito.length})</Typography>
              <Typography variant="body2">S/ {subtotal.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Total a pagar</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">S/ {total.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Typography variant="subtitle2" gutterBottom>Método de pago</Typography>
          <RadioGroup value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} row sx={{ mb: 2 }}>
            {metodosPago.map(mp => (
              <FormControlLabel
                key={mp.id}
                value={mp.id}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {mp.icono}
                    <Typography variant="body2">{mp.nombre}</Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>

          {metodoPago === 'EFECTIVO' && (
            <TextField
              fullWidth
              label="Monto recibido"
              type="number"
              value={montoRecibido}
              onChange={(e) => setMontoRecibido(parseFloat(e.target.value) || 0)}
              InputProps={{ startAdornment: <InputAdornment position="start">S/</InputAdornment> }}
              sx={{ mt: 2 }}
            />
          )}

          {metodoPago === 'EFECTIVO' && montoRecibido >= total && (
            <Alert icon={<AttachMoney />} severity="success" sx={{ mt: 2 }}>
              Cambio: S/ {cambio.toFixed(2)}
            </Alert>
          )}

          {metodoPago !== 'EFECTIVO' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              El pago se procesará con {metodosPago.find(mp => mp.id === metodoPago)?.nombre}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setOpenPagoDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleProcesarVenta}
            disabled={loading || (metodoPago === 'EFECTIVO' && montoRecibido < total)}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirmar Venta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}