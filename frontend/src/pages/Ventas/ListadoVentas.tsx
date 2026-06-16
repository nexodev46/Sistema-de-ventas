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
  Badge,
  Divider,
} from '@mui/material'
import {
  Receipt,
  Search,
  Visibility,
  Print,
  PictureAsPdf,
  Download,
  FilterList,
  CalendarToday,
  AttachMoney,
  CreditCard,
  QrCode,
  TrendingUp,
  TrendingDown,
  Close,
  Delete,
  CheckCircle,
  Cancel,
  ShoppingBag,
  Timeline,
  PieChart as PieChartIcon,
} from '@mui/icons-material'
import { ventaService } from '../../services/ventaService'
import { Venta } from '../../types/venta.types'
import { useNavigate } from 'react-router-dom'
import { SkeletonTable } from '../../components/Common/SkeletonTable'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, prefix = '', suffix = '', trend = null, delay = 0 }: any) => {
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
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </Typography>
              {trend !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {trend >= 0 ? (
                    <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                  )}
                  <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                    {Math.abs(trend)}% vs período anterior
                  </Typography>
                </Box>
              )}
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

const metodoPagoIconos: Record<string, JSX.Element> = {
  EFECTIVO: <AttachMoney />,
  TARJETA: <CreditCard />,
  YAPE: <QrCode />,
  PLIN: <QrCode />,
  TRANSFERENCIA: <Receipt />,
}

const metodoPagoColores: Record<string, string> = {
  EFECTIVO: '#10b981',
  TARJETA: '#3b82f6',
  YAPE: '#8b5cf6',
  PLIN: '#06b6d4',
  TRANSFERENCIA: '#f59e0b',
}

