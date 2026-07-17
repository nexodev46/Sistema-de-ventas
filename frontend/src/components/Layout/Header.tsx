import { useState, useEffect, useRef, type MouseEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  alpha,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  PersonAdd as PersonAddIcon,
  SyncAlt as SyncAltIcon,
  Inventory2 as Inventory2Icon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import { useSidebar } from '../../contexts/SidebarContext'
import { auth, db } from '../../services/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import {
  listenNotificationEvents,
  loadNotifications,
  saveNotifications,
  Notificacion,
} from '../../services/notificationService'

export const Header = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useThemeMode()
  const { toggleMobile } = useSidebar()
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [notifications, setNotifications] = useState<Notificacion[]>([])
  const [animateBell, setAnimateBell] = useState(false)
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const animationTimer = useRef<number | null>(null)

  const unreadCount = notifications.filter(n => !n.leida).length

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleNotifOpen = (event: MouseEvent<HTMLElement>) => setNotifAnchor(event.currentTarget)
  const handleNotifClose = () => setNotifAnchor(null)

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
          setIsFullscreen(false)
        }
      }
    } catch (error) {
      console.error('Error al cambiar fullscreen:', error)
    }
  }

  // Escuchar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    setNotifications(loadNotifications())

    const unsubscribe = listenNotificationEvents((notification) => {
      setNotifications((prev) => {
        const next = [notification, ...prev].slice(0, 50)
        saveNotifications(next)
        return next
      })

      setAnimateBell(true)
      if (animationTimer.current) {
        window.clearTimeout(animationTimer.current)
      }
      animationTimer.current = window.setTimeout(() => setAnimateBell(false), 800)
    })

    return () => {
      unsubscribe()
      if (animationTimer.current) {
        window.clearTimeout(animationTimer.current)
      }
    }
  }, [])

  // Escuchar cambios en tiempo real de la foto de perfil del usuario
  useEffect(() => {
    if (!auth.currentUser?.uid) return

    const userRef = doc(db, 'usuarios', auth.currentUser.uid)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        if (data.fotoURL) {
          setUserPhotoURL(data.fotoURL)
        }
      }
    })

    return () => unsubscribe()
  }, [user?.id])

  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/login')
  }

  const getIconoPorTipo = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'VENTA':
        return <ShoppingCartIcon fontSize="small" />
      case 'STOCK_BAJO':
        return <WarningIcon fontSize="small" />
      case 'CLIENTE_NUEVO':
        return <PersonAddIcon fontSize="small" />
      case 'DEVOLUCION':
        return <SyncAltIcon fontSize="small" />
      case 'PRODUCTO_AGOTADO':
        return <Inventory2Icon fontSize="small" />
      default:
        return <NotificationsIcon fontSize="small" />
    }
  }

  const formatNotificationDate = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch {
      return fecha
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const handleClearNotifications = () => {
    setNotifications([])
    handleNotifClose()
  }

  const handleSearch = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    navigate(`/buscar?q=${encodeURIComponent(trimmed)}`)
    if (isMobile) {
      setSearchOpen(false)
    }
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  const handleNotificationClick = (notification: Notificacion) => {
    handleMarkAsRead(notification.id)
    handleNotifClose()
    if (notification.link) {
      navigate(notification.link)
    }
  }


  const getDisplayName = () => {

    if (!user?.nombre) return 'Admin'
    const parts = user.nombre.split(' ').filter(Boolean)
    return parts.slice(0, 2).join(' ')
  }

  const displayName = getDisplayName()

  const getRoleColor = () => {
    switch (user?.rol) {
      case 'ADMIN': return theme.palette.primary.main
      case 'GERENTE': return theme.palette.warning.main
      default: return theme.palette.success.main
    }
  }

  const getRoleLabel = () => {
    switch (user?.rol) {
      case 'ADMIN': return 'Administrador'
      case 'GERENTE': return 'Gerente'
      default: return 'Vendedor'
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
          {isMobile ? (
            <IconButton onClick={toggleMobile} sx={{ color: 'text.secondary' }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: { xs: 56, sm: 120 } }} />
          )}

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {!isMobile && !searchOpen && (
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  border: `2px solid ${theme.palette.primary.main}`,
                  bgcolor: alpha(theme.palette.common.black, 0.05),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.black, 0.1),
                    borderColor: theme.palette.primary.dark,
                  },
                  width: '100%',
                  maxWidth: 420,
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  onClick={() => handleSearch(searchTerm)}
                  title="Buscar"
                  sx={{
                    p: theme.spacing(0, 2),
                    height: '100%',
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </Box>
                <InputBase
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Buscar productos, ventas, clientes..."
                  sx={{
                    pl: 5,
                    py: 0.75,
                    width: '100%',
                    fontSize: 14,
                    '& .MuiInputBase-input::placeholder': {
                      color: 'transparent',
                      opacity: 1,
                    },
                    '& .MuiInputBase-input:hover::placeholder': {
                      color: alpha(theme.palette.text.secondary, 0.7),
                    },
                    '& .MuiInputBase-input:focus::placeholder': {
                      color: alpha(theme.palette.text.secondary, 0.7),
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: { xs: 0, sm: 180 }, justifyContent: 'flex-end' }}>
            {/* Botón de búsqueda móvil */}
            {isMobile && (
              <Tooltip title="Búsqueda">
                <IconButton onClick={() => setSearchOpen(!searchOpen)} sx={{ color: 'text.secondary' }}>
                  {searchOpen ? <CloseIcon /> : <SearchIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Modo oscuro/claro */}
            <Tooltip title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
              <IconButton onClick={toggleDarkMode} sx={{ color: 'text.secondary' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton
                onClick={handleNotifOpen}
                sx={{
                  color: 'text.secondary',
                  animation: animateBell ? 'jump 0.6s ease' : 'none',
                  '@keyframes jump': {
                    '0%': { transform: 'translateY(0)' },
                    '25%': { transform: 'translateY(-4px)' },
                    '50%': { transform: 'translateY(0)' },
                    '75%': { transform: 'translateY(-2px)' },
                    '100%': { transform: 'translateY(0)' },
                  },
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Pantalla Completa */}
            <Tooltip title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
              <IconButton onClick={toggleFullscreen} sx={{ color: 'text.secondary' }}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>

            {/* Menú de notificaciones */}
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={handleNotifClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { width: 360, maxHeight: 450, borderRadius: 2 },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">Notificaciones</Typography>
                <Box>
                  {notifications.length > 0 && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{ cursor: 'pointer', mr: 1, color: 'primary.main' }}
                        onClick={handleMarkAllAsRead}
                      >
                        Marcar todas como leídas
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ cursor: 'pointer', color: 'error.main' }}
                        onClick={handleClearNotifications}
                      >
                        Limpiar
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {notifications.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay notificaciones
                  </Typography>
                </Box>
              ) : (
                <>
                  {notifications.slice(0, 5).map((notif) => (
                    <MenuItem
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: notif.leida ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>
                        <Box sx={{ mt: 0.25, color: notif.leida ? 'text.secondary' : 'primary.main' }}>
                          {getIconoPorTipo(notif.tipo)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={notif.leida ? 'normal' : 'bold'}>
                            {notif.titulo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {notif.mensaje}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatNotificationDate(notif.fecha)}
                          </Typography>
                        </Box>
                        {!notif.leida && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5 }} />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                  <Box sx={{ p: 1.5, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigate('/dashboard')
                        handleNotifClose()
                      }}
                    >
                      Ver todas las notificaciones
                    </Typography>
                  </Box>
                </>
              )}
            </Menu>

            {/* Perfil de usuario */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                ml: 1,
                '&:hover': { opacity: 0.8 },
              }}
              onClick={handleMenuOpen}
            >
              <Avatar
                src={userPhotoURL || undefined}
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  bgcolor: getRoleColor(),
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: `3px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `3px solid ${theme.palette.primary.light}`,
                    boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {!userPhotoURL && (user?.nombre?.charAt(0)?.toUpperCase() || 'A')}
              </Avatar>
              {!isMobile && (
                <Box sx={{ ml: 1.5, display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: getRoleColor(), fontSize: 11 }}>
                    {getRoleLabel()}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Menú de usuario */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { width: 220, borderRadius: 2, mt: 1 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {displayName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {user?.email || 'usuario@empresa.com'}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: getRoleColor(), fontWeight: 'bold' }}>
                    {getRoleLabel()}
                  </Typography>
                </Box>
              </Box>

              <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
                <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </MenuItem>

              {user?.rol === 'ADMIN' && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/configuracion'); }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Configuración</ListItemText>
                </MenuItem>
              )}

              <MenuItem onClick={() => { handleMenuClose(); navigate('/configuracion/perfil'); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Mi Perfil</ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>

      {/* Barra de búsqueda móvil desplegable */}
      {isMobile && searchOpen && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <InputBase
            fullWidth
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar productos, ventas, clientes..."
            autoFocus
            sx={{
              p: 1,
              borderRadius: 2,
              border: `2px solid ${theme.palette.primary.main}`,
              bgcolor: alpha(theme.palette.common.black, 0.05),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.black, 0.1),
                borderColor: theme.palette.primary.dark,
              },
              transition: 'all 0.2s ease',
              '& .MuiInputBase-input::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.7),
              },
              '& .MuiInputBase-input:focus::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.7),
              },
            }}
          />
        </Box>
      )}
    </AppBar>
  )
}