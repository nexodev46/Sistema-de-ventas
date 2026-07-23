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
  
  Zoom,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  
  Alert,
} from '@mui/material'
import {
  Category,
  Search,
  Edit,
  Delete,
  
  Add,
  Close,
  CheckCircle,
  Inventory,
  
  TrendingUp,
  HealthAndSafety,
  Spa,
  FitnessCenter,
  Brush,
  LocalDrink,
  RestaurantMenu,
  FaceRetouchingNatural,
  ChildCare,
  Pets,
  SportsSoccer,
  Build,
  Engineering,
  Devices,
  Computer,
  Memory,
  Bolt,
  Checkroom,
  ShoppingBag,
  LocalBar,
  Fastfood,
  BakeryDining,
  LocalMall,
} from '@mui/icons-material'
import { categoriaService } from '../../../services/categoriaService'
import { Categoria } from '../../../types/categoria.types'
import { motion } from 'framer-motion'

// Colores predefinidos para categorías
const coloresCategoria = [
  { nombre: 'Esmeralda', valor: '#0f766e' },
  { nombre: 'Sapphire', valor: '#2563eb' },
  { nombre: 'Oro', valor: '#c084fc' },
  { nombre: 'Champán', valor: '#facc15' },
  { nombre: 'Amatista', valor: '#7c3aed' },
  { nombre: 'Rosa Luxe', valor: '#db2777' },
  { nombre: 'Turquesa', valor: '#14b8a6' },
  { nombre: 'Cobre', valor: '#f97316' },
  { nombre: 'Onyx', valor: '#374151' },
  { nombre: 'Humo', valor: '#4b5563' },
  { nombre: 'Cielo', valor: '#0ea5e9' },
  { nombre: 'Menta', valor: '#22c55e' },
  { nombre: 'Magenta', valor: '#d946ef' },
  { nombre: 'Pera', valor: '#84cc16' },
  { nombre: 'Sandía', valor: '#ec4899' },
  { nombre: 'Azul Profundo', valor: '#1e3a8a' },
  { nombre: 'Coral', valor: '#fb7185' },
  { nombre: 'Verde Oliva', valor: '#4d7c0f' },
]

// Íconos predefinidos
const iconosCategoria = [
  { nombre: 'Medicina', icono: 'HealthAndSafety' },
  { nombre: 'Hierbas', icono: 'Spa' },
  { nombre: 'Vitaminas', icono: 'FitnessCenter' },
  { nombre: 'Cuidado Personal', icono: 'Brush' },
  { nombre: 'Bebidas', icono: 'LocalDrink' },
  { nombre: 'Alimentos', icono: 'RestaurantMenu' },
  { nombre: 'Belleza', icono: 'FaceRetouchingNatural' },
  { nombre: 'Bebé', icono: 'ChildCare' },
  { nombre: 'Mascotas', icono: 'Pets' },
  { nombre: 'Deportes', icono: 'SportsSoccer' },
  { nombre: 'Ferretería', icono: 'Build' },
  { nombre: 'Herramientas', icono: 'Engineering' },
  { nombre: 'Tecnología', icono: 'Devices' },
  { nombre: 'Computadoras', icono: 'Computer' },
  { nombre: 'Componentes', icono: 'Memory' },
  { nombre: 'Electrónica', icono: 'Bolt' },
  { nombre: 'Ropa', icono: 'Checkroom' },
  { nombre: 'Calzado', icono: 'ShoppingBag' },
  { nombre: 'Licorería', icono: 'LocalBar' },
  { nombre: 'Comidas', icono: 'Fastfood' },
  { nombre: 'Panadería', icono: 'BakeryDining' },
  { nombre: 'Retail', icono: 'LocalMall' },
]

const iconosMap: Record<string, JSX.Element> = {
  HealthAndSafety: <HealthAndSafety fontSize="small" />,
  Spa: <Spa fontSize="small" />,
  FitnessCenter: <FitnessCenter fontSize="small" />,
  Brush: <Brush fontSize="small" />,
  LocalDrink: <LocalDrink fontSize="small" />,
  RestaurantMenu: <RestaurantMenu fontSize="small" />,
  FaceRetouchingNatural: <FaceRetouchingNatural fontSize="small" />,
  ChildCare: <ChildCare fontSize="small" />,
  Pets: <Pets fontSize="small" />,
  SportsSoccer: <SportsSoccer fontSize="small" />,
  Build: <Build fontSize="small" />,
  Engineering: <Engineering fontSize="small" />,
  Devices: <Devices fontSize="small" />,
  Computer: <Computer fontSize="small" />,
  Memory: <Memory fontSize="small" />,
  Bolt: <Bolt fontSize="small" />,
  Checkroom: <Checkroom fontSize="small" />,
  ShoppingBag: <ShoppingBag fontSize="small" />,
  LocalBar: <LocalBar fontSize="small" />,
  Fastfood: <Fastfood fontSize="small" />,
  BakeryDining: <BakeryDining fontSize="small" />,
  LocalMall: <LocalMall fontSize="small" />,
}

const renderCategoriaIcon = (icono: string) => {
  if (iconosMap[icono]) {
    return iconosMap[icono]
  }

  return (
    <Typography component="span" sx={{ fontSize: 24 }}>
      {icono || '📁'}
    </Typography>
  )
}

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

