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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Email,
  WhatsApp,
  Sms,
  VolumeUp,
  VolumeOff,
  ShoppingCart,
  Inventory,
  People,
  AssignmentReturn,
  Warning,
  Campaign,
  Schedule,
  CheckCircle,
  Close,
  Science,
} from '@mui/icons-material'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useSnackbar } from 'notistack'
import { motion } from 'framer-motion'

// Tipos de eventos para notificaciones
const eventosNotificacion = [
  {
    id: 'nueva_venta',
    titulo: 'Nueva Venta',
    descripcion: 'Cuando se registra una nueva venta',
    icono: <ShoppingCart />,
    color: '#10b981',
    activoPorDefecto: true,
  },
  {
    id: 'stock_bajo',
    titulo: 'Stock Bajo',
    descripcion: 'Cuando un producto alcanza el stock mínimo',
    icono: <Inventory />,
    color: '#f59e0b',
    activoPorDefecto: true,
  },
  {
    id: 'producto_agotado',
    titulo: 'Producto Agotado',
    descripcion: 'Cuando un producto se queda sin stock',
    icono: <Warning />,
    color: '#ef4444',
    activoPorDefecto: true,
  },
  {
    id: 'nuevo_cliente',
    titulo: 'Nuevo Cliente',
    descripcion: 'Cuando se registra un nuevo cliente',
    icono: <People />,
    color: '#3b82f6',
    activoPorDefecto: false,
  },
  {
    id: 'devolucion',
    titulo: 'Devolución',
    descripcion: 'Cuando se registra una devolución',
    icono: <AssignmentReturn />,
    color: '#8b5cf6',
    activoPorDefecto: true,
  },
  {
    id: 'promocion',
    titulo: 'Promociones',
    descripcion: 'Notificaciones sobre promociones y ofertas',
    icono: <Campaign />,
    color: '#ec4899',
    activoPorDefecto: false,
  },
  {
    id: 'recordatorio',
    titulo: 'Recordatorios',
    descripcion: 'Recordatorios de tareas pendientes',
    icono: <Schedule />,
    color: '#06b6d4',
    activoPorDefecto: false,
  },
]

type CanalId = 'push' | 'email' | 'whatsapp' | 'sms'

// Canales de notificación
const canales: Array<{ id: CanalId; nombre: string; icono: JSX.Element; color: string; descripcion: string }> = [
  { id: 'push', nombre: 'Notificaciones Push', icono: <Notifications />, color: '#3b82f6', descripcion: 'Notificaciones en el navegador' },
  { id: 'email', nombre: 'Correo Electrónico', icono: <Email />, color: '#10b981', descripcion: 'Recibir notificaciones por email' },
  { id: 'whatsapp', nombre: 'WhatsApp', icono: <WhatsApp />, color: '#25D366', descripcion: 'Recibir notificaciones por WhatsApp' },
  { id: 'sms', nombre: 'SMS', icono: <Sms />, color: '#f59e0b', descripcion: 'Recibir notificaciones por SMS' },
]

// Horarios de silencio
const horariosSilencio = [
  { id: 'noche', nombre: 'Horario Nocturno', inicio: '22:00', fin: '08:00' },
  { id: 'personalizado', nombre: 'Horario Personalizado', inicio: '00:00', fin: '00:00' },
]

