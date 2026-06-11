import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  ShoppingCart,
  LocalShipping,
  Image as ImageIcon,
} from '@mui/icons-material'
import { productoService } from '../../../services/productoService'
import { Producto } from '../../../types/producto.types'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export const InventarioGeneral = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtered, setFiltered] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsubscribe = productoService.subscribeAll((data) => {
      setProductos(data)
      setFiltered(data)
      setLoading(false)
    }, console.error)

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(term ? productos.filter(p => p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)) : productos)
  }, [search, productos])

  // Estadísticas
  const totalProductos = productos.length
  const totalStock = productos.reduce((sum, p) => sum + p.stockActual, 0)
  const totalValorInventario = productos.reduce((sum, p) => sum + (p.precioCompra * p.stockActual), 0)
  const productosBajoStock = productos.filter(p => p.stockActual <= p.stockMinimo).length
  const productosAgotados = productos.filter(p => p.stockActual === 0).length
  const productosEnStock = productos.filter(p => p.stockActual > 0).length

  const porcentajeStock = totalProductos > 0 ? (productosEnStock / totalProductos) * 100 : 0

  const getStockStatus = (producto: Producto) => {
    if (producto.stockActual === 0) return { label: 'Agotado', color: 'error', icon: <WarningIcon /> }
    if (producto.stockActual <= producto.stockMinimo) return { label: 'Stock bajo', color: 'warning', icon: <WarningIcon /> }
    return { label: 'En stock', color: 'success', icon: <CheckCircleIcon /> }
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
          Inventario
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Control de stock y movimientos de productos
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Productos</Typography>
                    <Typography variant="h3" fontWeight="bold">{totalProductos}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                    <InventoryIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Unidades en Stock</Typography>
                    <Typography variant="h3" fontWeight="bold">{totalStock}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
                    <ShoppingCart />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Stock Bajo / Agotado</Typography>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {productosBajoStock + productosAgotados}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {productosAgotados} agotados | {productosBajoStock} bajo stock
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 48, height: 48 }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Valor del Inventario</Typography>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      S/ {totalValorInventario.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
                    <LocalShipping />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Barra de progreso de stock */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Salud del Inventario
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={porcentajeStock}
              sx={{ height: 10, borderRadius: 5, bgcolor: alpha(theme.palette.error.main, 0.2) }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {productosEnStock} de {totalProductos} productos con stock
          </Typography>
        </Box>
      </Card>

      {/* Botones de acción rápida */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => navigate('/entradas')}
            sx={{ py: 1.5, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})` }}
          >
            Registrar Entrada
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/salidas')}
            sx={{ py: 1.5, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})` }}
          >
            Registrar Salida
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/movimientos')}
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            Historial de Movimientos
          </Button>
        </Grid>
      </Grid>

      {/* Listado de productos */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Productos en Inventario
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar producto por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell>Imagen</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="center">Stock Actual</TableCell>
              <TableCell align="center">Stock Mínimo</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Valor Unitario</TableCell>
              <TableCell align="center">Valor Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay productos registrados en el inventario
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((producto) => {
                const status = getStockStatus(producto)
                const valorTotal = producto.precioCompra * producto.stockActual
                return (
                  <TableRow key={producto.id} hover>
                    <TableCell>
                      <Avatar
                        src={producto.imagenes?.[0] ?? producto.imagenUrl}
                        alt={producto.nombre}
                        variant="rounded"
                        sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      >
                        {!producto.imagenes?.[0] && !producto.imagenUrl ? <ImageIcon fontSize="small" /> : null}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Chip label={producto.codigo} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {producto.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>{producto.categoria || '-'}</TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ color: status.label === 'Agotado' ? 'error.main' : status.label === 'Stock bajo' ? 'warning.main' : 'success.main' }}
                      >
                        {producto.stockActual}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {producto.stockMinimo}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        size="small"
                        color={status.color as any}
                      />
                    </TableCell>
                    <TableCell align="center">
                      S/ {producto.precioCompra.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold" color="primary.main">
                        S/ {valorTotal.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}