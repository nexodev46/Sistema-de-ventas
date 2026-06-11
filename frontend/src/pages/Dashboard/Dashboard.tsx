import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
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
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fade,
  Zoom,
  Select,
  MenuItem,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Warning,
  Receipt,
  MoreVert,
  Refresh,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
  Store,
  LocalShipping,
  CheckCircle,
  Schedule,
  AccessTime,
  Category,
  Star,
} from '@mui/icons-material'
import { productoService } from '../../services/productoService'
import { ventaService } from '../../services/ventaService'
import { clienteService } from '../../services/clienteService'
import { Producto } from '../../types/producto.types'
import { Venta } from '../../types/venta.types'
import { Cliente } from '../../types/cliente.types'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// Colores para gráficos
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, prefix = '', suffix = '', trend = null, loading = false }: any) => {
  const theme = useTheme()

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box><Skeleton variant="text" width={80} /><Skeleton variant="text" width={60} /></Box>
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Zoom in>
      <Card
        sx={{
          borderRadius: 3,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[12] },
          boxShadow: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
              <Typography variant="h4" fontWeight="bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</Typography>
              {trend !== null && trend !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {trend >= 0 ? <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} /> : <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />}
                  <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>{Math.abs(trend)}%</Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color: color, width: 56, height: 56 }}>{icon}</Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  )
}

// Componente de actividad reciente
const ActivityItem = ({ icon, title, description, time, color }: any) => (
  <Paper elevation={0} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, borderRadius: 3, bgcolor: alpha(color, 0.08), border: '1px solid', borderColor: 'divider' }}>
    <Avatar sx={{ bgcolor: alpha(color, 0.18), color: color, width: 40, height: 40 }}>{icon}</Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" fontWeight="medium">{title}</Typography>
      <Typography variant="caption" color="text.secondary">{description}</Typography>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>{time}</Typography>
    </Box>
  </Paper>
)

const metodoPagoColores: Record<string, string> = {
  EFECTIVO: '#10b981', TARJETA: '#3b82f6', YAPE: '#8b5cf6', PLIN: '#06b6d4', TRANSFERENCIA: '#f59e0b',
}

// Componente de Skeleton
const Skeleton = ({ variant, width, height }: any) => (
  <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, width, height, display: 'inline-block' }} />
)

