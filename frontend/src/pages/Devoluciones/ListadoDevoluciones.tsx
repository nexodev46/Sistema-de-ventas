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
  TextField,
  InputAdornment,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  MenuItem,
  Zoom,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material'
import {
  AssignmentReturn,
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  AttachMoney,
  Close,
  Delete,
  FilterList,
  Download,
  PictureAsPdf,
} from '@mui/icons-material'
import { devolucionService } from '../../services/devolucionService'
import { Devolucion } from '../../types/devolucion.types'
import { useNavigate } from 'react-router-dom'

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

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'COMPLETADA': return 'success'
    case 'APROBADA': return 'info'
    case 'PENDIENTE': return 'warning'
    case 'RECHAZADA': return 'error'
    default: return 'default'
  }
}

const getEstadoIcono = (estado: string) => {
  switch (estado) {
    case 'COMPLETADA': return <CheckCircle />
    case 'APROBADA': return <CheckCircle />
    case 'PENDIENTE': return <Pending />
    case 'RECHAZADA': return <Cancel />
    default: return <AssignmentReturn />
  }
}

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case 'COMPLETADA': return 'Completada'
    case 'APROBADA': return 'Aprobada'
    case 'PENDIENTE': return 'Pendiente'
    case 'RECHAZADA': return 'Rechazada'
    default: return estado
  }
}

export const ListadoDevoluciones = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([])
  const [filtered, setFiltered] = useState<Devolucion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [tabValue, setTabValue] = useState(0)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [devolucionToDelete, setDevolucionToDelete] = useState<Devolucion | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    totalReembolsado: 0,
    pendientes: 0,
    completadas: 0,
  })

  useEffect(() => {
    cargarDevoluciones()
  }, [])

  useEffect(() => {
    filtrarDevoluciones()
  }, [search, devoluciones, tabValue, filtroEstado])

  const cargarDevoluciones = async () => {
    setLoading(true)
    try {
      const data = await devolucionService.getAll()
      setDevoluciones(data)
      setFiltered(data)
      calcularEstadisticas(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = (data: Devolucion[]) => {
    setStats({
      total: data.length,
      totalReembolsado: data.reduce((sum, d) => sum + (d.estado === 'COMPLETADA' ? d.subtotal : 0), 0),
      pendientes: data.filter(d => d.estado === 'PENDIENTE').length,
      completadas: data.filter(d => d.estado === 'COMPLETADA').length,
    })
  }

  const filtrarDevoluciones = () => {
    let result = [...devoluciones]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(d =>
        d.numero.toLowerCase().includes(term) ||
        d.cliente.nombre.toLowerCase().includes(term) ||
        d.cliente.documento.includes(term)
      )
    }

    if (filtroEstado) {
      result = result.filter(d => d.estado === filtroEstado)
    }

    const hoy = new Date().toISOString().split('T')[0]
    const mes = new Date()
    mes.setDate(1)

    switch (tabValue) {
      case 1:
        result = result.filter(d => d.fecha === hoy)
        break
      case 2:
        result = result.filter(d => d.fecha >= mes.toISOString().split('T')[0])
        break
      default:
        break
    }

    setFiltered(result)
    setPage(0)
  }

  const handleView = (id: string) => navigate(`/devoluciones/${id}`)

  const handleDelete = (devolucion: Devolucion) => {
    setDevolucionToDelete(devolucion)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!devolucionToDelete) return
    setDeleting(true)
    try {
      await devolucionService.deleteDevolucion(devolucionToDelete.id)
      await cargarDevoluciones()
      setDeleteDialogOpen(false)
      setDevolucionToDelete(null)
    } catch (error) {
      console.error('Error eliminando devolución:', error)
      alert('No se pudo eliminar la devolución. Intenta de nuevo.')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setDevolucionToDelete(null)
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Devoluciones
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gestión de devoluciones y reembolsos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AssignmentReturn />}
            onClick={() => navigate('/devoluciones/nueva')}
            sx={{
              bgcolor: 'white',
              color: theme.palette.error.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nueva Devolución
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Devoluciones" value={stats.total} icon={<AssignmentReturn />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Reembolsado" value={stats.totalReembolsado} prefix="S/ " icon={<AttachMoney />} color={theme.palette.warning.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pendientes" value={stats.pendientes} icon={<Pending />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completadas" value={stats.completadas} icon={<CheckCircle />} color={theme.palette.success.main} delay={400} />
        </Grid>
      </Grid>

      {/* Filtros y búsqueda */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Todas" />
          <Tab label="Hoy" />
          <Tab label="Este mes" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por #devolución, cliente o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
          />
          <Button variant="outlined" startIcon={<FilterList />} onClick={() => setOpenFilterDialog(true)}>
            Filtrar
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdf />}>PDF</Button>
          <Button variant="outlined" startIcon={<Download />}>Excel</Button>
        </Box>
      </Paper>

      {/* Resumen de filtros */}
      {(filtroEstado || search || tabValue !== 0) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">Filtros activos:</Typography>
          {tabValue !== 0 && <Chip label={tabValue === 1 ? 'Hoy' : 'Este mes'} size="small" onDelete={() => setTabValue(0)} />}
          {filtroEstado && <Chip label={`Estado: ${getEstadoLabel(filtroEstado)}`} size="small" onDelete={() => setFiltroEstado('')} />}
          {search && <Chip label={`Búsqueda: ${search}`} size="small" onDelete={() => setSearch('')} />}
        </Box>
      )}

      {/* Tabla de devoluciones */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.error.main, 0.08) }}>
                <TableCell>N° Devolución</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Venta Original</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <AssignmentReturn sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No hay devoluciones registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Cuando un cliente devuelva un producto, registra la devolución aquí
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AssignmentReturn />}
                      onClick={() => navigate('/devoluciones/nueva')}
                    >
                      Registrar Devolución
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((devolucion, idx) => (
                  <TableRow key={devolucion.id} hover>
                    <TableCell>
                      <Chip label={devolucion.numero} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{devolucion.fecha}</Typography>
                      <Typography variant="caption" color="text.secondary">{devolucion.hora}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.error.main, 0.1), fontSize: 12 }}>
                          {devolucion.cliente.nombre.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{devolucion.cliente.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">{devolucion.cliente.documento}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{devolucion.ventaOriginal.numero}</Typography>
                      <Typography variant="caption" color="text.secondary">{devolucion.ventaOriginal.fecha}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                        S/ {devolucion.subtotal.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getEstadoIcono(devolucion.estado)}
                        label={getEstadoLabel(devolucion.estado)}
                        size="small"
                        color={getEstadoColor(devolucion.estado) as any}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" onClick={() => handleView(devolucion.id)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar devolución">
                          <IconButton size="small" onClick={() => handleDelete(devolucion)} sx={{ color: theme.palette.error.main }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Devoluciones por página"
        />
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar devolución</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Seguro que deseas eliminar la devolución <strong>{devolucionToDelete?.numero}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción eliminará permanentemente el registro del historial.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de filtros */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filtrar Devoluciones
          <IconButton onClick={() => setOpenFilterDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} label="Estado">
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="APROBADA">Aprobada</MenuItem>
              <MenuItem value="COMPLETADA">Completada</MenuItem>
              <MenuItem value="RECHAZADA">Rechazada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setFiltroEstado(''); setOpenFilterDialog(false); }}>Limpiar</Button>
          <Button variant="contained" onClick={() => setOpenFilterDialog(false)}>Aplicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}