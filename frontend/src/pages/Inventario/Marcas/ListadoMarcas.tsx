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
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  
  Zoom,
} from '@mui/material'
import {
  BrandingWatermark,
  Search,
  Edit,
  Delete,
  Add,
  Close,
  CheckCircle,
  Inventory,
  TrendingUp,
  
} from '@mui/icons-material'
import { marcaService } from '../../../services/marcaService'
import { cloudinaryService } from '../../../services/cloudinaryService'
import { Marca } from '../../../types/marca.types'
import { motion } from 'framer-motion'

// Colores predefinidos para marcas
const coloresMarca = [
  { nombre: 'Verde', valor: '#10b981' },
  { nombre: 'Azul', valor: '#3b82f6' },
  { nombre: 'Rojo', valor: '#ef4444' },
  { nombre: 'Amarillo', valor: '#f59e0b' },
  { nombre: 'Púrpura', valor: '#8b5cf6' },
  { nombre: 'Rosa', valor: '#ec4899' },
  { nombre: 'Celeste', valor: '#06b6d4' },
  { nombre: 'Naranja', valor: '#f97316' },
  { nombre: 'Gris', valor: '#6b7280' },
  { nombre: 'Negro', valor: '#1f2937' },
]

// Logos predefinidos para marcas
const logosMarca = [
  { nombre: 'Estrella', icono: '⭐' },
  { nombre: 'Corazón', icono: '❤️' },
  { nombre: 'Naturaleza', icono: '🌿' },
  { nombre: 'Sol', icono: '☀️' },
  { nombre: 'Luna', icono: '🌙' },
  { nombre: 'Flor', icono: '🌸' },
  { nombre: 'Árbol', icono: '🌳' },
  { nombre: 'Agua', icono: '💧' },
  { nombre: 'Fuego', icono: '🔥' },
  { nombre: 'Tierra', icono: '🌍' },
  { nombre: 'Medicina', icono: '💊' },
  { nombre: 'Vitaminas', icono: '💪' },
]

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

// Componente de tarjeta de marca
const MarcaCard = ({ marca, onEdit, onDelete }: any) => {
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
              bgcolor: marca.color || theme.palette.primary.main,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />
          
          <CardContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: alpha(marca.color || theme.palette.primary.main, 0.15),
                  color: marca.color || theme.palette.primary.main,
                  fontSize: 28,
                  overflow: 'hidden',
                }}
              >
                {marca.imagenUrl ? (
                  <img src={marca.imagenUrl} alt={marca.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  marca.logo || '🏷️'
                )}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {marca.nombre}
                </Typography>
                <Chip
                  label={`${marca.productoCount || 0} productos`}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: alpha(marca.color || theme.palette.primary.main, 0.1) }}
                />
              </Box>
            </Box>

            {marca.descripcion && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {marca.descripcion}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(marca)} sx={{ color: theme.palette.warning.main }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete(marca.id, marca.nombre)} sx={{ color: theme.palette.error.main }}>
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

