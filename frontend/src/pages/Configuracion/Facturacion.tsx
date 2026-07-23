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
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Receipt,
  Save,
  Print,
  PictureAsPdf,
  Close,
  Business,
  QrCode,
  Visibility,
} from '@mui/icons-material'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useSnackbar } from 'notistack'
// motion removed (unused)
import { facturaPdfService } from '../../services/facturaPdfService'

// Plantillas de factura
const plantillasFactura = [
  { id: 'classic', nombre: 'Clásica', descripcion: 'Diseño tradicional', color: '#3b82f6' },
  { id: 'modern', nombre: 'Moderna', descripcion: 'Diseño minimalista', color: '#10b981' },
  { id: 'corporate', nombre: 'Corporativa', descripcion: 'Diseño profesional', color: '#8b5cf6' },
]

// Monedas soportadas
const monedas = [
  { id: 'PEN', nombre: 'Sol Peruano', simbolo: 'S/ ', pais: 'Perú' },
  { id: 'USD', nombre: 'Dólar Americano', simbolo: '$ ', pais: 'Estados Unidos' },
  { id: 'EUR', nombre: 'Euro', simbolo: '€ ', pais: 'Unión Europea' },
]

export const Facturacion = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openVistaPrevia, setOpenVistaPrevia] = useState(false)
  const [configuracion, setConfiguracion] = useState({
    empresa: {
      nombre: '',
      ruc: '',
      direccion: '',
      telefono: '',
      email: '',
    },
    factura: {
      serie: 'F001',
      numeroInicial: 1,
      siguienteNumero: 1,
      iva: 18,
      ivaNombre: 'IGV',
      moneda: 'PEN',
      plantilla: 'classic',
      incluirIgv: true,
      mostrarQr: true,
      piePagina: '¡Gracias por su compra!',
      terminos: 'Los productos tienen garantía de 30 días',
    },
    formatos: {
      decimales: 2,
      separadorMiles: ',',
      separadorDecimal: '.',
    },
  })

  // removed unused nuevaSerie state

  useEffect(() => {
    const unsubscribe = cargarConfiguracion()
    return () => unsubscribe?.()
  }, [])

  const handleExportarPdfPrueba = async () => {
    try {
      const ventaPrueba = {
        id: '1',
        numero: `${configuracion.factura.serie}-${String(configuracion.factura.siguienteNumero).padStart(8, '0')}`,
        fecha: new Date().toLocaleDateString('es-PE'),
        cliente: {
          id: '1',
          nombre: 'Cliente de Prueba',
          documento: '12345678901',
          email: 'cliente@example.com',
          telefono: '+51999999999',
        },
        productos: [
          {
            id: '1',
            codigo: 'PROD001',
            nombre: 'Producto de ejemplo',
            precio: 100,
            cantidad: 1,
            subtotal: 100,
          },
        ],
        items: [
          {
            nombre: 'Producto de ejemplo',
            cantidad: 1,
            precio: 100,
          },
        ],
        subtotal: 100,
        igv: configuracion.factura.incluirIgv ? (100 * configuracion.factura.iva) / 100 : 0,
        total: configuracion.factura.incluirIgv ? 100 + (100 * configuracion.factura.iva) / 100 : 100,
        metodoPago: 'EFECTIVO',
        estado: 'COMPLETADA',
        vendedor: {
          id: user?.id || '1',
          nombre: user?.nombre || 'Vendedor',
        },
      } as any

      const monedaInfo = getMonedaInfo(configuracion.factura.moneda)
      const configConSimbolo = {
        ...configuracion,
        factura: {
          ...configuracion.factura,
          simbolo: monedaInfo.simbolo,
        },
      }

      await facturaPdfService.descargarFactura(
        ventaPrueba,
        configConSimbolo as any,
        `${configuracion.factura.serie}-${String(configuracion.factura.siguienteNumero).padStart(8, '0')}`
      )
      enqueueSnackbar('PDF de prueba descargado exitosamente', { variant: 'success' })
    } catch (error) {
      console.error('Error descargando PDF de prueba:', error)
      enqueueSnackbar('Error al descargar PDF de prueba', { variant: 'error' })
    }
  }

  const handleImprimirPrueba = async () => {
    try {
      const ventaPrueba = {
        id: '1',
        numero: `${configuracion.factura.serie}-${String(configuracion.factura.siguienteNumero).padStart(8, '0')}`,
        fecha: new Date().toLocaleDateString('es-PE'),
        cliente: {
          id: '1',
          nombre: 'Cliente de Prueba',
          documento: '12345678901',
          email: 'cliente@example.com',
          telefono: '+51999999999',
        },
        productos: [
          {
            id: '1',
            codigo: 'PROD001',
            nombre: 'Producto de ejemplo',
            precio: 100,
            cantidad: 1,
            subtotal: 100,
          },
        ],
        items: [
          {
            nombre: 'Producto de ejemplo',
            cantidad: 1,
            precio: 100,
          },
        ],
        subtotal: 100,
        igv: configuracion.factura.incluirIgv ? (100 * configuracion.factura.iva) / 100 : 0,
        total: configuracion.factura.incluirIgv ? 100 + (100 * configuracion.factura.iva) / 100 : 100,
        metodoPago: 'EFECTIVO',
        estado: 'COMPLETADA',
        vendedor: {
          id: user?.id || '1',
          nombre: user?.nombre || 'Vendedor',
        },
      } as any

      const monedaInfo = getMonedaInfo(configuracion.factura.moneda)
      const configConSimbolo = {
        ...configuracion,
        factura: {
          ...configuracion.factura,
          simbolo: monedaInfo.simbolo,
        },
      }

      await facturaPdfService.imprimirFactura(
        ventaPrueba,
        configConSimbolo as any,
        `${configuracion.factura.serie}-${String(configuracion.factura.siguienteNumero).padStart(8, '0')}`
      )
    } catch (error) {
      console.error('Error imprimiendo factura de prueba:', error)
      enqueueSnackbar('Error al imprimir factura de prueba', { variant: 'error' })
    }
  }

  const cargarConfiguracion = () => {
    setLoading(true)
    const empresaRef = doc(db, 'configuracion', 'empresa')
    const unsubscribe = onSnapshot(
      empresaRef,
      (empresaDoc) => {
        if (empresaDoc.exists()) {
          const data = empresaDoc.data()
          setConfiguracion(prev => ({
            ...prev,
            empresa: {
              nombre: data.nombre || '',
              ruc: data.ruc || '',
              direccion: data.direccion || '',
              telefono: data.telefono || '',
              email: data.email || '',
            },
            factura: {
              ...prev.factura,
              ...data.facturacion,
            },
          }))
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error cargando configuración:', error)
        setLoading(false)
      }
    )
    return unsubscribe
  }

  const guardarConfiguracion = async () => {
    setSaving(true)
    try {
      const empresaRef = doc(db, 'configuracion', 'empresa')
      await updateDoc(empresaRef, {
        facturacion: {
          serie: configuracion.factura.serie,
          numeroInicial: configuracion.factura.numeroInicial,
          siguienteNumero: configuracion.factura.siguienteNumero,
          iva: configuracion.factura.iva,
          ivaNombre: configuracion.factura.ivaNombre,
          moneda: configuracion.factura.moneda,
          plantilla: configuracion.factura.plantilla,
          incluirIgv: configuracion.factura.incluirIgv,
          mostrarQr: configuracion.factura.mostrarQr,
          piePagina: configuracion.factura.piePagina,
          terminos: configuracion.factura.terminos,
        },
      })
      enqueueSnackbar('Configuración guardada correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error guardando configuración:', error)
      enqueueSnackbar('Error al guardar la configuración', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfiguracion(prev => ({
      ...prev,
      factura: {
        ...prev.factura,
        serie: 'F001',
        numeroInicial: 1,
        siguienteNumero: 1,
        iva: 18,
        ivaNombre: 'IGV',
        moneda: 'PEN',
        plantilla: 'classic',
        incluirIgv: true,
        mostrarQr: true,
        piePagina: '¡Gracias por su compra!',
        terminos: 'Los productos tienen garantía de 30 días',
      },
    }))
    enqueueSnackbar('Configuración restablecida', { variant: 'info' })
  }

  const handleResetearNumeracion = () => {
    setConfiguracion(prev => ({
      ...prev,
      factura: {
        ...prev.factura,
        siguienteNumero: prev.factura.numeroInicial,
      },
    }))
    enqueueSnackbar('Numeración reiniciada', { variant: 'success' })
  }

  const getMonedaInfo = (monedaId: string) => {
    return monedas.find(m => m.id === monedaId) || monedas[0]
  }

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
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Facturación
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Configura tus facturas y documentos electrónicos
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Columna izquierda - Configuración */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt /> Configuración de Facturación
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Numeración */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Numeración
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serie"
                  value={configuracion.factura.serie}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, serie: e.target.value.toUpperCase() } }))}
                  placeholder="F001"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Receipt /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número inicial"
                  type="number"
                  value={configuracion.factura.numeroInicial}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, numeroInicial: parseInt(e.target.value) || 1, siguienteNumero: parseInt(e.target.value) || 1 } }))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Próximo número a usar</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {configuracion.factura.serie}-{String(configuracion.factura.siguienteNumero).padStart(8, '0')}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" color="primary" onClick={handleResetearNumeracion} sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}>
                        Reiniciar Numeración
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Impuestos */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Impuestos
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del impuesto"
                  value={configuracion.factura.ivaNombre}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, ivaNombre: e.target.value } }))}
                  placeholder="IGV"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje de impuesto (%)"
                  type="number"
                  value={configuracion.factura.iva}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, iva: parseFloat(e.target.value) || 0 } }))}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracion.factura.incluirIgv}
                      onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, incluirIgv: e.target.checked } }))}
                    />
                  }
                  label="Incluir impuesto en los precios"
                />
              </Grid>
            </Grid>

            {/* Moneda y formato */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Moneda y Formato
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    value={configuracion.factura.moneda}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, moneda: e.target.value } }))}
                    label="Moneda"
                  >
                    {monedas.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.nombre} ({m.simbolo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Decimales"
                  type="number"
                  value={configuracion.formatos.decimales}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, formatos: { ...prev.formatos, decimales: parseInt(e.target.value) || 2 } }))}
                  InputProps={{ inputProps: { min: 0, max: 4 } }}
                />
              </Grid>
            </Grid>

            {/* Plantilla */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Plantilla de Factura
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {plantillasFactura.map((plantilla) => (
                <Grid item xs={12} sm={4} key={plantilla.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: configuracion.factura.plantilla === plantilla.id ? `2px solid ${plantilla.color}` : '1px solid',
                      borderColor: configuracion.factura.plantilla === plantilla.id ? plantilla.color : 'divider',
                      bgcolor: configuracion.factura.plantilla === plantilla.id ? alpha(plantilla.color, 0.05) : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                    }}
                    onClick={() => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, plantilla: plantilla.id } }))}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: alpha(plantilla.color, 0.1), color: plantilla.color }}>
                        <Receipt />
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">{plantilla.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{plantilla.descripcion}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* QR y extras */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Extras
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={configuracion.factura.mostrarQr}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, mostrarQr: e.target.checked } }))}
                />
              }
              label="Mostrar código QR en la factura"
              sx={{ display: 'block', mb: 2 }}
            />

            <TextField
              fullWidth
              label="Pie de página"
              value={configuracion.factura.piePagina}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, piePagina: e.target.value } }))}
              multiline
              rows={2}
              placeholder="¡Gracias por su compra!"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Términos y condiciones"
              value={configuracion.factura.terminos}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, factura: { ...prev.factura, terminos: e.target.value } }))}
              multiline
              rows={2}
              placeholder="Términos de la venta..."
            />

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button variant="outlined" onClick={handleReset} sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}>
                Restablecer
              </Button>
              <Button variant="contained" startIcon={<Save />} onClick={guardarConfiguracion} disabled={saving} sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, '&:hover': { bgcolor: theme.palette.primary.dark } }}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Columna derecha - Vista previa y acciones */}
        <Grid item xs={12} md={5}>
          {/* Vista previa de factura */}
          <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility /> Vista Previa de Factura
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => setOpenVistaPrevia(true)}
            >
              <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">{configuracion.empresa.nombre || 'Mi Empresa'}</Typography>
                  <Chip label="Vista Previa" size="small" color="primary" />
                </Box>
              </Box>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {configuracion.factura.serie}-{String(configuracion.factura.siguienteNumero).padStart(8, '0')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Total: {getMonedaInfo(configuracion.factura.moneda).simbolo}0.00
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click para ver vista previa completa
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<Print />} size="small" onClick={handleImprimirPrueba}>
                Imprimir Prueba
              </Button>
              <Button fullWidth variant="outlined" startIcon={<PictureAsPdf />} size="small" onClick={handleExportarPdfPrueba}>
                PDF de Prueba
              </Button>
            </Box>
          </Paper>

          {/* Datos de la empresa */}
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business /> Datos de Facturación
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Razón Social</Typography>
              <Typography variant="body2" fontWeight="medium">{configuracion.empresa.nombre || 'No registrado'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">RUC</Typography>
              <Typography variant="body2">{configuracion.empresa.ruc || 'No registrado'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Dirección</Typography>
              <Typography variant="body2">{configuracion.empresa.direccion || 'No registrada'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Teléfono</Typography>
              <Typography variant="body2">{configuracion.empresa.telefono || 'No registrado'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body2">{configuracion.empresa.email || 'No registrado'}</Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              Estos datos se utilizan en tus facturas. Puedes editarlos en la sección Empresa.
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de vista previa de factura */}
      <Dialog open={openVistaPrevia} onClose={() => setOpenVistaPrevia(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Vista Previa de Factura
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenVistaPrevia(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3, bgcolor: '#fff', color: '#000' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">{configuracion.empresa.nombre || 'MI EMPRESA'}</Typography>
              <Typography variant="caption" display="block">{configuracion.empresa.ruc || 'RUC: -'}</Typography>
              <Typography variant="caption" display="block">{configuracion.empresa.direccion || 'Dirección'}</Typography>
              <Typography variant="caption" display="block">Tel: {configuracion.empresa.telefono || '-'} | Email: {configuracion.empresa.email || '-'}</Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Factura N°</Typography>
                <Typography variant="body2" fontWeight="bold">{configuracion.factura.serie}-{String(configuracion.factura.siguienteNumero).padStart(8, '0')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Fecha de emisión</Typography>
                <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Cant.</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">P. Unitario</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Producto de ejemplo</TableCell>
                    <TableCell align="right">{getMonedaInfo(configuracion.factura.moneda).simbolo}100.00</TableCell>
                    <TableCell align="right">{getMonedaInfo(configuracion.factura.moneda).simbolo}100.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ width: 250 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{getMonedaInfo(configuracion.factura.moneda).simbolo}100.00</Typography>
                </Box>
                {configuracion.factura.incluirIgv && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{configuracion.factura.ivaNombre} ({configuracion.factura.iva}%)</Typography>
                    <Typography variant="body2">{getMonedaInfo(configuracion.factura.moneda).simbolo}18.00</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" fontWeight="bold">Total</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">{getMonedaInfo(configuracion.factura.moneda).simbolo}118.00</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              {configuracion.factura.piePagina}
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              {configuracion.factura.terminos}
            </Typography>

            {configuracion.factura.mostrarQr && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <QrCode sx={{ fontSize: 60, color: '#000' }} />
              </Box>
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Print />} onClick={handleImprimirPrueba}>Imprimir</Button>
          <Button startIcon={<PictureAsPdf />} variant="contained" onClick={handleExportarPdfPrueba}>Exportar PDF</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}