export const Notificaciones = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testSnackbar, setTestSnackbar] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [configuracion, setConfiguracion] = useState({
    notificacionesActivadas: true,
    sonidoActivado: true,
    volumen: 70,
    canales: {
      push: true,
      email: true,
      whatsapp: false,
      sms: false,
    },
    eventos: {} as Record<string, boolean>,
    modoSilencio: false,
    horarioSilencio: 'noche',
    resumenDiario: true,
    resumenSemanal: false,
  })

  useEffect(() => {
    const unsubscribe = cargarConfiguracion()
    return () => unsubscribe?.()
  }, [user?.id])

  const cargarConfiguracion = () => {
    setLoading(true)
    const userRef = doc(db, 'usuarios', user?.id || '')
    const unsubscribe = onSnapshot(
      userRef,
      (userDoc) => {
        const eventosIniciales: Record<string, boolean> = {}
        eventosNotificacion.forEach(e => {
          eventosIniciales[e.id] = e.activoPorDefecto
        })

        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.notificaciones) {
            setConfiguracion(prev => ({
              ...prev,
              ...data.notificaciones,
              eventos: { ...eventosIniciales, ...data.notificaciones.eventos, ...prev.eventos },
            }))
          } else {
            setConfiguracion(prev => ({
              ...prev,
              eventos: { ...eventosIniciales, ...prev.eventos },
            }))
          }
        } else {
          setConfiguracion(prev => ({
            ...prev,
            eventos: { ...eventosIniciales, ...prev.eventos },
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
      const userRef = doc(db, 'usuarios', user?.id || '')
      await updateDoc(userRef, {
        notificaciones: {
          notificacionesActivadas: configuracion.notificacionesActivadas,
          sonidoActivado: configuracion.sonidoActivado,
          volumen: configuracion.volumen,
          canales: configuracion.canales,
          eventos: configuracion.eventos,
          modoSilencio: configuracion.modoSilencio,
          horarioSilencio: configuracion.horarioSilencio,
          resumenDiario: configuracion.resumenDiario,
          resumenSemanal: configuracion.resumenSemanal,
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

  const handleToggleEvento = (eventoId: string) => {
    setConfiguracion(prev => ({
      ...prev,
      eventos: { ...prev.eventos, [eventoId]: !prev.eventos[eventoId] },
    }))
  }

  type CanalId = keyof typeof configuracion.canales

  const handleToggleCanal = (canalId: CanalId) => {
    setConfiguracion(prev => ({
      ...prev,
      canales: { ...prev.canales, [canalId]: !prev.canales[canalId] },
    }))
  }

  const enviarNotificacionPrueba = () => {
    setTestMessage('Notificación de prueba enviada correctamente')
    setTestSnackbar(true)
    // Simular sonido si está activado
    if (configuracion.sonidoActivado) {
      const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3')
      audio.volume = configuracion.volumen / 100
      audio.play().catch(e => console.log('Error reproduciendo sonido:', e))
    }
    enqueueSnackbar('Notificación de prueba', { variant: 'info' })
  }

  const handleReset = () => {
    const eventosIniciales: Record<string, boolean> = {}
    eventosNotificacion.forEach(e => {
      eventosIniciales[e.id] = e.activoPorDefecto
    })
    setConfiguracion({
      notificacionesActivadas: true,
      sonidoActivado: true,
      volumen: 70,
      canales: {
        push: true,
        email: true,
        whatsapp: false,
        sms: false,
      },
      eventos: eventosIniciales,
      modoSilencio: false,
      horarioSilencio: 'noche',
      resumenDiario: true,
      resumenSemanal: false,
    })
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
          Notificaciones
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Configura cómo y cuándo quieres recibir alertas
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Columna izquierda - Opciones principales */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActive /> Configuración General
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Activar/Desactivar notificaciones */}
            <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {configuracion.notificacionesActivadas ? (
                      <NotificationsActive sx={{ fontSize: 32, color: theme.palette.success.main }} />
                    ) : (
                      <NotificationsOff sx={{ fontSize: 32, color: theme.palette.error.main }} />
                    )}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">Notificaciones del Sistema</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Activar o desactivar todas las notificaciones
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={configuracion.notificacionesActivadas}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, notificacionesActivadas: e.target.checked }))}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Canales de notificación */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Canales de Notificación
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {canales.map((canal) => (
                <Grid item xs={12} sm={6} key={canal.id}>
                  <Card
                    sx={{
                      bgcolor: configuracion.canales[canal.id as keyof typeof configuracion.canales] ? alpha(canal.color, 0.1) : 'transparent',
                      border: `1px solid ${alpha(canal.color, 0.3)}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(canal.color, 0.15), color: canal.color }}>
                            {canal.icono}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{canal.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">{canal.descripcion}</Typography>
                          </Box>
                        </Box>
                        <Switch
                          checked={configuracion.canales[canal.id as keyof typeof configuracion.canales]}
                          onChange={() => handleToggleCanal(canal.id)}
                          disabled={!configuracion.notificacionesActivadas}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Sonido */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Sonido
            </Typography>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {configuracion.sonidoActivado ? <VolumeUp /> : <VolumeOff />}
                    <Typography variant="body2">Sonido de notificaciones</Typography>
                  </Box>
                  <Switch
                    checked={configuracion.sonidoActivado}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, sonidoActivado: e.target.checked }))}
                    disabled={!configuracion.notificacionesActivadas}
                  />
                </Box>
                {configuracion.sonidoActivado && (
                  <Box sx={{ px: 2 }}>
                    <Typography variant="caption" gutterBottom>Volumen</Typography>
                    <Slider
                      value={configuracion.volumen}
                      onChange={(_, v) => setConfiguracion(prev => ({ ...prev, volumen: v as number }))}
                      min={0}
                      max={100}
                      disabled={!configuracion.sonidoActivado}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Modo silencio */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Modo Silencio
            </Typography>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">Modo No Molestar</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Silenciar notificaciones en horario específico
                    </Typography>
                  </Box>
                  <Switch
                    checked={configuracion.modoSilencio}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, modoSilencio: e.target.checked }))}
                  />
                </Box>
                {configuracion.modoSilencio && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Horario de silencio</InputLabel>
                    <Select
                      value={configuracion.horarioSilencio}
                      onChange={(e) => setConfiguracion(prev => ({ ...prev, horarioSilencio: e.target.value }))}
                      label="Horario de silencio"
                    >
                      {horariosSilencio.map((h) => (
                        <MenuItem key={h.id} value={h.id}>
                          {h.nombre} ({h.inicio} - {h.fin})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>

            {/* Resúmenes */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Resúmenes
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={configuracion.resumenDiario}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, resumenDiario: e.target.checked }))}
                />
              }
              label="Resumen diario de actividad"
              sx={{ display: 'block', mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={configuracion.resumenSemanal}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, resumenSemanal: e.target.checked }))}
                />
              }
              label="Resumen semanal por email"
            />
          </Paper>
        </Grid>

        {/* Columna derecha - Eventos y prueba */}
        <Grid item xs={12} md={5}>
          {/* Eventos */}
          <Paper sx={{ borderRadius: 3, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Campaign /> Eventos a Notificar
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {eventosNotificacion.map((evento) => (
                <Card
                  key={evento.id}
                  sx={{
                    mb: 2,
                    bgcolor: configuracion.eventos[evento.id] ? alpha(evento.color, 0.05) : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(evento.color, 0.15), color: evento.color, width: 40, height: 40 }}>
                          {evento.icono}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{evento.titulo}</Typography>
                          <Typography variant="caption" color="text.secondary">{evento.descripcion}</Typography>
                        </Box>
                      </Box>
                      <Switch
                        checked={configuracion.eventos[evento.id] || false}
                        onChange={() => handleToggleEvento(evento.id)}
                        disabled={!configuracion.notificacionesActivadas}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          {/* Prueba de notificación */}
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Science /> Probar Notificaciones
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Envía una notificación de prueba para verificar la configuración
            </Typography>
            <Button
              fullWidth
              variant="contained"
              startIcon={<NotificationsActive />}
              onClick={enviarNotificacionPrueba}
              disabled={!configuracion.notificacionesActivadas}
              sx={{ py: 1.5, borderRadius: 2 }}
            >
              Enviar Notificación de Prueba
            </Button>

            {/* Resumen de configuración */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Resumen de configuración</Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="caption" color="text.secondary">
                  Estado: {configuracion.notificacionesActivadas ? 'Activadas' : 'Desactivadas'}
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  Canales activos: {Object.values(configuracion.canales).filter(v => v).length}
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  Eventos activos: {Object.values(configuracion.eventos).filter(v => v).length}
                </Typography>
                <Typography component="li" variant="caption" color="text.secondary">
                  Sonido: {configuracion.sonidoActivado ? 'Activado' : 'Desactivado'}
                </Typography>
              </Box>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="outlined" onClick={handleReset}>
                Restablecer
              </Button>
              <Button variant="contained" startIcon={<CheckCircle />} onClick={guardarConfiguracion} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar de prueba */}
      <Snackbar
        open={testSnackbar}
        autoHideDuration={3000}
        onClose={() => setTestSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setTestSnackbar(false)}>
          {testMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}