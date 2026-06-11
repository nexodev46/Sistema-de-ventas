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
  Switch,
  FormControlLabel,
  Slider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material'
import {
  Palette,
  DarkMode,
  LightMode,
  Visibility,
  CheckCircle,
  Brush,
  FormatSize,
  Crop,
  ColorLens,
  DesktopWindows,
  TabletMac,
  PhoneAndroid,
} from '@mui/icons-material'
import { useThemeMode } from '../../contexts/ThemeContext'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { useSidebar } from '../../contexts/SidebarContext'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useSnackbar } from 'notistack'
import { motion } from 'framer-motion'

// Colores predefinidos
const coloresPrimarios = [
  { nombre: 'Azul', valor: '#2563eb' },
  { nombre: 'Verde', valor: '#10b981' },
  { nombre: 'Rojo', valor: '#ef4444' },
  { nombre: 'Naranja', valor: '#f59e0b' },
  { nombre: 'Púrpura', valor: '#8b5cf6' },
  { nombre: 'Rosa', valor: '#ec4899' },
  { nombre: 'Celeste', valor: '#06b6d4' },
  { nombre: 'Gris', valor: '#6b7280' },
]

// Tamaños de fuente
const tamaniosFuente = [
  { nombre: 'Pequeño', valor: 'small', scale: 0.9 },
  { nombre: 'Mediano', valor: 'medium', scale: 1 },
  { nombre: 'Grande', valor: 'large', scale: 1.1 },
  { nombre: 'Extra Grande', valor: 'xlarge', scale: 1.2 },
]

// Densidades de interfaz
const densidades = [
  { nombre: 'Compacta', valor: 'compact', spacing: 1.5 },
  { nombre: 'Estándar', valor: 'standard', spacing: 2 },
  { nombre: 'Holgada', valor: 'comfortable', spacing: 2.5 },
]

// Vistas de Dashboard
const vistasDashboard = [
  { nombre: 'Clásica', valor: 'classic', icono: <DesktopWindows />, descripcion: 'Gráficos principales visibles' },
  { nombre: 'Enfoque en datos', valor: 'data', icono: <Visibility />, descripcion: 'Más tarjetas de estadísticas' },
  { nombre: 'Compacta', valor: 'compact', icono: <Crop />, descripcion: 'Más información en menos espacio' },
]

