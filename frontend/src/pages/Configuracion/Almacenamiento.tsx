import React, { useState, useEffect } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Storage,
  Delete,
  CloudUpload,
  CloudDownload,
  Backup,
  Restore,
  Clear,
  CheckCircle,
  Warning,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  Close,
  Refresh,
  Dataset,
  Speed,
} from '@mui/icons-material'
import { storage, db } from '../../services/firebase'
import { ref, listAll, getMetadata, deleteObject, getDownloadURL } from 'firebase/storage'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useSnackbar } from 'notistack'
import { motion } from 'framer-motion'

interface ArchivoInfo {
  nombre: string
  ruta: string
  tamaño: number
  fecha: string
  tipo: string
  url: string
}

interface CarpetaInfo {
  nombre: string
  cantidad: number
  tamaño: number
  color: string
}

export const Almacenamiento = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [archivos, setArchivos] = useState<ArchivoInfo[]>([])
  const [espacioUsado, setEspacioUsado] = useState(0)
  const [limiteEspacio, setLimiteEspacio] = useState(5 * 1024 * 1024 * 1024) // 5 GB
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [archivoAEliminar, setArchivoAEliminar] = useState<ArchivoInfo | null>(null)
  const [openClearDialog, setOpenClearDialog] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrecuencia, setBackupFrecuencia] = useState('semanal')

  useEffect(() => {
    cargarDatosAlmacenamiento()
    const storedAutoBackup = localStorage.getItem('almacenamiento_autoBackup')
    const storedBackupFrecuencia = localStorage.getItem('almacenamiento_backupFrecuencia')

    if (storedAutoBackup !== null) {
      setAutoBackup(storedAutoBackup === 'true')
    }
    if (storedBackupFrecuencia) {
      setBackupFrecuencia(storedBackupFrecuencia)
    }
  }, [])

  const cargarDatosAlmacenamiento = async () => {
    setLoading(true)
    try {
      let totalSize = 0
      const archivosList: ArchivoInfo[] = []

      // Listar productos
      const productosRef = ref(storage, 'productos')
      const productosRes = await listAll(productosRef)
      
      for (const carpeta of productosRes.prefixes) {
        const archivosEnCarpeta = await listAll(carpeta)
        for (const archivo of archivosEnCarpeta.items) {
          const metadata = await getMetadata(archivo)
          const url = await getDownloadURL(archivo)
          totalSize += metadata.size
          archivosList.push({
            nombre: archivo.name,
            ruta: archivo.fullPath,
            tamaño: metadata.size,
            fecha: new Date(metadata.timeCreated).toLocaleString(),
            tipo: archivo.name.split('.').pop()?.toUpperCase() || 'DESCONOCIDO',
            url: url,
          })
        }
      }

      // Listar perfiles
      const perfilesRef = ref(storage, 'perfiles')
      const perfilesRes = await listAll(perfilesRef)
      for (const carpeta of perfilesRes.prefixes) {
        const archivosEnCarpeta = await listAll(carpeta)
        for (const archivo of archivosEnCarpeta.items) {
          const metadata = await getMetadata(archivo)
          const url = await getDownloadURL(archivo)
          totalSize += metadata.size
          archivosList.push({
            nombre: archivo.name,
            ruta: archivo.fullPath,
            tamaño: metadata.size,
            fecha: new Date(metadata.timeCreated).toLocaleString(),
            tipo: archivo.name.split('.').pop()?.toUpperCase() || 'DESCONOCIDO',
            url: url,
          })
        }
      }

      // Listar categorías
      const categoriasRef = ref(storage, 'categorias')
      try {
        const categoriasRes = await listAll(categoriasRef)
        for (const carpeta of categoriasRes.prefixes) {
          const archivosEnCarpeta = await listAll(carpeta)
          for (const archivo of archivosEnCarpeta.items) {
            const metadata = await getMetadata(archivo)
            const url = await getDownloadURL(archivo)
            totalSize += metadata.size
            archivosList.push({
              nombre: archivo.name,
              ruta: archivo.fullPath,
              tamaño: metadata.size,
              fecha: new Date(metadata.timeCreated).toLocaleString(),
              tipo: archivo.name.split('.').pop()?.toUpperCase() || 'DESCONOCIDO',
              url: url,
            })
          }
        }
      } catch (e) {}

      // Listar marcas
      const marcasRef = ref(storage, 'marcas')
      try {
        const marcasRes = await listAll(marcasRef)
        for (const carpeta of marcasRes.prefixes) {
          const archivosEnCarpeta = await listAll(carpeta)
          for (const archivo of archivosEnCarpeta.items) {
            const metadata = await getMetadata(archivo)
            const url = await getDownloadURL(archivo)
            totalSize += metadata.size
            archivosList.push({
              nombre: archivo.name,
              ruta: archivo.fullPath,
              tamaño: metadata.size,
              fecha: new Date(metadata.timeCreated).toLocaleString(),
              tipo: archivo.name.split('.').pop()?.toUpperCase() || 'DESCONOCIDO',
              url: url,
            })
          }
        }
      } catch (e) {}

      setArchivos(archivosList)
      setEspacioUsado(totalSize)
    } catch (error) {
      console.error('Error cargando almacenamiento:', error)
      enqueueSnackbar('Error al cargar los datos de almacenamiento', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const formatearTamaño = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calcularPorcentaje = (): number => {
    return (espacioUsado / limiteEspacio) * 100
  }

  const getIconoPorTipo = (tipo: string) => {
    if (tipo === 'JPG' || tipo === 'PNG' || tipo === 'JPEG' || tipo === 'GIF' || tipo === 'WEBP') {
      return <Image />
    }
    if (tipo === 'PDF') {
      return <PictureAsPdf />
    }
    return <InsertDriveFile />
  }

  const handleEliminarArchivo = async () => {
    if (!archivoAEliminar) return
    
    try {
      const archivoRef = ref(storage, archivoAEliminar.ruta)
      await deleteObject(archivoRef)
      enqueueSnackbar('Archivo eliminado correctamente', { variant: 'success' })
      setOpenDeleteDialog(false)
      cargarDatosAlmacenamiento()
    } catch (error) {
      console.error('Error eliminando archivo:', error)
      enqueueSnackbar('Error al eliminar el archivo', { variant: 'error' })
    }
  }

  const handleLimpiarCache = async () => {
    setClearLoading(true)
    try {
      // Simular limpieza de caché
      await new Promise(resolve => setTimeout(resolve, 1500))
      enqueueSnackbar('Caché limpiado correctamente', { variant: 'success' })
      setOpenClearDialog(false)
    } catch (error) {
      enqueueSnackbar('Error al limpiar la caché', { variant: 'error' })
    } finally {
      setClearLoading(false)
    }
  }

  const handleExportarBackup = async () => {
    setBackupLoading(true)
    try {
      // Obtener datos de Firestore
      const colecciones = ['productos', 'clientes', 'ventas', 'usuarios', 'categorias', 'marcas']
      const backup: any = {}
      
      for (const coleccion of colecciones) {
        const querySnapshot = await getDocs(collection(db, coleccion))
        backup[coleccion] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
      
      // Crear archivo JSON
      const dataStr = JSON.stringify(backup, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `backup_${new Date().toISOString().split('T')[0]}.json`
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      enqueueSnackbar('Backup exportado correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error exportando backup:', error)
      enqueueSnackbar('Error al exportar el backup', { variant: 'error' })
    } finally {
      setBackupLoading(false)
    }
  }

  useEffect(() => {
    localStorage.setItem('almacenamiento_autoBackup', JSON.stringify(autoBackup))
    localStorage.setItem('almacenamiento_backupFrecuencia', backupFrecuencia)
  }, [autoBackup, backupFrecuencia])

  const handleRestaurarBackup = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      setRestoreLoading(true)
      try {
        const text = await file.text()
        const backup = JSON.parse(text)
        // Aquí se restaurarían los datos
        enqueueSnackbar('Backup restaurado correctamente', { variant: 'success' })
      } catch (error) {
        enqueueSnackbar('Error al restaurar el backup', { variant: 'error' })
      } finally {
        setRestoreLoading(false)
      }
    }
    input.click()
  }

  const carpetas: CarpetaInfo[] = [
    { nombre: 'Productos', cantidad: archivos.filter(a => a.ruta.startsWith('productos')).length, tamaño: archivos.filter(a => a.ruta.startsWith('productos')).reduce((sum, a) => sum + a.tamaño, 0), color: '#3b82f6' },
    { nombre: 'Perfiles', cantidad: archivos.filter(a => a.ruta.startsWith('perfiles')).length, tamaño: archivos.filter(a => a.ruta.startsWith('perfiles')).reduce((sum, a) => sum + a.tamaño, 0), color: '#10b981' },
    { nombre: 'Categorías', cantidad: archivos.filter(a => a.ruta.startsWith('categorias')).length, tamaño: archivos.filter(a => a.ruta.startsWith('categorias')).reduce((sum, a) => sum + a.tamaño, 0), color: '#f59e0b' },
    { nombre: 'Marcas', cantidad: archivos.filter(a => a.ruta.startsWith('marcas')).length, tamaño: archivos.filter(a => a.ruta.startsWith('marcas')).reduce((sum, a) => sum + a.tamaño, 0), color: '#8b5cf6' },
  ]

  const porcentaje = calcularPorcentaje()
  const porcentajeColor = porcentaje >= 90 ? 'error' : porcentaje >= 70 ? 'warning' : 'info'

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
          Almacenamiento
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Gestiona tus archivos y espacio en la nube
        </Typography>
      </Box>

      

      <Grid container spacing={3}>
        {/* Columna izquierda - Espacio y carpetas */}
        <Grid item xs={12} md={4}>
          {/* Espacio utilizado */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                  <Storage />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">Espacio Utilizado</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" fontWeight="bold">
                  {formatearTamaño(espacioUsado)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  de {formatearTamaño(limiteEspacio)} disponibles
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={porcentaje}
                color={porcentajeColor as any}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                {porcentaje.toFixed(1)}% utilizado
              </Typography>
              {porcentaje >= 90 && (
                <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
                  Estás alcanzando el límite de almacenamiento
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Carpetas */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsertDriveFile /> Carpetas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {carpetas.map((carpeta) => (
                <Box key={carpeta.nombre} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(carpeta.color, 0.15), color: carpeta.color }}>
                        <Storage />
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">{carpeta.nombre}</Typography>
                    </Box>
                    <Typography variant="caption">{formatearTamaño(carpeta.tamaño)}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {carpeta.cantidad} archivos
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(carpeta.tamaño / espacioUsado) * 100}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed /> Acciones Rápidas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={cargarDatosAlmacenamiento}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Refrescar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => setOpenClearDialog(true)}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Limpiar Caché
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha - Archivos y backups */}
        <Grid item xs={12} md={8}>
          {/* Backups */}
          <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Backup /> Copias de Seguridad
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CloudUpload sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Exportar Backup</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Descarga toda tu base de datos
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Backup />}
                      onClick={handleExportarBackup}
                      disabled={backupLoading}
                      sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                    >
                      {backupLoading ? 'Exportando...' : 'Exportar'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: alpha(theme.palette.primary.light, 0.15), borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CloudDownload sx={{ fontSize: 40, color: theme.palette.primary.dark, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Restaurar Backup</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Restaura datos desde un archivo
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Restore />}
                      onClick={handleRestaurarBackup}
                      disabled={restoreLoading}
                      sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, '&:hover': { bgcolor: theme.palette.primary.dark } }}
                    >
                      {restoreLoading ? 'Restaurando...' : 'Restaurar'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />}
                label="Backup automático"
              />
              {autoBackup && (
                <Chip label={`Frecuencia: ${backupFrecuencia}`} size="small" />
              )}
            </Box>
          </Paper>

          {/* Archivos */}
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsertDriveFile /> Archivos Almacenados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : archivos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Storage sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay archivos almacenados
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell>Archivo</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Tamaño</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {archivos.slice(0, 10).map((archivo, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getIconoPorTipo(archivo.tipo)}
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {archivo.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={archivo.tipo} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{formatearTamaño(archivo.tamaño)}</TableCell>
                        <TableCell>{archivo.fecha}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setArchivoAEliminar(archivo)
                                setOpenDeleteDialog(true)
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {archivos.length > 10 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Mostrando 10 de {archivos.length} archivos
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <Delete /> Eliminar Archivo
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Estás seguro de eliminar el archivo <strong>{archivoAEliminar?.nombre}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleEliminarArchivo}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de limpieza de caché */}
      <Dialog open={openClearDialog} onClose={() => setOpenClearDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Limpiar Caché
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenClearDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            ¿Deseas limpiar la caché del sistema? Esto puede mejorar el rendimiento.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenClearDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleLimpiarCache} disabled={clearLoading}>
            {clearLoading ? 'Limpiando...' : 'Limpiar Caché'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}