export const ListadoMarcas = () => {
  const theme = useTheme()
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [filtered, setFiltered] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    logo: '🏷️',
    color: '#10b981',
    imagenUrl: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>('')

  useEffect(() => {
    cargarMarcas()
  }, [])

  useEffect(() => {
    filtrarMarcas()
  }, [search, marcas, tabValue])

  const cargarMarcas = async () => {
    setLoading(true)
    try {
      const data = await marcaService.getAll()
      setMarcas(data)
      setFiltered(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarMarcas = () => {
    let result = [...marcas]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(m => m.nombre.toLowerCase().includes(term))
    }

    if (tabValue === 1) {
      result = result.filter(m => (m.productoCount || 0) > 0)
    } else if (tabValue === 2) {
      result = result.filter(m => (m.productoCount || 0) === 0)
    }

    setFiltered(result)
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar la marca "${nombre}"? Los productos quedarán sin marca.`)) {
      await marcaService.delete(id)
      cargarMarcas()
    }
  }

  const handleEdit = (marca: Marca) => {
    setEditingMarca(marca)
    setSelectedImage(null)
    setPreviewImage(marca.imagenUrl || '')
    setFormData({
      nombre: marca.nombre,
      descripcion: marca.descripcion || '',
      logo: marca.logo || '🏷️',
      color: marca.color || '#10b981',
      imagenUrl: marca.imagenUrl || '',
    })
    setOpenDialog(true)
  }

  const handleCreate = () => {
    setEditingMarca(null)
    setSelectedImage(null)
    setPreviewImage('')
    setFormData({
      nombre: '',
      descripcion: '',
      logo: '🏷️',
      color: '#10b981',
      imagenUrl: '',
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre de la marca es obligatorio')
      return
    }

    try {
      let marcaId = editingMarca ? editingMarca.id : null

      if (editingMarca) {
        await marcaService.update(editingMarca.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          logo: formData.logo,
          color: formData.color,
          imagenUrl: formData.imagenUrl,
        })
      } else {
        marcaId = await marcaService.create({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          logo: formData.logo,
          color: formData.color,
          imagenUrl: formData.imagenUrl,
        })
      }

      if (selectedImage && marcaId) {
        const url = await cloudinaryService.uploadImage(selectedImage)
        await marcaService.update(marcaId, { imagenUrl: url })
      }

      setOpenDialog(false)
      cargarMarcas()
    } catch (error) {
      console.error('Error guardando marca:', error)
    }
  }

  const totalProductos = marcas.reduce((sum, m) => sum + (m.productoCount || 0), 0)
  const marcasConProductos = marcas.filter(m => (m.productoCount || 0) > 0).length

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
              Marcas
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gestiona las marcas de tus productos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nueva Marca
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Marcas" value={marcas.length} icon={<BrandingWatermark />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Con Productos" value={marcasConProductos} icon={<CheckCircle />} color={theme.palette.success.main} delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Productos" value={totalProductos} icon={<Inventory />} color={theme.palette.warning.main} delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Promedio x Marca" value={marcas.length > 0 ? Math.round(totalProductos / marcas.length) : 0} icon={<TrendingUp />} color={theme.palette.info.main} delay={400} />
        </Grid>
      </Grid>

      {/* Filtros y búsqueda */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Todas" />
          <Tab label="Con productos" />
          <Tab label="Sin productos" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar marca por nombre..."
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
        </Box>
      </Paper>

      {/* Lista de marcas */}
      {filtered.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <BrandingWatermark sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay marcas registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea marcas para organizar tus productos
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Crear primera marca
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((marca) => (
            <MarcaCard
              key={marca.id}
              marca={marca}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Grid>
      )}

      {/* Diálogo de creación/edición */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingMarca ? 'Editar Marca' : 'Nueva Marca'}
          <IconButton onClick={() => setOpenDialog(false)}><Close /></IconButton>
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
                overflow: 'hidden',
              }}
            >
              {previewImage ? (
                <img src={previewImage} alt="Marca" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                formData.logo
              )}
            </Avatar>
          </Box>

          <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
            Subir logo / imagen
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setSelectedImage(file)
                if (file) {
                  const url = URL.createObjectURL(file)
                  setPreviewImage(url)
                }
              }}
            />
          </Button>

          {previewImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img src={previewImage} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 16 }} />
            </Box>
          )}

          <TextField
            fullWidth
            label="Nombre de la marca *"
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
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {coloresMarca.map((color) => (
              <Avatar
                key={color.valor}
                sx={{
                  bgcolor: color.valor,
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  border: formData.color === color.valor ? `3px solid ${theme.palette.primary.main}` : 'none',
                  '&:hover': { opacity: 0.8 },
                }}
                onClick={() => setFormData({ ...formData, color: color.valor })}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>Logo / Ícono</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {logosMarca.map((logo) => (
              <Avatar
                key={logo.nombre}
                sx={{
                  bgcolor: alpha(formData.color, 0.1),
                  color: formData.color,
                  width: 44,
                  height: 44,
                  cursor: 'pointer',
                  fontSize: 24,
                  border: formData.logo === logo.icono ? `2px solid ${formData.color}` : 'none',
                  '&:hover': { opacity: 0.8 },
                }}
                onClick={() => setFormData({ ...formData, logo: logo.icono })}
              >
                {logo.icono}
              </Avatar>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingMarca ? 'Guardar Cambios' : 'Crear Marca'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}