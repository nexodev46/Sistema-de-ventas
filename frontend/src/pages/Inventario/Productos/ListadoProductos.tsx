import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Dialog,
  DialogContent,
} from '@mui/material'
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  FilterList,
  Star,
  Inventory,
  AttachMoney,
  Category,
  MoreVert,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { productoService } from '../../../services/productoService'
import { Producto } from '../../../types/producto.types'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SkeletonProductCardGrid } from '../../../components/Common/SkeletonProductCard'
import { isValidImageUrl } from '../../../utils/validators'

// Componente de tarjeta de producto animada
const ProductCard = ({ producto, onEdit, onDelete, onView }: any) => {
  const theme = useTheme()
  const [elevation, setElevation] = useState(1)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openImagePreview, setOpenImagePreview] = useState(false)

  const getStockColor = () => {
    if (producto.stockActual === 0) return 'error'
    if (producto.stockActual <= producto.stockMinimo) return 'warning'
    return 'success'
  }

  const getStockText = () => {
    if (producto.stockActual === 0) return 'Agotado'
    if (producto.stockActual <= producto.stockMinimo) return 'Stock bajo'
    return 'En stock'
  }

  const imageUrl = isValidImageUrl(producto.imagenes?.[0])
    ? producto.imagenes?.[0]
    : isValidImageUrl(producto.imagenUrl)
    ? producto.imagenUrl
    : ''

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -8 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            boxShadow: elevation,
            '&:hover': {
              boxShadow: theme.shadows[12],
            },
            position: 'relative',
            overflow: 'visible',
          }}
          onMouseEnter={() => setElevation(8)}
          onMouseLeave={() => setElevation(1)}
        >
          {/* Badge de stock */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {producto.oferta && (
              <Chip
                label="Oferta"
                size="small"
                color="secondary"
                sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.secondary.main, 0.2) }}
              />
            )}
            {producto.destacado && (
              <Chip
                label="Destacado"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 'bold', color: theme.palette.warning.main, borderColor: alpha(theme.palette.warning.main, 0.4), bgcolor: alpha(theme.palette.warning.light, 0.15) }}
              />
            )}
          </Box>
          <Chip
            label={getStockText()}
            size="small"
            color={getStockColor()}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
              fontWeight: 'bold',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Imagen del producto */}
          <Box
            sx={{
              position: 'relative',
              pt: '100%',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              overflow: 'hidden',
            }}
          >
            {imageUrl ? (
              <CardMedia
                component="img"
                image={imageUrl}
                alt={producto.nombre}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <ImageIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.5) }} />
              </Box>
            )}
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            {/* Código y categoría */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Chip
                label={producto.codigo}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10, height: 20 }}
              />
              {producto.categoria && (
                <Chip
                  label={producto.categoria}
                  size="small"
                  variant="filled"
                  sx={{ fontSize: 10, height: 20, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                />
              )}
            </Box>

            {/* Nombre */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: 48,
              }}
            >
              {producto.nombre}
            </Typography>

            {/* Precios */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                S/ {producto.precioVenta.toLocaleString()}
              </Typography>
              {producto.precioCompra < producto.precioVenta && (
                <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  S/ {producto.precioCompra.toLocaleString()}
                </Typography>
              )}
            </Box>

            {/* Stock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Inventory sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Stock: {producto.stockActual} unidades
              </Typography>
              {producto.stockActual <= producto.stockMinimo && (
                <Typography variant="caption" color="warning.main">
                  (Mínimo: {producto.stockMinimo})
                </Typography>
              )}
            </Box>

            {/* Descripción corta */}
            {producto.descripcion && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: 12,
                }}
              >
                {producto.descripcion}
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Ver imagen">
                <IconButton size="small" onClick={() => setOpenImagePreview(true)} sx={{ color: theme.palette.info.main }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(producto.id)} sx={{ color: theme.palette.warning.main }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Tooltip title="Más opciones">
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </CardActions>

          {/* Menú de opciones */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            TransitionComponent={Fade}
          >
            <MenuItem onClick={() => { onEdit(producto.id); setAnchorEl(null); }}>
              <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
            </MenuItem>
            <MenuItem onClick={() => { onView(producto.id); setAnchorEl(null); }}>
              <Visibility fontSize="small" sx={{ mr: 1 }} /> Ver detalles
            </MenuItem>
            <MenuItem onClick={() => { onDelete(producto.id, producto.nombre); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
              <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
            </MenuItem>
          </Menu>

          {/* Dialog de preview de imagen */}
          <Dialog
            open={openImagePreview}
            onClose={() => setOpenImagePreview(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                bgcolor: 'background.paper',
              },
            }}
          >
            <Box sx={{ position: 'relative', p: 0 }}>
              <IconButton
                onClick={() => setOpenImagePreview(false)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              {imageUrl ? (
                <Box
                  component="img"
                  src={imageUrl}
                  alt={producto.nombre}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                  <ImageIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
                  <Typography color="text.secondary">No hay imagen disponible</Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </Card>
      </motion.div>
    </Grid>
  )
}

export const ListadoProductos = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtered, setFiltered] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = productoService.subscribeAll((data) => {
      setProductos(data)
      setFiltered(data)
      const cats = [...new Set(data.map(p => p.categoria).filter(c => c))]
      setCategories(cats)
      setLoading(false)
    }, console.error)

    return () => unsubscribe()
  }, [])

  useEffect(() => { filtrarProductos() }, [search, productos, selectedCategory])

  const filtrarProductos = () => {
    let result = productos
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        (p.categoria && p.categoria.toLowerCase().includes(term))
      )
    }
    if (selectedCategory) {
      result = result.filter(p => p.categoria === selectedCategory)
    }
    setFiltered(result)
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar el producto "${nombre}"?`)) {
      await productoService.delete(id)
    }
  }

  const handleEdit = (id: string) => navigate(`/productos/editar/${id}`)
  const handleView = (id: string) => navigate(`/productos/${id}`)

  const totalStock = productos.reduce((sum, p) => sum + p.stockActual, 0)
  const bajoStock = productos.filter(p => p.stockActual <= p.stockMinimo).length
  const valorInventario = productos.reduce((sum, p) => sum + (p.precioCompra * p.stockActual), 0)

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
        <SkeletonProductCardGrid count={8} />
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
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Productos
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Gestiona tu catálogo de productos naturales
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in style={{ transitionDelay: '100ms' }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Productos</Typography>
                    <Typography variant="h3" fontWeight="bold">{productos.length}</Typography>
                  </Box>
                  <Category sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in style={{ transitionDelay: '200ms' }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Unidades en Stock</Typography>
                    <Typography variant="h3" fontWeight="bold">{totalStock}</Typography>
                  </Box>
                  <Inventory sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in style={{ transitionDelay: '300ms' }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Stock Bajo</Typography>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">{bajoStock}</Typography>
                  </Box>
                  <Star sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in style={{ transitionDelay: '400ms' }}>
            <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Valor Inventario</Typography>
                    <Typography variant="h3" fontWeight="bold">S/ {valorInventario.toLocaleString()}</Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Barra de herramientas */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar productos por nombre, código o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={(e) => setFilterAnchor(e.currentTarget)}
            >
              {selectedCategory || 'Filtrar por categoría'}
            </Button>
            <Menu
              anchorEl={filterAnchor}
              open={Boolean(filterAnchor)}
              onClose={() => setFilterAnchor(null)}
            >
              <MenuItem onClick={() => { setSelectedCategory(''); setFilterAnchor(null); }}>
                Todas las categorías
              </MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} onClick={() => { setSelectedCategory(cat); setFilterAnchor(null); }}>
                  {cat}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/productos/nuevo')}
              sx={{
                borderRadius: 2,
                py: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Nuevo Producto
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Vista de productos (Grid o Lista) */}
      {filtered.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Inventory sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay productos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comienza agregando tu primer producto
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/productos/nuevo')}
          >
            Agregar Producto
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </Grid>
      )}
    </Box>
  )
}