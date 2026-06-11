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
  Menu,
  MenuItem,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material'
import {
  PersonAdd,
  Search,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Email,
  Phone,
  LocationOn,
  Receipt,
  TrendingUp,
  CalendarToday,
  FileCopy,
  PictureAsPdf,
  Download,
  Star,
  StarBorder,
} from '@mui/icons-material'
import { clienteService } from '../../services/clienteService'
import { Cliente } from '../../types/cliente.types'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, delay = 0 }: any) => {
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
                {typeof value === 'number' ? value.toLocaleString() : value}
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

// Componente de tarjeta de cliente
const ClientCard = ({ cliente, onEdit, onDelete, onView }: any) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            borderRadius: 3,
            height: '100%',
            position: 'relative',
            overflow: 'visible',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[12],
            },
          }}
        >
          {/* Avatar y nombre */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 3,
              pb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: 32,
                fontWeight: 'bold',
                mb: 2,
                boxShadow: 3,
              }}
            >
              {cliente.nombre.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              {cliente.nombre}
            </Typography>
            <Chip
              label={cliente.tipoDocumento === 'DNI' ? 'Persona Natural' : 'Empresa'}
              size="small"
              sx={{ mt: 1, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}
            />
          </Box>

          <CardContent>
            {/* Información de contacto */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                  {cliente.email || 'No registrado'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                  {cliente.telefono || 'No registrado'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cliente.direccion || 'No registrada'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Estadísticas del cliente */}
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Compras</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {cliente.totalCompras || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total gastado</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                    S/ {(cliente.totalCompras * 100).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>

          {/* Botones de acción */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
            }}
          >
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            TransitionComponent={Fade}
          >
            <MenuItem onClick={() => { onView(cliente.id); setAnchorEl(null); }}>
              <Visibility fontSize="small" sx={{ mr: 1 }} /> Ver detalles
            </MenuItem>
            <MenuItem onClick={() => { onEdit(cliente.id); setAnchorEl(null); }}>
              <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
            </MenuItem>
            <MenuItem onClick={() => { onDelete(cliente.id, cliente.nombre); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
              <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
            </MenuItem>
          </Menu>
        </Card>
      </motion.div>
    </Grid>
  )
}

export const ListadoClientes = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtered, setFiltered] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(12)

  useEffect(() => {
    const unsubscribe = clienteService.subscribeAll((data) => {
      setClientes(data)
      setFiltered(data)
      setLoading(false)
    }, console.error)

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    filtrarClientes()
  }, [search, clientes])

  const filtrarClientes = () => {
    if (!search.trim()) {
      setFiltered(clientes)
    } else {
      const term = search.toLowerCase()
      const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.documento.includes(term) ||
        c.telefono.includes(term)
      )
      setFiltered(filtrados)
    }
    setPage(0)
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar al cliente "${nombre}"?`)) {
      await clienteService.delete(id)
    }
  }

  const handleEdit = (id: string) => navigate(`/clientes/editar/${id}`)
  const handleView = (id: string) => navigate(`/clientes/${id}`)

  const totalClientes = clientes.length
  const clientesActivos = clientes.filter(c => c.activo).length
  const totalCompras = clientes.reduce((sum, c) => sum + (c.totalCompras || 0), 0)

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
              Clientes
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gestiona tu cartera de clientes
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/clientes/nuevo')}
            sx={{
              bgcolor: 'white',
              color: theme.palette.info.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nuevo Cliente
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Clientes" value={totalClientes} icon={<PersonAdd />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clientes Activos" value={clientesActivos} icon={<Star />} color={theme.palette.success.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Compras" value={totalCompras} icon={<Receipt />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasa de Retención" value="98%" icon={<TrendingUp />} color={theme.palette.info.main} delay={400} />
        </Grid>
      </Grid>

      {/* Barra de herramientas */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar cliente por nombre, email, DNI o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileCopy />}
              sx={{ borderRadius: 2 }}
            >
              Exportar Excel
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PictureAsPdf />}
              sx={{ borderRadius: 2 }}
            >
              Exportar PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Vista de clientes */}
      {filtered.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <PersonAdd sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay clientes registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comienza agregando tu primer cliente
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/clientes/nuevo')}
          >
            Agregar Cliente
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {filtered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((cliente) => (
                <ClientCard
                  key={cliente.id}
                  cliente={cliente}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
          </Grid>
          <TablePagination
            rowsPerPageOptions={[12, 24, 48]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage="Clientes por página"
            sx={{ mt: 2 }}
          />
        </>
      )}
    </Box>
  )
}