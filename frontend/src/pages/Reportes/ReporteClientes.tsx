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
  useTheme,
  alpha,
  Zoom,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import {
  People,
  PictureAsPdf,
  Print,
  TrendingUp,
  TrendingDown,
  Star,
  AttachMoney,
  Close,
  Assessment,
  PieChart as PieChartIcon,
  Timeline,
  Receipt,
  Download,
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { clienteService } from '../../services/clienteService'
import { ventaService } from '../../services/ventaService'
import { Cliente } from '../../types/cliente.types'
import { Venta } from '../../types/venta.types'
// framer-motion removed (not used)
import { SkeletonTable, SkeletonDashboardGrid } from '../../components/Common/SkeletonTable'
import {
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
  LineChart,
  Line,
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

export const ReporteClientes = () => {
  const theme = useTheme()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  
  const [openExportDialog, setOpenExportDialog] = useState(false)

  // Datos para gráficos
  const [clientesPorMes, setClientesPorMes] = useState<any[]>([])
  const [topClientes, setTopClientes] = useState<any[]>([])
  const [clientesPorTipo, setClientesPorTipo] = useState<any[]>([])
  const [frecuenciaCompras, setFrecuenciaCompras] = useState<any[]>([])
  const [gastosPorRango, setGastosPorRango] = useState<any[]>([])

  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesActivos: 0,
    clientesNuevosMes: 0,
    clientesInactivos: 0,
    totalGastado: 0,
    promedioGasto: 0,
    ticketPromedio: 0,
    clientesFrecuentes: 0,
    retencion: 85,
  })

  useEffect(() => {
    const unsubClientes = clienteService.subscribeAll((data) => {
      setClientes(data)
      setLoading(false)
    }, console.error)

    const unsubVentas = ventaService.subscribeAll((data) => {
      setVentas(data)
      setLoading(false)
    }, console.error)

    return () => {
      unsubClientes()
      unsubVentas()
    }
  }, [])

  useEffect(() => {
    if (clientes.length || ventas.length) {
      procesarDatos(clientes, ventas)
    }
  }, [clientes, ventas])

  const procesarDatos = (clientesData: Cliente[], ventasData: Venta[]) => {
    // Agrupar ventas por cliente
    const clienteCompras = new Map<string, { total: number; cantidad: number; ultimaCompra: string }>()
    ventasData.forEach(v => {
      const existing = clienteCompras.get(v.cliente.id)
      if (existing) {
        existing.total += v.total
        existing.cantidad++
        if (v.fecha > existing.ultimaCompra) existing.ultimaCompra = v.fecha
      } else {
        clienteCompras.set(v.cliente.id, { total: v.total, cantidad: 1, ultimaCompra: v.fecha })
      }
    })

    const totalGastado = Array.from(clienteCompras.values()).reduce((sum, c) => sum + c.total, 0)
    const promedioGasto = clientesData.length > 0 ? totalGastado / clientesData.length : 0
    const totalVentas = ventasData.length
    const ticketPromedio = totalVentas > 0 ? totalGastado / totalVentas : 0
    const clientesFrecuentes = Array.from(clienteCompras.values()).filter(c => c.cantidad >= 3).length

    const hoy = new Date()
    const mesActual = hoy.getMonth()
    const anioActual = hoy.getFullYear()
    const clientesNuevosMes = clientesData.filter(c => {
      const fechaRegistro = new Date(c.fechaRegistro)
      return fechaRegistro.getMonth() === mesActual && fechaRegistro.getFullYear() === anioActual
    }).length

    setStats({
      totalClientes: clientesData.length,
      clientesActivos: clientesData.filter(c => c.activo).length,
      clientesNuevosMes,
      clientesInactivos: clientesData.filter(c => !c.activo).length,
      totalGastado,
      promedioGasto,
      ticketPromedio,
      clientesFrecuentes,
      retencion: 85,
    })

    // Clientes registrados por mes (últimos 6 meses)
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      const mesNombre = fecha.toLocaleDateString('es', { month: 'short' })
      const cantidad = clientesData.filter(c => {
        const fechaReg = new Date(c.fechaRegistro)
        return fechaReg.getMonth() === fecha.getMonth() && fechaReg.getFullYear() === fecha.getFullYear()
      }).length
      meses.push({ mes: mesNombre, clientes: cantidad })
    }
    setClientesPorMes(meses)

    // Top clientes por gasto
    const top = Array.from(clienteCompras.entries())
      .map(([id, data]) => {
        const cliente = clientesData.find(c => c.id === id)
        return {
          nombre: cliente?.nombre || 'Desconocido',
          total: data.total,
          compras: data.cantidad,
          documento: cliente?.documento || '-',
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    setTopClientes(top)

    // Clientes por tipo de documento
    const dni = clientesData.filter(c => c.tipoDocumento === 'DNI').length
    const ruc = clientesData.filter(c => c.tipoDocumento === 'RUC').length
    const ce = clientesData.filter(c => c.tipoDocumento === 'CE').length
    const pasaporte = clientesData.filter(c => c.tipoDocumento === 'PASAPORTE').length
    setClientesPorTipo([
      { name: 'DNI', value: dni, color: '#3b82f6' },
      { name: 'RUC', value: ruc, color: '#f59e0b' },
      { name: 'Carnet Ext.', value: ce, color: '#10b981' },
      { name: 'Pasaporte', value: pasaporte, color: '#8b5cf6' },
    ].filter(t => t.value > 0))

    // Frecuencia de compras
    const frecuencia = [
      { label: '1 compra', cantidad: Array.from(clienteCompras.values()).filter(c => c.cantidad === 1).length },
      { label: '2-5 compras', cantidad: Array.from(clienteCompras.values()).filter(c => c.cantidad >= 2 && c.cantidad <= 5).length },
      { label: '6-10 compras', cantidad: Array.from(clienteCompras.values()).filter(c => c.cantidad >= 6 && c.cantidad <= 10).length },
      { label: '10+ compras', cantidad: Array.from(clienteCompras.values()).filter(c => c.cantidad > 10).length },
    ]
    setFrecuenciaCompras(frecuencia)

    // Gasto por rango
    const rangos = [
      { label: 'S/ 0 - 100', min: 0, max: 100 },
      { label: 'S/ 101 - 500', min: 101, max: 500 },
      { label: 'S/ 501 - 1000', min: 501, max: 1000 },
      { label: 'S/ 1001 - 5000', min: 1001, max: 5000 },
      { label: 'S/ 5000+', min: 5001, max: Infinity },
    ]
    const gastosRango = rangos.map(r => ({
      label: r.label,
      clientes: Array.from(clienteCompras.values()).filter(c => c.total >= r.min && c.total <= r.max).length,
    }))
    setGastosPorRango(gastosRango)
  }

  const formatCurrency = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const margin = 36
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const startY = 72
      const rowHeight = 18
      let y = startY

      doc.setFillColor(124, 58, 237)
      doc.rect(0, 0, pageWidth, 48, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Reporte de clientes', pageWidth / 2, 22, { align: 'center' })
      doc.setFontSize(9)
      doc.text(`Total clientes: ${stats.totalClientes}`, margin, 36)

      doc.setTextColor(0, 0, 0)
      doc.setDrawColor(237, 233, 254)
      doc.line(margin, 54, pageWidth - margin, 54)

      const headers: string[] = ['Cliente', 'Documento', 'Compras', 'Monto Total']
      const rows: string[][] = topClientes.map((cliente) => [
        String(cliente.nombre || ''),
        String(cliente.documento || ''),
        String(cliente.compras || 0),
        String(formatCurrency(Number(cliente.total || 0))),
      ])

      const columnWidths = [150, 120, 80, 120]

      const drawRow = (row: string[], isHeader = false) => {
        const currentY = y
        let x = margin
        if (isHeader) {
          doc.setFillColor(245, 247, 250)
          doc.rect(margin, currentY - 14, pageWidth - margin * 2, 20, 'F')
        }
        row.forEach((cell, index) => {
          if (isHeader) {
            doc.setFont('helvetica', 'bold')
          } else {
            doc.setFont('helvetica', 'normal')
          }
          doc.text(String(cell || ''), x, currentY)
          x += columnWidths[index]
        })
        y += rowHeight
      }

      drawRow(headers, true)
      doc.line(margin, y - 10, pageWidth - margin, y - 10)

      rows.forEach((row) => {
        if (y > pageHeight - 48) {
          doc.addPage()
          y = startY
        }
        drawRow(row)
      })

      const nombreArchivo = `ReporteClientes_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(nombreArchivo)
      setOpenExportDialog(false)
    } catch (error) {
      console.error('Error exportando PDF del reporte de clientes:', error)
      alert('No se pudo exportar el reporte de clientes a PDF. Revisa la consola para más detalles.')
    }
  }

  const handleExportExcel = () => {
    try {
      const datosExcel = topClientes.map((cliente) => ({
        Cliente: cliente.nombre,
        Documento: cliente.documento,
        'Total Compras': cliente.compras,
        'Monto Total': cliente.total,
      }))

      const worksheet = XLSX.utils.json_to_sheet(datosExcel)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ReporteClientes')
      const nombreArchivo = `ReporteClientes_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(workbook, nombreArchivo)
      setOpenExportDialog(false)
    } catch (error) {
      console.error('Error exportando Excel del reporte de clientes:', error)
      alert('No se pudo exportar el reporte de clientes a Excel. Revisa la consola para más detalles.')
    }
  }

  const handleExportWord = () => {
    try {
      const contenido = `
        <html>
          <head><meta charset="UTF-8" /></head>
          <body>
            <h1>Reporte de clientes</h1>
            <p>Total clientes: ${stats.totalClientes}</p>
            <table border="1" cellpadding="6" cellspacing="0">
              <tr>
                <th>Cliente</th><th>Documento</th><th>Compras</th><th>Monto Total</th>
              </tr>
              ${topClientes.map((cliente) => `
                <tr>
                  <td>${cliente.nombre || ''}</td>
                  <td>${cliente.documento || ''}</td>
                  <td>${cliente.compras || 0}</td>
                  <td>${formatCurrency(Number(cliente.total || 0))}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `

      const blob = new Blob([contenido], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ReporteClientes_${new Date().toISOString().slice(0, 10)}.doc`
      link.click()
      URL.revokeObjectURL(url)
      setOpenExportDialog(false)
    } catch (error) {
      console.error('Error exportando Word del reporte de clientes:', error)
      alert('No se pudo exportar el reporte de clientes a Word. Revisa la consola para más detalles.')
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  // clientesFiltrados removed (not referenced)

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
              Reporte de Clientes
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Análisis completo de tu cartera de clientes
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
              onClick={handlePrintReport}
              sx={{ bgcolor: theme.palette.primary.main, color: 'white', '&:hover': { bgcolor: theme.palette.primary.dark } }}
            >
              Imprimir
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas - Fila 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Clientes" value={stats.totalClientes} icon={<People />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clientes Activos" value={stats.clientesActivos} icon={<Star />} color={theme.palette.success.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clientes Nuevos (Mes)" value={stats.clientesNuevosMes} icon={<TrendingUp />} color={theme.palette.info.main} delay={300} trend={12.5} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasa de Retención" value={stats.retencion} suffix="%" icon={<Assessment />} color={theme.palette.warning.main} delay={400} />
        </Grid>
      </Grid>

      {/* Tarjetas de estadísticas - Fila 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Gastado" value={stats.totalGastado} prefix="S/ " icon={<AttachMoney />} color={theme.palette.success.main} delay={500} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Gasto Promedio x Cliente" value={stats.promedioGasto} prefix="S/ " icon={<TrendingUp />} color={theme.palette.info.main} delay={600} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ticket Promedio" value={stats.ticketPromedio} prefix="S/ " icon={<Receipt />} color={theme.palette.warning.main} delay={700} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clientes Frecuentes" value={stats.clientesFrecuentes} icon={<Star />} color={theme.palette.secondary.main} delay={800} />
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline /> Nuevos Clientes por Mes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="mes" stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                <RechartsTooltip formatter={(v: number) => [`${v} clientes`, 'Nuevos']} />
                <Line type="monotone" dataKey="clientes" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ fill: theme.palette.primary.main, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartIcon /> Top 5 Clientes por Gasto
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClientes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis type="number" tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis type="category" dataKey="nombre" stroke={theme.palette.text.secondary} fontSize={12} width={100} />
                <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Gasto total']} />
                <Bar dataKey="total" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos secundarios */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartIcon /> Clientes por Tipo de Documento
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientesPorTipo}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {clientesPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v: number) => [`${v} clientes`, 'Cantidad']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment /> Frecuencia de Compras
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frecuenciaCompras}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="label" stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                <RechartsTooltip formatter={(v: number) => [`${v} clientes`, 'Cantidad']} />
                <Bar dataKey="cantidad" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Gasto por rango */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney /> Distribución de Clientes por Gasto Total
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gastosPorRango}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="label" stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                <RechartsTooltip formatter={(v: number) => [`${v} clientes`, 'Cantidad']} />
                <Bar dataKey="clientes" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de clientes destacados */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star color="warning" /> Clientes Destacados (Top 10 por Gasto)
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <TableCell>Cliente</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell align="center">Total Compras</TableCell>
                <TableCell align="center">Monto Total</TableCell>
                <TableCell>Última Compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topClientes.map((cliente, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        {idx + 1}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">{cliente.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{cliente.documento}</TableCell>
                  <TableCell align="center">{cliente.compras} compras</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold" color="primary.main">
                      S/ {cliente.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>—</TableCell>
                </TableRow>
              ))}
              {topClientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay clientes registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Elige el formato para guardar o imprimir el reporte actual.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button fullWidth variant="outlined" startIcon={<PictureAsPdf />} onClick={handleExportPDF} sx={{ py: 1.5 }}>
              Exportar a PDF
            </Button>
            <Button fullWidth variant="outlined" startIcon={<Download />} onClick={handleExportExcel} sx={{ py: 1.5 }}>
              Exportar a Excel
            </Button>
            <Button fullWidth variant="outlined" startIcon={<Download />} onClick={handleExportWord} sx={{ py: 1.5 }}>
              Exportar a Word
            </Button>
            <Button fullWidth variant="outlined" startIcon={<Print />} onClick={handlePrintReport} sx={{ py: 1.5 }}>
              Imprimir
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}