export const ListadoVentas = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filtered, setFiltered] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [tabValue, setTabValue] = useState(0)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [showCharts, setShowCharts] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    totalHoy: 0,
    totalSemana: 0,
    totalMes: 0,
    totalAnio: 0,
    promedioVenta: 0,
    numeroVentas: 0,
    tendencia: 12.5,
  })

  // Datos para gráficos
  const [ventasPorDia, setVentasPorDia] = useState<any[]>([])
  const [ventasPorMetodo, setVentasPorMetodo] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = ventaService.subscribeAll((data) => {
      setVentas(data)
      setFiltered(data)
      calcularEstadisticas(data)
      generarDatosGraficos(data)
      setLoading(false)
    }, console.error)

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    filtrarVentas()
  }, [search, ventas, tabValue, filtroMetodo])

  const calcularEstadisticas = (ventasData: Venta[]) => {
    const hoy = new Date().toISOString().split('T')[0]
    const semana = new Date()
    semana.setDate(semana.getDate() - 7)
    const mes = new Date()
    mes.setDate(1)
    const anio = new Date().getFullYear()

    const ventasHoy = ventasData.filter(v => v.fecha === hoy)
    const ventasSemana = ventasData.filter(v => v.fecha >= semana.toISOString().split('T')[0])
    const ventasMes = ventasData.filter(v => v.fecha >= mes.toISOString().split('T')[0])
    const ventasAnio = ventasData.filter(v => new Date(v.fecha).getFullYear() === anio)

    setStats({
      totalHoy: ventasHoy.reduce((sum, v) => sum + v.total, 0),
      totalSemana: ventasSemana.reduce((sum, v) => sum + v.total, 0),
      totalMes: ventasMes.reduce((sum, v) => sum + v.total, 0),
      totalAnio: ventasAnio.reduce((sum, v) => sum + v.total, 0),
      promedioVenta: ventasData.length > 0 ? ventasData.reduce((sum, v) => sum + v.total, 0) / ventasData.length : 0,
      numeroVentas: ventasData.length,
      tendencia: 12.5,
    })
  }

  const generarDatosGraficos = (ventasData: Venta[]) => {
    // Ventas por día (últimos 7 días)
    const ultimos7Dias = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      const totalDia = ventasData.filter(v => v.fecha === fechaStr).reduce((sum, v) => sum + v.total, 0)
      ultimos7Dias.push({
        fecha: fecha.toLocaleDateString('es', { weekday: 'short' }),
        total: totalDia,
      })
    }
    setVentasPorDia(ultimos7Dias)

    // Ventas por método de pago
    const metodoMap = new Map<string, number>()
    ventasData.forEach(v => {
      metodoMap.set(v.metodoPago, (metodoMap.get(v.metodoPago) || 0) + v.total)
    })
    const metodoData = Array.from(metodoMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: metodoPagoColores[name] || '#888',
    }))
    setVentasPorMetodo(metodoData)
  }

  const filtrarVentas = () => {
    let result = [...ventas]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(v =>
        v.numero.toLowerCase().includes(term) ||
        v.cliente.nombre.toLowerCase().includes(term) ||
        v.cliente.documento.includes(term)
      )
    }

    if (filtroMetodo) {
      result = result.filter(v => v.metodoPago === filtroMetodo)
    }

    const hoy = new Date().toISOString().split('T')[0]
    const semana = new Date()
    semana.setDate(semana.getDate() - 7)
    const mes = new Date()
    mes.setDate(1)

    switch (tabValue) {
      case 1:
        result = result.filter(v => v.fecha === hoy)
        break
      case 2:
        result = result.filter(v => v.fecha >= semana.toISOString().split('T')[0])
        break
      case 3:
        result = result.filter(v => v.fecha >= mes.toISOString().split('T')[0])
        break
      default:
        break
    }

    setFiltered(result)
    setPage(0)
  }

  const handleView = (id: string) => navigate(`/ventas/${id}`)
  const handlePrint = (_venta: Venta) => window.print()
  const handleDelete = (venta: Venta) => {
    setVentaToDelete(venta)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!ventaToDelete) return
    setDeleting(true)
    try {
      await ventaService.deleteVenta(ventaToDelete.id)
      setDeleteDialogOpen(false)
      setVentaToDelete(null)
    } catch (error) {
      console.error('Error eliminando venta:', error)
      alert('No se pudo eliminar la venta. Intente nuevamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setVentaToDelete(null)
  }

  const handleOpenDetalle = (venta: Venta) => {
    setSelectedVenta(venta)
    setDetalleOpen(true)
  }

  const handleCloseDetalle = () => {
    setSelectedVenta(null)
    setDetalleOpen(false)
  }

  const getMetodoPagoIcono = (metodo: string) => metodoPagoIconos[metodo] || <Receipt />
  const getMetodoPagoColor = (metodo: string) => metodoPagoColores[metodo] || theme.palette.grey[500]

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            borderRadius: 4,
            p: 4,
            mb: 4,
            color: 'white',
            height: 120,
          }}
        />
        <SkeletonTable rows={8} columns={7} />
      </Box>
    )
  }

  const totalVentas = filtered.reduce((sum, v) => sum + v.total, 0)

  return (
    <Box>
      {/* Header con gradiente */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Ventas
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Historial de transacciones y reportes
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/punto-venta')}
            sx={{
              bgcolor: 'white',
              color: theme.palette.info.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nueva Venta
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ventas Hoy" value={stats.totalHoy} prefix="S/ " icon={<TrendingUp />} color={theme.palette.success.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ventas Semana" value={stats.totalSemana} prefix="S/ " icon={<CalendarToday />} color={theme.palette.primary.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ventas Mes" value={stats.totalMes} prefix="S/ " icon={<Timeline />} color={theme.palette.warning.main} delay={300} trend={stats.tendencia} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Promedio por Venta" value={stats.promedioVenta} prefix="S/ " icon={<AttachMoney />} color={theme.palette.info.main} delay={400} />
        </Grid>
      </Grid>

      {/* Gráficos */}
      {showCharts && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline /> Ventas Últimos 7 Días
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ventasPorDia}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="fecha" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} />
                  <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']} />
                  <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={2} fill="url(#colorVentas)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon /> Métodos de Pago
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ventasPorMetodo}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {ventasPorMetodo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Monto']} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filtros y búsqueda */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Todas" />
          <Tab label="Hoy" />
          <Tab label="Esta semana" />
          <Tab label="Este mes" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por #venta, cliente o documento..."
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
          <Button variant="outlined" startIcon={showCharts ? <Close /> : <Timeline />} onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? 'Ocultar gráficos' : 'Mostrar gráficos'}
          </Button>
        </Box>
      </Paper>

      {/* Resumen de filtros aplicados */}
      {(filtroMetodo || search || tabValue !== 0) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">Filtros activos:</Typography>
          {tabValue !== 0 && (
            <Chip label={tabValue === 1 ? 'Hoy' : tabValue === 2 ? 'Esta semana' : 'Este mes'} size="small" onDelete={() => setTabValue(0)} />
          )}
          {filtroMetodo && (
            <Chip label={filtroMetodo} size="small" onDelete={() => setFiltroMetodo('')} />
          )}
          {search && (
            <Chip label={`Búsqueda: ${search}`} size="small" onDelete={() => setSearch('')} />
          )}
          <Typography variant="caption" color="primary.main">
            Mostrando {filtered.length} de {ventas.length} ventas - Total: S/ {totalVentas.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Tabla de ventas */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <TableCell>N° Venta</TableCell>
                <TableCell>Fecha / Hora</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Método</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Receipt sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No hay ventas registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Comienza registrando tu primera venta en el Punto de Venta
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingBag />}
                      onClick={() => navigate('/punto-venta')}
                    >
                      Ir a Punto de Venta
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((venta, idx) => (
                  <TableRow key={venta.id} hover>
                    <TableCell>
                      <Badge badgeContent={idx + 1 + page * rowsPerPage} color="primary" sx={{ '& .MuiBadge-badge': { right: -20 } }}>
                        <Chip label={venta.numero} size="small" variant="outlined" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{venta.fecha}</Typography>
                      <Typography variant="caption" color="text.secondary">{venta.hora || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), fontSize: 12 }}>
                          {venta.cliente.nombre.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{venta.cliente.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">{venta.cliente.documento}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getMetodoPagoIcono(venta.metodoPago)}
                        label={venta.metodoPago}
                        size="small"
                        sx={{ bgcolor: alpha(getMetodoPagoColor(venta.metodoPago), 0.1), color: getMetodoPagoColor(venta.metodoPago) }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        S/ {venta.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={venta.estado}
                        size="small"
                        color={venta.estado === 'COMPLETADA' ? 'success' : 'error'}
                        icon={venta.estado === 'COMPLETADA' ? <CheckCircle /> : <Cancel />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" onClick={() => handleOpenDetalle(venta)} sx={{ color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir ticket">
                          <IconButton
                            size="small"
                            onClick={() => handlePrint(venta)}
                            sx={{
                              color: theme.palette.warning.dark,
                              bgcolor: alpha(theme.palette.warning.main, 0.12),
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.warning.main, 0.2),
                                transform: 'scale(1.08)',
                                boxShadow: theme.shadows[4],
                              },
                            }}
                          >
                            <Print fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar venta">
                          <IconButton size="small" onClick={() => handleDelete(venta)} sx={{ color: theme.palette.error.main }}>
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
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Ventas por página"
        />
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar venta</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Estás seguro de que deseas eliminar la venta <strong>{ventaToDelete?.numero}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción es irreversible y se eliminará permanentemente el registro del historial.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detalleOpen} onClose={handleCloseDetalle} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.info.main, 0.08), color: theme.palette.info.dark, fontWeight: 'bold' }}>
          Detalle de Venta
        </DialogTitle>
        <DialogContent dividers sx={{ background: alpha(theme.palette.info.main, 0.04) }}>
          <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">N° Venta</Typography>
                <Typography variant="h6" fontWeight="bold">{selectedVenta?.numero}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedVenta?.cliente.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedVenta?.cliente.documento}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Método de pago</Typography>
                <Chip
                  icon={selectedVenta ? getMetodoPagoIcono(selectedVenta.metodoPago) : undefined}
                  label={selectedVenta?.metodoPago}
                  size="small"
                  sx={{ bgcolor: alpha(selectedVenta ? getMetodoPagoColor(selectedVenta.metodoPago) : theme.palette.grey[500], 0.15), color: selectedVenta ? getMetodoPagoColor(selectedVenta.metodoPago) : theme.palette.text.primary }}
                />
              </Box>
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Fecha / Hora</Typography>
                <Typography variant="body1">{selectedVenta?.fecha} · {selectedVenta?.hora || ''}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Vendedor</Typography>
                <Typography variant="body1">{selectedVenta?.vendedor.nombre}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                <Chip
                  label={selectedVenta?.estado}
                  size="small"
                  color={selectedVenta?.estado === 'COMPLETADA' ? 'success' : 'error'}
                  icon={selectedVenta?.estado === 'COMPLETADA' ? <CheckCircle /> : <Cancel />}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Productos</Typography>
            <Table size="small" sx={{ background: 'white', borderRadius: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Cant.</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedVenta?.productos.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell align="center">{item.cantidad}</TableCell>
                    <TableCell align="right">S/ {item.precio.toFixed(2)}</TableCell>
                    <TableCell align="right">S/ {item.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Subtotal</Typography>
              <Typography variant="h6" fontWeight="bold">S/ {selectedVenta?.subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">IGV</Typography>
              <Typography variant="h6" fontWeight="bold">S/ {selectedVenta?.igv.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Total</Typography>
              <Typography variant="h5" fontWeight="bold">S/ {selectedVenta?.total.toFixed(2)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseDetalle}>Cerrar</Button>
          <Button variant="contained" color="primary" onClick={handleCloseDetalle}>Aceptar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de filtros */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filtrar Ventas
          <IconButton onClick={() => setOpenFilterDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Método de pago</InputLabel>
            <Select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)} label="Método de pago">
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="EFECTIVO">💵 Efectivo</MenuItem>
              <MenuItem value="TARJETA">💳 Tarjeta</MenuItem>
              <MenuItem value="YAPE">📱 Yape</MenuItem>
              <MenuItem value="PLIN">📱 Plin</MenuItem>
              <MenuItem value="TRANSFERENCIA">🏦 Transferencia</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setFiltroMetodo(''); setOpenFilterDialog(false); }}>Limpiar</Button>
          <Button variant="contained" onClick={() => setOpenFilterDialog(false)}>Aplicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}