export const Dashboard = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const getLocalDateIso = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const [headerDateValue, setHeaderDateValue] = useState<string>(() => getLocalDateIso())
  const dateInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  
  // Datos para gráficos
  const [ventasPorDia, setVentasPorDia] = useState<any[]>([])
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '12m'>('7d')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [ventasPorHora, setVentasPorHora] = useState<any[]>([])
  const [ventasPorMetodo, setVentasPorMetodo] = useState<any[]>([])
  const [ventasPorSemana, setVentasPorSemana] = useState<any[]>([])
  const [topProductos, setTopProductos] = useState<any[]>([])
  const [productosPorCategoria, setProductosPorCategoria] = useState<any[]>([])
  const [clientesPorMes, setClientesPorMes] = useState<any[]>([])
  const [tendenciaClientes, setTendenciaClientes] = useState<any[]>([])
  const [ultimasVentas, setUltimasVentas] = useState<any[]>([])
  const [productosBajoStockList, setProductosBajoStockList] = useState<Producto[]>([])
  const [actividades, setActividades] = useState<any[]>([])
  const [stats, setStats] = useState({
    ventasHoy: 0, ventasMes: 0, ordenesHoy: 0, clientesNuevos: 0,
    productosBajoStock: 0, productosAgotados: 0, totalProductos: 0, totalClientes: 0,
    ticketPromedio: 0, crecimientoVentas: 12.5,
  })

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const headerDate = (() => {
    const [year, month, day] = headerDateValue.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
  })()
  const rangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '12m', label: 'Último año' },
  ]

  const getVentasUltimosDias = (days: number) => {
    const today = new Date()
    const fechas = Array.from({ length: days }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (days - 1 - index))
      return date
    })
    return fechas.map(date => {
      const fechaStr = date.toISOString().split('T')[0]
      const totalDia = ventas.filter(v => v.fecha === fechaStr).reduce((sum, v) => sum + v.total, 0)
      return { fecha: date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }), total: totalDia }
    })
  }

  const getVentasUltimos12Meses = () => {
    const today = new Date()
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const totalMes = ventas.filter(v => {
        const fecha = new Date(v.fecha)
        return fecha.getMonth() === month && fecha.getFullYear() === year
      }).reduce((sum, v) => sum + v.total, 0)
      return { fecha: date.toLocaleDateString('es', { month: 'short', year: '2-digit' }), total: totalMes }
    })
  }

  const getVentasPorDiaMes = (month: number, year: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1)
      const fechaStr = date.toISOString().split('T')[0]
      const totalDia = ventas.filter(v => v.fecha === fechaStr).reduce((sum, v) => sum + v.total, 0)
      return { fecha: date.toLocaleDateString('es', { day: 'numeric' }), total: totalDia }
    })
  }

  const initialLoadRef = useRef({ productos: false, ventas: false, clientes: false })

  const markInitialLoaded = (key: 'productos' | 'ventas' | 'clientes') => {
    if (!initialLoadRef.current[key]) {
      initialLoadRef.current[key] = true
      if (Object.values(initialLoadRef.current).every(Boolean)) {
        setLoading(false)
      }
    }
  }

  const procesarDashboard = (productosData: Producto[], ventasData: Venta[], clientesData: Cliente[]) => {
    setProductos(productosData)
    setVentas(ventasData)
    setClientes(clientesData)

    const hoy = new Date().toISOString().split('T')[0]
    const ventasHoy = ventasData.filter(v => v.fecha === hoy)
    const ventasHoyTotal = ventasHoy.reduce((sum, v) => sum + v.total, 0)
    const mesActual = new Date().getMonth()
    const ventasMes = ventasData.filter(v => new Date(v.fecha).getMonth() === mesActual)
    const ventasMesTotal = ventasMes.reduce((sum, v) => sum + v.total, 0)
    const clientesNuevos = clientesData.filter(c => new Date(c.fechaRegistro).getMonth() === mesActual).length
    const productosBajoStock = productosData.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0).length
    const productosAgotados = productosData.filter(p => p.stockActual === 0).length
    const ticketPromedio = ventasData.length > 0 ? ventasData.reduce((sum, v) => sum + v.total, 0) / ventasData.length : 0

    setStats({
      ventasHoy: ventasHoyTotal,
      ventasMes: ventasMesTotal,
      ordenesHoy: ventasHoy.length,
      clientesNuevos,
      productosBajoStock,
      productosAgotados,
      totalProductos: productosData.length,
      totalClientes: clientesData.length,
      ticketPromedio,
      crecimientoVentas: 12.5,
    })

    const horaMap = new Map<number, number>()
    for (let i = 0; i < 24; i++) horaMap.set(i, 0)
    ventasData.forEach(v => {
      const hora = v.hora?.split(':')[0]
      if (!hora) return
      const horaNumero = parseInt(hora, 10)
      if (!Number.isNaN(horaNumero)) horaMap.set(horaNumero, (horaMap.get(horaNumero) || 0) + v.total)
    })
    setVentasPorHora(Array.from(horaMap.entries()).map(([hora, total]) => ({ hora: `${hora}:00`, total })))

    const metodoMap = new Map<string, number>()
    ventasData.forEach(v => metodoMap.set(v.metodoPago, (metodoMap.get(v.metodoPago) || 0) + v.total))
    setVentasPorMetodo(Array.from(metodoMap.entries()).map(([name, value]) => ({ name, value, color: metodoPagoColores[name] || '#888' })))

    const semanaMap = new Map<number, number>()
    ventasData.forEach(v => {
      const semana = Math.ceil(new Date(v.fecha).getDate() / 7)
      semanaMap.set(semana, (semanaMap.get(semana) || 0) + v.total)
    })
    setVentasPorSemana(Array.from(semanaMap.entries()).map(([semana, total]) => ({ semana: `Sem ${semana}`, total })))

    const productoMap = new Map<string, { nombre: string; cantidad: number; total: number }>()
    ventasData.forEach(v => v.productos.forEach(p => {
      const existing = productoMap.get(p.id)
      if (existing) {
        existing.cantidad += p.cantidad
        existing.total += p.subtotal
      } else {
        productoMap.set(p.id, { nombre: p.nombre, cantidad: p.cantidad, total: p.subtotal })
      }
    }))
    setTopProductos(Array.from(productoMap.values()).sort((a, b) => b.total - a.total).slice(0, 5))

    const categoriaMap = new Map<string, number>()
    productosData.forEach(p => {
      if (p.categoria) categoriaMap.set(p.categoria, (categoriaMap.get(p.categoria) || 0) + 1)
    })
    setProductosPorCategoria(Array.from(categoriaMap.entries()).map(([name, value]) => ({ name, value })))

    const mesesData = []
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      const cantidad = clientesData.filter(c => new Date(c.fechaRegistro).getMonth() === fecha.getMonth() && new Date(c.fechaRegistro).getFullYear() === fecha.getFullYear()).length
      mesesData.push({ mes: fecha.toLocaleDateString('es', { month: 'short' }), clientes: cantidad })
    }
    setClientesPorMes(mesesData)

    const recurrentes = clientesData.filter(c => (c.totalCompras || 0) > 1).length
    const nuevos = clientesData.length - recurrentes
    setTendenciaClientes([{ name: 'Nuevos', value: nuevos, color: '#3b82f6' }, { name: 'Recurrentes', value: recurrentes, color: '#10b981' }])

    const ultimasVentasData = [...ventasData]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 5)
      .map(v => ({ id: v.numero, cliente: v.cliente.nombre, fecha: v.fecha, hora: v.hora, total: v.total }))
    setUltimasVentas(ultimasVentasData)

    setProductosBajoStockList(productosData.filter(p => p.stockActual <= p.stockMinimo).slice(0, 4))

    const acts = []
    if (ultimasVentasData.length > 0) acts.push({ id: 1, icon: <Receipt />, title: 'Nueva venta realizada', description: `Venta ${ultimasVentasData[0].id} por S/ ${ultimasVentasData[0].total.toFixed(2)}`, time: 'Hace unos minutos', color: theme.palette.success.main })
    if (clientesNuevos > 0) acts.push({ id: 2, icon: <People />, title: 'Nuevo cliente registrado', description: `${clientesNuevos} nuevos clientes este mes`, time: 'Este mes', color: theme.palette.info.main })
    if (productosBajoStock > 0) acts.push({ id: 3, icon: <Warning />, title: 'Productos con stock bajo', description: `${productosBajoStock} productos necesitan atención`, time: 'Revisar inventario', color: theme.palette.warning.main })
    setActividades(acts)
  }

  useEffect(() => {
    const unsubProductos = productoService.subscribeAll((data) => {
      setProductos(data)
      markInitialLoaded('productos')
    }, console.error)

    const unsubVentas = ventaService.subscribeAll((data) => {
      setVentas(data)
      markInitialLoaded('ventas')
    }, console.error)

    const unsubClientes = clienteService.subscribeAll((data) => {
      setClientes(data)
      markInitialLoaded('clientes')
    }, console.error)

    return () => {
      unsubProductos()
      unsubVentas()
      unsubClientes()
    }
  }, [])

  useEffect(() => {
    procesarDashboard(productos, ventas, clientes)
  }, [productos, ventas, clientes])

  useEffect(() => {
    if (selectedRange === '7d') {
      setVentasPorDia(getVentasUltimosDias(7))
    } else if (selectedRange === '30d') {
      setVentasPorDia(getVentasUltimosDias(30))
    } else {
      setVentasPorDia(getVentasUltimos12Meses())
    }
  }, [ventas, selectedRange, selectedMonth, selectedYear])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [productosData, ventasData, clientesData] = await Promise.all([
        productoService.getAll(), ventaService.getAll(), clienteService.getAll(),
      ])
      procesarDashboard(productosData, ventasData, clientesData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Header con gradiente */}
      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`, borderRadius: 4, p: 3, pb: 2.5, mb: 3, color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Dashboard</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Bienvenido, {user?.nombre?.split(' ').slice(0, 2).join(' ') || 'Admin'}. Resumen de tu negocio.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, position: 'relative' }}>
            <Tooltip title="Actualizar datos"><IconButton onClick={cargarDatos} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}><Refresh /></IconButton></Tooltip>
            <Box
              role="button"
              tabIndex={0}
              onClick={() => {
                dateInputRef.current?.showPicker?.()
                dateInputRef.current?.focus()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  dateInputRef.current?.showPicker?.()
                  dateInputRef.current?.focus()
                }
              }}
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: 3,
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' },
              }}
            >
              <CalendarToday sx={{ fontSize: 20, color: 'white' }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>{headerDate}</Typography>
              <Box component="input"
                ref={dateInputRef}
                type="date"
                value={headerDateValue}
                onChange={(e) => setHeaderDateValue(e.target.value)}
                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0, margin: 0 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Fila 1: Tarjetas KPI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Venta del día" value={stats.ventasHoy} prefix="S/ " icon={<AttachMoney />} color={theme.palette.success.main} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Venta del mes" value={stats.ventasMes} prefix="S/ " icon={<TrendingUp />} color={theme.palette.primary.main} trend={stats.crecimientoVentas} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Órdenes del día" value={stats.ordenesHoy} icon={<ShoppingCart />} color={theme.palette.warning.main} loading={loading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Ticket Promedio" value={stats.ticketPromedio} prefix="S/ " icon={<Receipt />} color={theme.palette.info.main} loading={loading} /></Grid>
      </Grid>

      {/* Fila 2: Gráficos principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TrendingUp /> Evolución de Ventas</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {rangeOptions.map(option => (
                    <Button
                      key={option.value}
                      size="small"
                      variant={selectedRange === option.value ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setSelectedRange(option.value as any)}
                      sx={{ textTransform: 'none', minWidth: 115 }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {selectedRange === '7d' && 'Últimos 7 días'}
                {selectedRange === '30d' && 'Últimos 30 días'}
                {selectedRange === '12m' && 'Últimos 12 meses'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                ventasPorDia.every(v => v.total === 0) ? <Box sx={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}><AttachMoney sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} /><Typography variant="body1" color="text.secondary">Sin datos de ventas</Typography></Box> :
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={ventasPorDia}>
                    <defs><linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} /><stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="fecha" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} />
                    <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']} />
                    <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={2} fill="url(#colorVentas)" />
                  </AreaChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessTime /> Ventas por Hora</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                ventasPorHora.every(h => h.total === 0) ? <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">Sin datos</Typography></Box> :
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={ventasPorHora}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="hora" stroke={theme.palette.text.secondary} fontSize={10} angle={-45} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={11} />
                    <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']} />
                    <Line type="monotone" dataKey="total" stroke={theme.palette.secondary.main} strokeWidth={2} dot={{ fill: theme.palette.secondary.main, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fila 3: Métodos de pago + Productos por categoría */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Store /> Métodos de Pago</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                ventasPorMetodo.length === 0 ? <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay datos</Typography></Box> :
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={ventasPorMetodo} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {ventasPorMetodo.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Monto']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {ventasPorMetodo.map(m => <Chip key={m.name} label={m.name} size="small" sx={{ bgcolor: alpha(m.color, 0.1), color: m.color }} />)}
                  </Box>
                </>
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Category /> Productos por Categoría</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                productosPorCategoria.length === 0 ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay categorías</Typography></Box> :
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={productosPorCategoria} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis type="number" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} width={100} />
                    <RechartsTooltip formatter={(v: number) => [`${v} productos`, 'Cantidad']} />
                    <Bar dataKey="value" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fila 4: Ventas por semana + Clientes por mes */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TrendingUp /> Ventas por Semana del Mes</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                ventasPorSemana.length === 0 ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">Sin datos</Typography></Box> :
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ventasPorSemana}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="semana" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} />
                    <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']} />
                    <Bar dataKey="total" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><People /> Clientes Nuevos por Mes</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={clientesPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="mes" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                    <RechartsTooltip formatter={(v: number) => [`${v} clientes`, 'Nuevos']} />
                    <Line type="monotone" dataKey="clientes" stroke={theme.palette.info.main} strokeWidth={2} dot={{ fill: theme.palette.info.main, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fila 5: Clientes por mes + Actividades */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><People /> Clientes: Nuevos vs Recurrentes</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={tendenciaClientes} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {tendenciaClientes.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                    </Pie>
                    <Legend />
                    <RechartsTooltip formatter={(v: number) => [`${v} clientes`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Schedule /> Actividades Recientes</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                actividades.length === 0 ? <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay actividades recientes</Typography></Box> :
                actividades.map(a => <ActivityItem key={a.id} icon={a.icon} title={a.title} description={a.description} time={a.time} color={a.color} />)
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fila 6: Top productos + Stock bajo */}
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Star /> Top 5 Productos Más Vendidos</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                topProductos.length === 0 ? <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay productos</Typography></Box> :
                <Box>
                  {topProductos.map((p, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">{idx + 1}. {p.nombre}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">S/ {p.total.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={`${p.cantidad} uds`} size="small" variant="outlined" />
                        <LinearProgress variant="determinate" value={(p.total / topProductos[0].total) * 100} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              }
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Warning color="warning" /> Stock Bajo / Productos Críticos</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                productosBajoStockList.length === 0 ? <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} /><Typography variant="body2" color="text.secondary">No hay productos con stock bajo</Typography></Box> :
                productosBajoStockList.map(p => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                    <Box><Typography variant="body2" fontWeight="medium">{p.nombre}</Typography><Typography variant="caption" color="text.secondary">{p.codigo}</Typography></Box>
                    <Box><Chip label={`Stock: ${p.stockActual} / ${p.stockMinimo}`} size="small" color="warning" variant="outlined" /></Box>
                  </Box>
                ))
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fila 7: Últimas ventas */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Receipt /> Últimas Ventas</Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box> :
                ultimasVentas.length === 0 ? <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay ventas</Typography></Box> :
                <TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow><TableCell>N° Venta</TableCell><TableCell>Cliente</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
                <TableBody>{ultimasVentas.map(v => <TableRow key={v.id} hover><TableCell><Chip label={v.id} size="small" variant="outlined" /></TableCell><TableCell>{v.cliente}</TableCell><TableCell>{v.fecha}<br /><Typography variant="caption" color="text.secondary">{v.hora}</Typography></TableCell><TableCell align="right"><Typography fontWeight="bold" color="primary.main">S/ {v.total.toLocaleString()}</Typography></TableCell></TableRow>)}</TableBody></Table></TableContainer>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