export const Apariencia = () => {
  const theme = useTheme()
  const { darkMode, toggleDarkMode, setDarkMode } = useThemeMode()
  const { setCollapsed } = useSidebar()
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configuracion, setConfiguracion] = useState({
    modoOscuro: darkMode,
    colorPrimario: '#2563eb',
    tamanioFuente: 'medium',
    densidad: 'standard',
    vistaDashboard: 'classic',
    mostrarIconos: true,
    mostrarAnimaciones: true,
    reducirMovimiento: false,
    sidebarColapsado: false,
  })

  useEffect(() => {
    const unsubscribe = cargarConfiguracion()
    return () => {
      unsubscribe?.()
    }
  }, [])

  const cargarConfiguracion = () => {
    setLoading(true)
    const userRef = doc(db, 'usuarios', user?.id || '')
    const unsubscribe = onSnapshot(
      userRef,
      (userDoc) => {
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.apariencia) {
            const apariencia = {
              modoOscuro: data.apariencia.modoOscuro ?? darkMode,
              colorPrimario: data.apariencia.colorPrimario || '#2563eb',
              tamanioFuente: data.apariencia.tamanioFuente || 'medium',
              densidad: data.apariencia.densidad || 'standard',
              vistaDashboard: data.apariencia.vistaDashboard || 'classic',
              mostrarIconos: data.apariencia.mostrarIconos ?? true,
              mostrarAnimaciones: data.apariencia.mostrarAnimaciones ?? true,
              reducirMovimiento: data.apariencia.reducirMovimiento ?? false,
              sidebarColapsado: data.apariencia.sidebarColapsado ?? false,
            }
            setConfiguracion(apariencia)
            setDarkMode(apariencia.modoOscuro)
            setCollapsed(apariencia.sidebarColapsado)
            document.documentElement.style.setProperty('--primary-color', apariencia.colorPrimario)
          }
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
      const userRef = doc(db, 'usuarios', user?.id || '')
      await updateDoc(userRef, {
        apariencia: {
          modoOscuro: configuracion.modoOscuro,
          colorPrimario: configuracion.colorPrimario,
          tamanioFuente: configuracion.tamanioFuente,
          densidad: configuracion.densidad,
          vistaDashboard: configuracion.vistaDashboard,
          mostrarIconos: configuracion.mostrarIconos,
          mostrarAnimaciones: configuracion.mostrarAnimaciones,
          reducirMovimiento: configuracion.reducirMovimiento,
          sidebarColapsado: configuracion.sidebarColapsado,
        },
      })
      setDarkMode(configuracion.modoOscuro)
      setCollapsed(configuracion.sidebarColapsado)
      document.documentElement.style.setProperty('--primary-color', configuracion.colorPrimario)
      enqueueSnackbar('Configuración guardada correctamente', { variant: 'success' })
    } catch (error) {
      console.error('Error guardando configuración:', error)
      enqueueSnackbar('Error al guardar la configuración', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleColorChange = (color: string) => {
    setConfiguracion(prev => ({ ...prev, colorPrimario: color }))
    document.documentElement.style.setProperty('--primary-color', color)
  }

  const handleReset = () => {
    const defaults = {
      modoOscuro: false,
      colorPrimario: '#2563eb',
      tamanioFuente: 'medium',
      densidad: 'standard',
      vistaDashboard: 'classic',
      mostrarIconos: true,
      mostrarAnimaciones: true,
      reducirMovimiento: false,
      sidebarColapsado: false,
    }
    setConfiguracion(defaults)
    setDarkMode(defaults.modoOscuro)
    setCollapsed(defaults.sidebarColapsado)
    document.documentElement.style.setProperty('--primary-color', defaults.colorPrimario)
    enqueueSnackbar('Configuración restablecida', { variant: 'info' })
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
          Apariencia
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Personaliza la apariencia del sistema a tu gusto
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Columna izquierda - Opciones */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Palette /> Personalización
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Tema Oscuro/Claro */}
            <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {darkMode ? <DarkMode sx={{ fontSize: 32, color: theme.palette.warning.main }} /> : <LightMode sx={{ fontSize: 32, color: theme.palette.warning.main }} />}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">Modo Oscuro / Claro</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cambia la apariencia general del sistema
                      </Typography>
                    </Box>
                  </Box>
                  <Button
              variant="outlined"
              startIcon={darkMode ? <LightMode /> : <DarkMode />}
              onClick={() => {
                const nuevoModo = !darkMode
                setDarkMode(nuevoModo)
                setConfiguracion(prev => ({ ...prev, modoOscuro: nuevoModo }))
              }}
            >
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Color primario */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Color Primario
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {coloresPrimarios.map((color) => (
                <Tooltip key={color.nombre} title={color.nombre}>
                  <Avatar
                    sx={{
                      bgcolor: color.valor,
                      width: 48,
                      height: 48,
                      cursor: 'pointer',
                      border: configuracion.colorPrimario === color.valor ? `3px solid ${theme.palette.common.white}` : 'none',
                      boxShadow: configuracion.colorPrimario === color.valor ? 4 : 1,
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => handleColorChange(color.valor)}
                  />
                </Tooltip>
              ))}
            </Box>

            {/* Tamaño de fuente */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Tamaño de Fuente
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={configuracion.tamanioFuente}
                onChange={(e) => setConfiguracion(prev => ({ ...prev, tamanioFuente: e.target.value }))}
              >
                {tamaniosFuente.map((t) => (
                  <MenuItem key={t.valor} value={t.valor}>{t.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Densidad de interfaz */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Densidad de Interfaz
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={configuracion.densidad}
                onChange={(e) => setConfiguracion(prev => ({ ...prev, densidad: e.target.value }))}
              >
                {densidades.map((d) => (
                  <MenuItem key={d.valor} value={d.valor}>{d.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Vista de Dashboard */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Vista del Dashboard
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {vistasDashboard.map((vista) => (
                <Grid item xs={12} sm={4} key={vista.valor}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: configuracion.vistaDashboard === vista.valor ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                      borderColor: configuracion.vistaDashboard === vista.valor ? 'primary.main' : 'divider',
                      bgcolor: configuracion.vistaDashboard === vista.valor ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                    }}
                    onClick={() => setConfiguracion(prev => ({ ...prev, vistaDashboard: vista.valor }))}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        {vista.icono}
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">{vista.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{vista.descripcion}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Animaciones */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Animaciones
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={configuracion.mostrarAnimaciones}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, mostrarAnimaciones: e.target.checked }))}
                />
              }
              label="Mostrar animaciones"
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={configuracion.reducirMovimiento}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, reducirMovimiento: e.target.checked }))}
                />
              }
              label="Reducir movimiento (accesibilidad)"
              sx={{ display: 'block' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={configuracion.sidebarColapsado}
                  onChange={(e) => {
                    setConfiguracion(prev => ({ ...prev, sidebarColapsado: e.target.checked }))
                    setCollapsed(e.target.checked)
                  }}
                />
              }
              label="Barra lateral colapsada"
              sx={{ display: 'block' }}
            />

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button variant="outlined" onClick={handleReset}>
                Restablecer
              </Button>
              <Button variant="contained" startIcon={<CheckCircle />} onClick={guardarConfiguracion} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Columna derecha - Vista previa */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: 3, p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility /> Vista Previa
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Preview Card */}
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(configuracion.colorPrimario, 0.3)}`,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ bgcolor: alpha(configuracion.colorPrimario, 0.1), p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">Sistema de ventas</Typography>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: configuracion.colorPrimario }}>A</Avatar>
                </Box>
              </Box>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vista previa de cómo se verá el sistema
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip
                    label="Dashboard"
                    size="small"
                    sx={{ bgcolor: alpha(configuracion.colorPrimario, 0.1), color: configuracion.colorPrimario }}
                  />
                  <Chip label="Ventas" size="small" variant="outlined" />
                  <Chip label="Clientes" size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* Previsualización de fuentes */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Previsualización de fuentes
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ fontSize: configuracion.tamanioFuente === 'small' ? 12 : configuracion.tamanioFuente === 'large' ? 18 : 14 }}>
                Texto en tamaño {configuracion.tamanioFuente}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Typography>
            </Box>

            {/* Color seleccionado */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: configuracion.colorPrimario }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Color primario seleccionado</Typography>
                <Typography variant="body2" fontWeight="bold">{configuracion.colorPrimario}</Typography>
              </Box>
            </Box>

            {/* Densidad preview */}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Densidad seleccionada: {densidades.find(d => d.valor === configuracion.densidad)?.nombre}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}