import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, TextField, Button, Grid, Alert, CircularProgress, Divider, InputAdornment, Autocomplete } from '@mui/material'
import { Save, ArrowBack } from '@mui/icons-material'
import { productoService } from '../../../services/productoService'
import { categoriaService } from '../../../services/categoriaService'
import { marcaService } from '../../../services/marcaService'
import { firebaseStorageService } from '../../../services/firebaseStorageService'
import { localImageService } from '../../../services/localImageService'
import { Categoria } from '../../../types/categoria.types'
import { Marca } from '../../../types/marca.types'
import { ProductoFormData } from '../../../types/producto.types'

const initialData: ProductoFormData = { codigo: '', nombre: '', descripcion: '', precioCompra: 0, precioVenta: 0, stockActual: 0, stockMinimo: 5, categoria: '', marca: '', imagenUrl: '', imagenes: [] }

export const FormularioProducto = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const isEditing = !!id

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  useEffect(() => {
    const unsubscribeCategorias = categoriaService.subscribeAll((data) => {
      setCategorias(data)
    }, console.error)

    const unsubscribeMarcas = marcaService.subscribeAll((data) => {
      setMarcas(data)
    }, console.error)

    if (isEditing) cargar()

    return () => {
      unsubscribeCategorias()
      unsubscribeMarcas()
    }
  }, [id])

  const handleCategoriaInputChange = (_event: React.SyntheticEvent, value: string) => {
    setFormData(prev => ({ ...prev, categoria: value }))
  }

  const cargar = async () => {
    setLoading(true)
    try {
      const p = await productoService.getById(id!)
      if (p) setFormData({
        codigo: p.codigo,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precioCompra: p.precioCompra,
        precioVenta: p.precioVenta,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
        categoria: p.categoria,
        marca: p.marca,
        imagenUrl: p.imagenUrl || '',
        imagenes: p.imagenes || [],
      })
    } catch (e) {
      setError('Error cargando')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.name.includes('precio') || e.target.name.includes('stock') ? parseFloat(e.target.value) || 0 : e.target.value }))
  const handleMarcaInputChange = (_event: React.SyntheticEvent, value: string) => {
    setFormData(prev => ({ ...prev, marca: value }))
  }

  const uploadSelectedImages = async (productId: string, existingImages: string[] = []) => {
    if (selectedFiles.length === 0) return existingImages
    try {
      // Prefer local server upload when available
      const urls = await localImageService.uploadProductImages(productId, selectedFiles)
      return [...existingImages, ...urls]
    } catch (e) {
      // Fallback to firebase if local upload fails
      const urls = await firebaseStorageService.uploadProductImages(productId, selectedFiles)
      return [...existingImages, ...urls]
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.codigo.trim()) { setError('Código obligatorio'); return }
    if (!formData.nombre.trim()) { setError('Nombre obligatorio'); return }
    if (formData.precioCompra <= 0) { setError('Precio compra > 0'); return }
    if (formData.precioVenta <= 0) { setError('Precio venta > 0'); return }
    if (formData.precioVenta < formData.precioCompra) { setError('Precio venta no puede ser menor al de compra'); return }

    setSaving(true)
    setError('')

    try {
      if (isEditing) {
        const uploadedImages = await uploadSelectedImages(id!, formData.imagenes || [])
        await productoService.update(id!, {
          ...formData,
          imagenes: uploadedImages,
          imagenUrl: uploadedImages[0] || formData.imagenUrl,
        })
      } else {
        const newId = await productoService.create(formData)
        const uploadedImages = await uploadSelectedImages(newId, [])
        if (uploadedImages.length > 0) {
          await productoService.update(newId, {
            imagenes: uploadedImages,
            imagenUrl: uploadedImages[0],
          })
        }
      }
      navigate('/productos')
    } catch (e) {
      setError('Error guardando')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  return (<Box><Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}><Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/productos')}>Volver</Button><Typography variant="h4" fontWeight="bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</Typography></Box><Paper sx={{ p: 3 }}>{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}<form onSubmit={handleSubmit}><Grid container spacing={3}><Grid item xs={12}><Typography variant="h6">Información Básica</Typography><Divider sx={{ mb: 2 }} /></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Código *" name="codigo" value={formData.codigo} onChange={handleChange} required helperText="Código único" /></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Nombre *" name="nombre" value={formData.nombre} onChange={handleChange} required /></Grid><Grid item xs={12}><TextField fullWidth label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleChange} multiline rows={3} /></Grid><Grid item xs={12} md={6}>
              <Autocomplete
              fullWidth
              freeSolo
              options={categorias.map((categoria) => categoria.nombre)}
              value={formData.categoria}
              onInputChange={handleCategoriaInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoría"
                  helperText={categorias.length > 0 ? 'Escribe o selecciona una categoría' : 'Escribe una categoría nueva'}
                />
              )}
            />
          </Grid><Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              freeSolo
              options={marcas.map((marca) => marca.nombre)}
              value={formData.marca}
              onInputChange={handleMarcaInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Marca"
                  helperText="Escribe la marca o selecciona una existente"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="outlined" component="label" fullWidth>
              Seleccionar imágenes
              <input hidden accept="image/*" multiple type="file" onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : []
                setSelectedFiles(files)
                setPreviewUrls(files.map(file => URL.createObjectURL(file)))
              }} />
            </Button>
            {(previewUrls.length > 0 || (formData.imagenes && formData.imagenes.length > 0)) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {previewUrls.map((url, index) => (
                  <Box key={index} sx={{ width: 84, height: 84, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
                {previewUrls.length === 0 && formData.imagenes?.map((url, index) => (
                  <Box key={`existing-${index}`} sx={{ width: 84, height: 84, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <img src={url} alt={`existing-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
          <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Precios</Typography><Divider sx={{ mb: 2 }} /></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Precio de Compra *" name="precioCompra" type="number" value={formData.precioCompra} onChange={handleChange} required InputProps={{ startAdornment: <InputAdornment position="start">S/</InputAdornment> }} /></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Precio de Venta *" name="precioVenta" type="number" value={formData.precioVenta} onChange={handleChange} required InputProps={{ startAdornment: <InputAdornment position="start">S/</InputAdornment> }} /></Grid><Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Inventario</Typography><Divider sx={{ mb: 2 }} /></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Stock Actual" name="stockActual" type="number" value={formData.stockActual} onChange={handleChange} InputProps={{ inputProps: { min: 0 } }} /></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Stock Mínimo" name="stockMinimo" type="number" value={formData.stockMinimo} onChange={handleChange} helperText="Alerta cuando baje de este número" InputProps={{ inputProps: { min: 0 } }} /></Grid><Grid item xs={12}><Divider sx={{ my: 2 }} /><Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}><Button variant="outlined" onClick={() => navigate('/productos')} disabled={saving}>Cancelar</Button><Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Producto'}</Button></Box></Grid></Grid></form></Paper></Box>)
}