// Componente de tarjeta de categoría
const CategoriaCard = ({ categoria, onEdit, onDelete }: any) => {
  const theme = useTheme()
  

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
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[12],
            },
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Color bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: categoria.color || theme.palette.primary.main,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />

          <CardContent sx={{ pt: 3, pb: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: alpha(categoria.color || theme.palette.primary.main, 0.18),
                  color: categoria.color || theme.palette.primary.main,
                  fontSize: 28,
                  boxShadow: `0 12px 24px ${alpha(categoria.color || theme.palette.primary.main, 0.18)}`,
                  flexShrink: 0,
                }}
              >
                {renderCategoriaIcon(categoria.icono || '📁')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {categoria.nombre}
                </Typography>
                <Chip
                  label={`${categoria.productoCount || 0} productos`}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: alpha(categoria.color || theme.palette.primary.main, 0.1) }}
                />
              </Box>
            </Box>

            {categoria.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {categoria.descripcion}
              </Typography>
            )}

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(categoria)} sx={{ color: theme.palette.warning.main }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete(categoria.id, categoria.nombre)} sx={{ color: theme.palette.error.main }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  )
}

export const ListadoCategorias = () => {
  const theme = useTheme()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filtered, setFiltered] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#10b981',
    icono: '📁',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    cargarCategorias()
  }, [])

  useEffect(() => {
    filtrarCategorias()
  }, [search, categorias])

  const cargarCategorias = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await categoriaService.getAll()
      setCategorias(data)
      setFiltered(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('No se pudo cargar las categorías. Revisa la consola para más detalles.')
    } finally {
      setLoading(false)
    }
  }

  const filtrarCategorias = () => {
    if (!search.trim()) {
      setFiltered(categorias)
    } else {
      const term = search.toLowerCase()
      const filtrados = categorias.filter(c =>
        c.nombre.toLowerCase().includes(term)
      )
      setFiltered(filtrados)
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar la categoría "${nombre}"? Los productos quedarán sin categoría.`)) {
      await categoriaService.delete(id)
      cargarCategorias()
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      color: categoria.color || '#10b981',
      icono: categoria.icono || '📁',
    })
    setOpenDialog(true)
  }

  const handleCreate = () => {
    setEditingCategoria(null)
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#10b981',
      icono: '📁',
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      setErrorMessage('El nombre de la categoría es obligatorio.')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id, formData)
        setSuccessMessage('Categoría actualizada correctamente.')
      } else {
        await categoriaService.create(formData)
        setSuccessMessage('Categoría creada correctamente.')
      }
      setOpenDialog(false)
      cargarCategorias()
    } catch (error) {
      console.error('Error guardando categoría:', error)
      setErrorMessage('No se pudo guardar la categoría. Revisa la consola para más detalles.')
    }
  }

  const totalProductos = categorias.reduce((sum, c) => sum + (c.productoCount || 0), 0)
  const categoriasActivas = categorias.filter(c => c.activo).length

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Categorías
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Organiza tus productos por categorías
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              bgcolor: 'white',
              color: theme.palette.secondary.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nueva Categoría
          </Button>
        </Box>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Categorías" value={categorias.length} icon={<Category />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Activas" value={categoriasActivas} icon={<CheckCircle />} color={theme.palette.success.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Productos" value={totalProductos} icon={<Inventory />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Promedio x Cat" value={categorias.length > 0 ? Math.round(totalProductos / categorias.length) : 0} icon={<TrendingUp />} color={theme.palette.info.main} delay={400} />
        </Grid>
      </Grid>

      {/* Barra de búsqueda */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar categoría por nombre..."
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
      </Paper>

      {/* Lista de categorías */}
      {filtered.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Category sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay categorías registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea categorías para organizar tus productos
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Crear primera categoría
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Grid>
      )}

      {/* Diálogo de creación/edición */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 1 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: alpha(formData.color, 0.15),
                color: formData.color,
                fontSize: 40,
              }}
            >
              {renderCategoriaIcon(formData.icono)}
            </Avatar>
          </Box>

          <TextField
            fullWidth
            label="Nombre de la categoría *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>Color</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            {coloresCategoria.map((color) => (
              <Box
                key={color.valor}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${alpha(color.valor, 0.95)} 0%, ${alpha(color.valor, 0.65)} 100%)`,
                  boxShadow: formData.color === color.valor ? `0 0 0 3px ${alpha(color.valor, 0.35)}` : `0 6px 18px ${alpha(color.valor, 0.16)}`,
                  border: formData.color === color.valor ? `2px solid ${theme.palette.common.white}` : '1px solid rgba(255,255,255,0.18)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 10px 22px ${alpha(color.valor, 0.24)}`,
                  },
                }}
                onClick={() => setFormData({ ...formData, color: color.valor })}
                title={color.nombre}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>Ícono</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {iconosCategoria.map((icono) => (
              <Avatar
                key={icono.nombre}
                sx={{
                  bgcolor: alpha(formData.color, 0.1),
                  color: formData.color,
                  width: 44,
                  height: 44,
                  cursor: 'pointer',
                  border: formData.icono === icono.icono ? `2px solid ${formData.color}` : 'none',
                  '&:hover': { opacity: 0.9, transform: 'scale(1.06)' },
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                }}
                onClick={() => setFormData({ ...formData, icono: icono.icono })}
              >
                {renderCategoriaIcon(icono.icono)}
              </Avatar>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingCategoria ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}