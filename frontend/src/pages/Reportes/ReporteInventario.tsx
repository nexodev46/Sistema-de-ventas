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
  Inventory,
  PictureAsPdf,
  Print,
  TrendingUp,
  Warning,
  CheckCircle,
  Category,
  LocalOffer,
  Close,
  Assessment,
  PieChart as PieChartIcon,
  Timeline,
  Download,
} from '@mui/icons-material'
import AttachMoney from '@mui/icons-material/AttachMoney'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { productoService } from '../../services/productoService'
import { categoriaService } from '../../services/categoriaService'
import { marcaService } from '../../services/marcaService'
import { Producto } from '../../types/producto.types'
import { Categoria } from '../../types/categoria.types'
import { SkeletonTable, SkeletonDashboardGrid } from '../../components/Common/SkeletonTable'
import { Marca } from '../../types/marca.types'
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
} from 'recharts'

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, prefix = '', suffix = '', delay = 0 }: any) => {
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

// coloresStock removed (not referenced)

export const ReporteInventario = () => {
  const theme = useTheme()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [openExportDialog, setOpenExportDialog] = useState(false)

  // Datos para gráficos
  const [stockPorCategoria, setStockPorCategoria] = useState<any[]>([])
  const [valorPorCategoria, setValorPorCategoria] = useState<any[]>([])
  const [stockPorMarca, setStockPorMarca] = useState<any[]>([])
  const [productosPorPrecio, setProductosPorPrecio] = useState<any[]>([])
  const [estadoStock, setEstadoStock] = useState<any[]>([])
  const [topProductosValor, setTopProductosValor] = useState<any[]>([])

  const [stats, setStats] = useState({
    totalProductos: 0,
    totalStock: 0,
    valorInventario: 0,
    productosBajoStock: 0,
    productosAgotados: 0,
    categoriasActivas: 0,
    marcasActivas: 0,
    stockPromedio: 0,
  })

  useEffect(() => {
    const unsubProductos = productoService.subscribeAll((data) => {
      setProductos(data)
      setLoading(false)
    }, console.error)

    const unsubCategorias = categoriaService.subscribeAll((data) => {
      setCategorias(data)
      setLoading(false)
    }, console.error)

    const unsubMarcas = marcaService.subscribeAll((data) => {
      setMarcas(data)
      setLoading(false)
    }, console.error)

    return () => {
      unsubProductos()
      unsubCategorias()
      unsubMarcas()
    }
  }, [])

  useEffect(() => {
    if (productos.length || categorias.length || marcas.length) {
      procesarDatos(productos, categorias, marcas)
    }
  }, [productos, categorias, marcas])

  const procesarDatos = (productosData: Producto[], categoriasData: Categoria[], marcasData: Marca[]) => {
    const totalProductos = productosData.length
    const totalStock = productosData.reduce((sum, p) => sum + p.stockActual, 0)
    const valorInventario = productosData.reduce((sum, p) => sum + (p.precioCompra * p.stockActual), 0)
    const productosBajoStock = productosData.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0).length
    const productosAgotados = productosData.filter(p => p.stockActual === 0).length
    const stockPromedio = totalProductos > 0 ? Math.round(totalStock / totalProductos) : 0

    setStats({
      totalProductos,
      totalStock,
      valorInventario,
      productosBajoStock,
      productosAgotados,
      categoriasActivas: categoriasData.length,
      marcasActivas: marcasData.length,
      stockPromedio,
    })

    // Stock por categoría
    const categoriaMap = new Map<string, { stock: number; valor: number }>()
    productosData.forEach(p => {
      if (p.categoria) {
        const existing = categoriaMap.get(p.categoria)
        if (existing) {
          existing.stock += p.stockActual
          existing.valor += p.precioCompra * p.stockActual
        } else {
          categoriaMap.set(p.categoria, { stock: p.stockActual, valor: p.precioCompra * p.stockActual })
        }
      }
    })
    const stockCat = Array.from(categoriaMap.entries()).map(([name, data]) => ({
      name,
      stock: data.stock,
      valor: data.valor,
    })).sort((a, b) => b.stock - a.stock).slice(0, 6)
    setStockPorCategoria(stockCat)
    setValorPorCategoria(stockCat)

    // Stock por marca
    const marcaMap = new Map<string, number>()
    productosData.forEach(p => {
      if (p.marca) {
        marcaMap.set(p.marca, (marcaMap.get(p.marca) || 0) + p.stockActual)
      }
    })
    const stockMar = Array.from(marcaMap.entries()).map(([name, stock]) => ({ name, stock }))
      .sort((a, b) => b.stock - a.stock).slice(0, 6)
    setStockPorMarca(stockMar)

    // Estado del stock
    const enStock = productosData.filter(p => p.stockActual > p.stockMinimo).length
    setEstadoStock([
      { name: 'En stock (> mínimo)', value: enStock, color: '#10b981' },
      { name: 'Stock bajo', value: productosBajoStock, color: '#f59e0b' },
      { name: 'Agotado', value: productosAgotados, color: '#ef4444' },
    ])

    // Productos por rango de precio
    const rangos = [
      { min: 0, max: 50, label: 'S/ 0 - 50' },
      { min: 51, max: 100, label: 'S/ 51 - 100' },
      { min: 101, max: 200, label: 'S/ 101 - 200' },
      { min: 201, max: 500, label: 'S/ 201 - 500' },
      { min: 501, max: 1000, label: 'S/ 501 - 1000' },
      { min: 1001, max: Infinity, label: 'S/ 1000+' },
    ]
    const precioData = rangos.map(r => ({
      label: r.label,
      cantidad: productosData.filter(p => p.precioVenta >= r.min && p.precioVenta <= r.max).length,
    }))
    setProductosPorPrecio(precioData)

    // Top productos por valor en inventario
    const topValor = [...productosData]
      .sort((a, b) => (b.precioCompra * b.stockActual) - (a.precioCompra * a.stockActual))
      .slice(0, 5)
      .map(p => ({ nombre: p.nombre, valor: p.precioCompra * p.stockActual }))
    setTopProductosValor(topValor)
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

      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, pageWidth, 48, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Reporte de inventario', pageWidth / 2, 22, { align: 'center' })
      doc.setFontSize(9)
      doc.text(`Total productos: ${stats.totalProductos}`, margin, 36)

      doc.setTextColor(0, 0, 0)
      doc.setDrawColor(220, 252, 231)
      doc.line(margin, 54, pageWidth - margin, 54)

      const headers: string[] = ['Código', 'Producto', 'Categoría', 'Stock', 'Stock Mín', 'Precio Venta']
      const rows: string[][] = productos.map((producto) => [
        String(producto.codigo || ''),
        String(producto.nombre || ''),
        String(producto.categoria || ''),
        String(producto.stockActual || 0),
        String(producto.stockMinimo || 0),
        String(formatCurrency(producto.precioVenta || 0)),
      ])

      const columnWidths = [80, 150, 110, 55, 70, 90]

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

      const nombreArchivo = `ReporteInventario_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(nombreArchivo)
      setOpenExportDialog(false)
    } catch (error) {
      console.error('Error exportando PDF del reporte de inventario:', error)
      alert('No se pudo exportar el reporte de inventario a PDF. Revisa la consola para más detalles.')
    }
  }

  const handleExportExcel = () => {
    try {
      const datosExcel = productos.map((producto) => ({
        Código: producto.codigo,
        Producto: producto.nombre,
        Categoría: producto.categoria || '-',
        'Stock Actual': producto.stockActual,
        'Stock Mínimo': producto.stockMinimo,
        'Precio Venta': producto.precioVenta,
        'Precio Compra': producto.precioCompra,
        Marca: producto.marca || '-',
      }))

      const worksheet = XLSX.utils.json_to_sheet(datosExcel)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ReporteInventario')
      const nombreArchivo = `ReporteInventario_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(workbook, nombreArchivo)
      setOpenExportDialog(false)
    } catch (error) {
      console.error('Error exportando Excel del reporte de inventario:', error)
      alert('No se pudo exportar el reporte de inventario a Excel. Revisa la consola para más detalles.')
    }
  }

  const handleExportWord = () => {
    try {
      const contenido = `
        <html>
          <head><meta charset="UTF-8" /></head>
          <body>
            <h1>Reporte de inventario</h1>
            <p>Total productos: ${stats.totalProductos}</p>
            <table border="1" cellpadding="6" cellspacing="0">
              <tr>
                <th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Stock Mín</th><th>Precio Venta</th>
              </tr>
              ${productos.map((producto) => `
                <tr>
                  <td>${producto.codigo || ''}</td>
                  <td>${producto.nombre || ''}</td>
                  <td>${producto.categoria || ''}</td>
                  <td>${producto.stockActual || 0}</td>
                  <td>${producto.stockMinimo || 0}</td>
                  <td>${formatCurrency(producto.precioVenta || 0)}</td>
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
      link.download = `ReporteInventario_${new Date().toISOString().slice(0, 10)}.doc`
      link.click()
      URL.revokeObjectURL(url)
      setOpenExportDialog(false)
    } catch (error) {
      console.error('Error exportando Word del reporte de inventario:', error)
      alert('No se pudo exportar el reporte de inventario a Word. Revisa la consola para más detalles.')
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  // productosFiltrados removed (not referenced)

  const chartCardProps = {
    p: 3,
    borderRadius: 3,
    minHeight: 360,
    display: 'flex',
    flexDirection: 'column' as const,
  }

  const chartMargin = { top: 20, right: 20, left: 0, bottom: 20 }

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
              Reporte de Inventario
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Análisis completo de tu stock y valor de inventario
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

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Productos" value={stats.totalProductos} icon={<Inventory />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Unidades en Stock" value={stats.totalStock} icon={<Inventory />} color={theme.palette.success.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Valor Inventario" value={stats.valorInventario} prefix="S/ " icon={<Assessment />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Stock Promedio" value={stats.stockPromedio} icon={<TrendingUp />} color={theme.palette.info.main} delay={400} />
        </Grid>
      </Grid>

      {/* Segunda fila de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Productos con Stock Bajo" value={stats.productosBajoStock} icon={<Warning />} color={theme.palette.warning.main} delay={500} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Productos Agotados" value={stats.productosAgotados} icon={<Warning />} color={theme.palette.error.main} delay={600} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Categorías Activas" value={stats.categoriasActivas} icon={<Category />} color={theme.palette.secondary.main} delay={700} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Marcas Activas" value={stats.marcasActivas} icon={<LocalOffer />} color={theme.palette.primary.main} delay={800} />
        </Grid>
      </Grid>

      {/* Gráficos principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={chartCardProps}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PieChartIcon /> Estado del Stock
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={estadoStock}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {estadoStock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => [`${v} productos`, 'Cantidad']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={chartCardProps}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Timeline /> Top 5 Productos por Valor en Inventario
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topProductosValor} layout="vertical" margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis type="number" tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} domain={[0, 'dataMax + 100']} />
                  <YAxis type="category" dataKey="nombre" stroke={theme.palette.text.secondary} fontSize={12} width={120} />
                  <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Valor']} />
                  <Bar dataKey="valor" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos secundarios */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={chartCardProps}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Category /> Stock por Categoría
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stockPorCategoria} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} domain={[0, 'dataMax + 10']} />
                  <RechartsTooltip formatter={(v: number) => [`${v} unidades`, 'Stock']} />
                  <Bar dataKey="stock" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={chartCardProps}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Assessment /> Valor por Categoría
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={valorPorCategoria} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(v) => `S/ ${v}`} stroke={theme.palette.text.secondary} fontSize={12} domain={[0, 'dataMax + dataMax * 0.1']} />
                  <RechartsTooltip formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Valor']} />
                  <Bar dataKey="valor" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráfico de productos por precio */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={chartCardProps}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachMoney /> Productos por Rango de Precio
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={productosPorPrecio} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="label" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} allowDecimals={false} />
                  <RechartsTooltip formatter={(v: number) => [`${v} productos`, 'Cantidad']} />
                  <Bar dataKey="cantidad" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={chartCardProps}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalOffer /> Stock por Marca (Top 5)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stockPorMarca} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} domain={[0, 'dataMax + 10']} />
                  <RechartsTooltip formatter={(v: number) => [`${v} unidades`, 'Stock']} />
                  <Bar dataKey="stock" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de productos con stock bajo */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" /> Productos con Stock Bajo o Agotados
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                <TableCell>Código</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="center">Stock Actual</TableCell>
                <TableCell align="center">Stock Mínimo</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.filter(p => p.stockActual <= p.stockMinimo).map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.codigo}</TableCell>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{p.categoria || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={p.stockActual}
                      size="small"
                      color={p.stockActual === 0 ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">{p.stockMinimo}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={p.stockActual === 0 ? 'Agotado' : 'Stock bajo'}
                      size="small"
                      color={p.stockActual === 0 ? 'error' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {productos.filter(p => p.stockActual <= p.stockMinimo).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay productos con problemas de stock
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