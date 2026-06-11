import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import { ArrowBack, Download as DownloadIcon, Upload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { inventarioService } from '../../../services/inventarioService'
import { MovimientoInventario } from '../../../types/producto.types'

export const MovimientosInventario = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [movimientoAEliminar, setMovimientoAEliminar] = useState<MovimientoInventario | null>(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    const loadMovimientos = async () => {
      setLoading(true)
      try {
        const data = await inventarioService.getAllMovimientos()
        setMovimientos(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadMovimientos()
  }, [])

  const abrirDialogoEliminar = (movimiento: MovimientoInventario) => {
    setMovimientoAEliminar(movimiento)
    setOpenDialog(true)
  }

  const cerrarDialogo = () => {
    setOpenDialog(false)
    setMovimientoAEliminar(null)
  }

  const handleEliminar = async () => {
    if (!movimientoAEliminar?.id) return
    
    setEliminando(true)
    try {
      await inventarioService.eliminarMovimiento(movimientoAEliminar.id)
      setMovimientos(movimientos.filter(m => m.id !== movimientoAEliminar.id))
      cerrarDialogo()
    } catch (error) {
      console.error('Error al eliminar movimiento:', error)
    } finally {
      setEliminando(false)
    }
  }

  const totalEntradas = movimientos.filter((m) => m.tipo === 'entrada').reduce((sum, m) => sum + m.cantidad, 0)
  const totalSalidas = movimientos.filter((m) => m.tipo === 'salida').reduce((sum, m) => sum + m.cantidad, 0)

  return (
    <Box>
      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`, borderRadius: 4, p: 4, mb: 4, color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/inventario')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' } }}>
              Volver
            </Button>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Historial de Movimientos
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Revisa todas las entradas y salidas del inventario.
            </Typography>
          </Box>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.18)', p: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Movimientos totales</Typography>
              <Typography variant="h4" fontWeight="bold">{movimientos.length}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Entradas</Typography>
            <Typography variant="h4" fontWeight="bold">{totalEntradas}</Typography>
            <Chip icon={<DownloadIcon />} label="Entrada" color="success" sx={{ mt: 2 }} />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Salidas</Typography>
            <Typography variant="h4" fontWeight="bold">{totalSalidas}</Typography>
            <Chip icon={<UploadIcon />} label="Salida" color="warning" sx={{ mt: 2 }} />
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : movimientos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No hay movimientos registrados</Typography>
            <Typography variant="body2" color="text.secondary">Registra una entrada o salida para ver el historial.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Proveedor / Cliente</TableCell>
                  <TableCell align="center">Stock Antes</TableCell>
                  <TableCell align="center">Stock Después</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map((movimiento) => (
                  <TableRow key={movimiento.id} hover>
                    <TableCell>{new Date(movimiento.registradoEn).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'} color={movimiento.tipo === 'entrada' ? 'success' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>{movimiento.productoNombre}</TableCell>
                    <TableCell align="center">{movimiento.cantidad}</TableCell>
                    <TableCell>{movimiento.motivo}</TableCell>
                    <TableCell>{movimiento.proveedor || movimiento.cliente || '—'}</TableCell>
                    <TableCell align="center">{movimiento.stockAntes ?? '—'}</TableCell>
                    <TableCell align="center">{movimiento.stockDespues ?? '—'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => abrirDialogoEliminar(movimiento)}
                        title="Eliminar movimiento"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={cerrarDialogo}>
        <DialogTitle>Eliminar movimiento</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ¿Estás seguro de que deseas eliminar este movimiento?
          </Typography>
          {movimientoAEliminar && (
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Producto:</strong> {movimientoAEliminar.productoNombre}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <strong>Tipo:</strong> {movimientoAEliminar.tipo === 'entrada' ? 'Entrada' : 'Salida'}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <strong>Cantidad:</strong> {movimientoAEliminar.cantidad}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <strong>Fecha:</strong> {new Date(movimientoAEliminar.registradoEn).toLocaleString()}
              </Typography>
            </Box>
          )}
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
            ⚠️ Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo} disabled={eliminando}>
            Cancelar
          </Button>
          <Button
            onClick={handleEliminar}
            variant="contained"
            color="error"
            disabled={eliminando}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
