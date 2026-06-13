import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { alpha, Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography, useTheme } from '@mui/material'
import { ArrowBack, Inventory, LocalOffer, Category, ShoppingCart } from '@mui/icons-material'
import { productoService } from '../../../services/productoService'
import { Producto } from '../../../types/producto.types'

export const DetalleProducto = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) {
        setError('ID de producto inválido.')
        setLoading(false)
        return
      }

      try {
        const result = await productoService.getById(id)
        if (!result) {
          setError('No se encontró el producto solicitado.')
        } else {
          setProducto(result)
        }
      } catch (e) {
        console.error('Error cargando producto:', e)
        setError('Ocurrió un error al cargar los detalles del producto.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducto()
  }, [id])

  const imageUrls = producto ? [producto.imagenUrl, ...(producto.imagenes || [])].filter(Boolean) as string[] : []
  const mainImage = imageUrls[0] || ''

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/productos')}
        sx={{ mb: 3, borderRadius: 2 }}
        variant="outlined"
      >
        Volver a Productos
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            Detalles de producto
          </Typography>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : producto ? (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {producto.nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualiza la información completa de este producto y sus imágenes.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
                {mainImage ? (
                  <CardMedia
                    component="img"
                    image={mainImage}
                    alt={producto.nombre}
                    sx={{ width: '100%', height: 420, objectFit: 'contain', bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 420,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <Inventory sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.4) }} />
                  </Box>
                )}

                {imageUrls.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ p: 2, overflowX: 'auto' }}>
                    {imageUrls.map((url, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={url}
                        alt={`${producto.nombre} ${index + 1}`}
                        sx={{
                          width: 88,
                          height: 88,
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: 'background.paper',
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Información del producto
                </Typography>
                <Stack spacing={2}>
                  <Typography>
                    <strong>Código:</strong> {producto.codigo}
                  </Typography>
                  <Typography>
                    <strong>Marca:</strong> {producto.marca || 'Sin marca'}
                  </Typography>
                  <Typography>
                    <strong>Categoría:</strong> {producto.categoria || 'Sin categoría'}
                  </Typography>
                  <Typography>
                    <strong>Precio de venta:</strong> S/ {producto.precioVenta.toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Precio de compra:</strong> S/ {producto.precioCompra.toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Stock actual:</strong> {producto.stockActual} unidades
                  </Typography>
                  <Typography>
                    <strong>Stock mínimo:</strong> {producto.stockMinimo} unidades
                  </Typography>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Descripción
                </Typography>
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {producto.descripcion || 'No se proporcionó una descripción para este producto.'}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                  <Grid item>
                    <Chip
                      icon={<LocalOffer />}
                      label={producto.categoria || 'Categoría no asignada'}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      icon={<Category />}
                      label={producto.marca || 'Marca no asignada'}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      icon={<ShoppingCart />}
                      label={`Stock ${producto.stockActual}`}
                      color={producto.stockActual <= producto.stockMinimo ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : null}
    </Box>
  )
}
