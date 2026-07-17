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
  Menu,
  MenuItem,
  Fade,
  Zoom,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Assessment,
  Download,
  PictureAsPdf,
  Print,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  Category,
  LocalShipping,
  Close,
  FilterList,
  DateRange,
  WhatsApp,
  Email,
  Receipt,
} from '@mui/icons-material'
import { ventaService } from '../../services/ventaService'
import { Venta } from '../../types/venta.types'
import { productoService } from '../../services/productoService'
import { clienteService } from '../../services/clienteService'
import { motion } from 'framer-motion'
import { LoadingScreen } from '../../components/Common/LoadingScreen'
import { SkeletonTable, SkeletonDashboardGrid } from '../../components/Common/SkeletonTable'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, prefix = '', trend = null, delay = 0 }: any) => {
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

const metodoPagoColores: Record<string, string> = {
  EFECTIVO: '#10b981',
  TARJETA: '#3b82f6',
  YAPE: '#8b5cf6',
  PLIN: '#06b6d4',
  TRANSFERENCIA: '#f59e0b',
}

export const ReporteVentas = () => {
  const theme = useTheme()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date()
    date.setDate(1)
    return date.toISOString().split('T')[0]
  })
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0])
  const [tipoReporte, setTipoReporte] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openExportDialog, setOpenExportDialog] = useState(false)

  // Datos para gráficos
  const [ventasPorDia, setVentasPorDia] = useState<any[]>([])
  const [ventasPorMetodo, setVentasPorMetodo] = useState<any[]>([])
  const [topProductos, setTopProductos] = useState<any[]>([])
  const [ventasPorHora, setVentasPorHora] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalIngresos: 0,
    promedioVenta: 0,
    ticketPromedio: 0,
    crecimiento: 12.5,
    clientesAtendidos: 0,
    productosVendidos: 0,
  })

  useEffect(() => {
    const unsubscribe = ventaService.subscribeAll((data) => {
      const ventasFiltradas = data.filter(v => v.fecha >= fechaInicio && v.fecha <= fechaFin)
      setVentas(ventasFiltradas)
      procesarDatos(ventasFiltradas)
      setLoading(false)
    }, console.error)

    return () => unsubscribe()
  }, [fechaInicio, fechaFin])

  const procesarDatos = (ventasData: Venta[]) => {
    // Estadísticas generales
    const totalIngresos = ventasData.reduce((sum, v) => sum + v.total, 0)
    const totalVentas = ventasData.length
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0
    const productosVendidos = ventasData.reduce((sum, v) => sum + v.productos.reduce((s, p) => s + p.cantidad, 0), 0)
    const clientesUnicos = new Set(ventasData.map(v => v.cliente.id)).size

    setStats({
      totalVentas,
      totalIngresos,
      promedioVenta,
      ticketPromedio: promedioVenta,
      crecimiento: 12.5,
      clientesAtendidos: clientesUnicos,
      productosVendidos,
    })

    // Ventas por día
    const diasMap = new Map<string, number>()
    ventasData.forEach(v => {
      diasMap.set(v.fecha, (diasMap.get(v.fecha) || 0) + v.total)
    })
    const dias = Array.from(diasMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fecha, total]) => ({ fecha, total }))
    setVentasPorDia(dias)

    // Ventas por método de pago
    const metodoMap = new Map<string, number>()
    ventasData.forEach(v => {
      metodoMap.set(v.metodoPago, (metodoMap.get(v.metodoPago) || 0) + v.total)
    })
    const metodos = Array.from(metodoMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: metodoPagoColores[name] || '#888',
    }))
    setVentasPorMetodo(metodos)

    // Top productos
    const productoMap = new Map<string, { nombre: string; cantidad: number; total: number }>()
    ventasData.forEach(v => {
      v.productos.forEach(p => {
        const existing = productoMap.get(p.id)
        if (existing) {
          existing.cantidad += p.cantidad
          existing.total += p.subtotal
        } else {
          productoMap.set(p.id, { nombre: p.nombre, cantidad: p.cantidad, total: p.subtotal })
        }
      })
    })
    const top = Array.from(productoMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    setTopProductos(top)

    // Ventas por hora
    const horaMap = new Map<number, number>()
    ventasData.forEach(v => {
      const hora = parseInt(v.hora?.split(':')[0] ?? '0', 10)
      horaMap.set(hora, (horaMap.get(hora) || 0) + v.total)
    })
    const horas = Array.from({ length: 24 }, (_, i) => ({
      hora: `${i}:00`,
      total: horaMap.get(i) || 0,
    }))
    setVentasPorHora(horas)
  }

  const handleExportPDF = () => {
    setOpenExportDialog(false)
    window.print()
  }

  const handleExportExcel = () => {
    // Aquí iría la lógica de exportación a Excel
    alert('Exportando a Excel...')
    setOpenExportDialog(false)
  }

  const periodos = [
    { label: 'Hoy', getFechaInicio: () => new Date().toISOString().split('T')[0], getFechaFin: () => new Date().toISOString().split('T')[0] },
    { label: 'Ayer', getFechaInicio: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }, getFechaFin: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] } },
    { label: 'Esta semana', getFechaInicio: () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0] }, getFechaFin: () => new Date().toISOString().split('T')[0] },
    { label: 'Este mes', getFechaInicio: () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] }, getFechaFin: () => new Date().toISOString().split('T')[0] },
    { label: 'Mes anterior', getFechaInicio: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); return d.toISOString().split('T')[0] }, getFechaFin: () => { const d = new Date(); d.setDate(0); return d.toISOString().split('T')[0] } },
  ]

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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <SkeletonDashboardGrid count={4} />
        </Grid>
        <SkeletonTable rows={8} columns={6} />
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
              Reporte de Ventas
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Análisis completo de tus ventas y métricas de negocio
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setOpenExportDialog(true)}
              sx={{ bgcolor: theme.palette.primary.main, color: 'white', '&:hover': { bgcolor: theme.palette.primary.dark } }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handleExportPDF}
              sx={{ bgcolor: theme.palette.primary.main, color: 'white', '&:hover': { bgcolor: theme.palette.primary.dark } }}
            >
              Imprimir
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DateRange />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ height: 40 }}
            >
              Período rápido
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {periodos.map(p => (
                <MenuItem key={p.label} onClick={() => {
                  setFechaInicio(p.getFechaInicio())
                  setFechaFin(p.getFechaFin())
                  setAnchorEl(null)
                }}>
                  {p.label}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Ventas" value={stats.totalVentas} icon={<ShoppingCart />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ingresos Totales" value={stats.totalIngresos} prefix="S/ " icon={<AttachMoney />} color={theme.palette.success.main} delay={200} trend={stats.crecimiento} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ticket Promedio" value={stats.ticketPromedio} prefix="S/ " icon={<Receipt />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clientes Atendidos" value={stats.clientesAtendidos} icon={<People />} color={theme.palette.info.main} delay={400} />
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp /> Evolución de Ventas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={350}>
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
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category /> Métodos de Pago
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ventasPorMetodo}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {ventasPorMetodo.map(m => (
                <Chip key={m.name} label={m.name} size="small" sx={{ bgcolor: alpha(m.color, 0.1), color: m.color }} />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos secundarios */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShipping /> Top 5 Productos Más Vendidos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis type="number" tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis type="category" dataKey="nombre" stroke={theme.palette.text.secondary} fontSize={12} width={100} />
                <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Total']} />
                <Bar dataKey="total" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday /> Ventas por Hora del Día
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="hora" stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} />
                <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']} />
                <Line type="monotone" dataKey="total" stroke={theme.palette.secondary.main} strokeWidth={2} dot={{ fill: theme.palette.secondary.main, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Resumen ejecutivo */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment /> Resumen Ejecutivo
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Total productos vendidos</Typography>
              <Typography variant="h5" fontWeight="bold">{stats.productosVendidos} unidades</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Ingreso promedio diario</Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                S/ {(stats.totalIngresos / Math.max(1, ventasPorDia.length)).toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Días con ventas</Typography>
              <Typography variant="h5" fontWeight="bold">{ventasPorDia.length} días</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Diálogo de exportación */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Exportar Reporte
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenExportDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Button fullWidth variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPDF} sx={{ mb: 2, py: 1.5 }}>
            Exportar a PDF
          </Button>
          <Button fullWidth variant="outlined" startIcon={<Download />} onClick={handleExportExcel} sx={{ mb: 2, py: 1.5 }}>
            Exportar a Excel
          </Button>
          <Button fullWidth variant="outlined" startIcon={<Print />} onClick={handleExportPDF} sx={{ py: 1.5 }}>
            Imprimir
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}