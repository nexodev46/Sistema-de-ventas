import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Tooltip,
  Collapse,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  PointOfSale as PointOfSaleIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AssignmentReturn as AssignmentReturnIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandingWatermarkIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,

  Tune as TuneIcon,
  
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { useSidebar } from '../../contexts/SidebarContext'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const LOGO_STORAGE_KEY = 'empresaLogoUrl'
const COMPANY_NAME_STORAGE_KEY = 'empresaNombre'

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { collapsed, toggleSidebar } = useSidebar()
  const { user, logout } = useAuth()
  const isAdmin = user?.rol === 'ADMIN'
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const hasCompanyLogo = Boolean(companyLogo?.trim())
  const companyLogoSrc = companyLogo?.trim() || undefined

  useEffect(() => {
    const localLogo = window.localStorage.getItem(LOGO_STORAGE_KEY)
    const localName = window.localStorage.getItem(COMPANY_NAME_STORAGE_KEY)
    if (localLogo) {
      setCompanyLogo(localLogo)
    }
    if (localName) {
      setCompanyName(localName)
    }

    const loadCompanyData = async () => {
      try {
        const docRef = doc(db, 'configuracion', 'empresa')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data() as { logo?: string; logoPreview?: string; nombre?: string }
          const logo = (data.logo || data.logoPreview || '').toString().trim()
          if (logo) {
            setCompanyLogo(logo)
            window.localStorage.setItem(LOGO_STORAGE_KEY, logo)
          } else {
            setCompanyLogo(null)
            window.localStorage.removeItem(LOGO_STORAGE_KEY)
          }
          if (data.nombre) {
            setCompanyName(data.nombre)
            window.localStorage.setItem(COMPANY_NAME_STORAGE_KEY, data.nombre)
          }
        }
      } catch (error) {
        console.error('Error cargando datos de empresa:', error)
      }
    }

    loadCompanyData()

    const handleLogoUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ logo?: string; nombre?: string }>
      if (customEvent.detail?.logo !== undefined) {
        const logoValue = customEvent.detail.logo || null
        setCompanyLogo(logoValue)
        if (logoValue) {
          window.localStorage.setItem(LOGO_STORAGE_KEY, logoValue)
        } else {
          window.localStorage.removeItem(LOGO_STORAGE_KEY)
        }
      }
      if (customEvent.detail?.nombre) {
        setCompanyName(customEvent.detail.nombre)
        window.localStorage.setItem(COMPANY_NAME_STORAGE_KEY, customEvent.detail.nombre)
      }
    }

    const handleNameUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ nombre: string }>
      if (customEvent.detail?.nombre) {
        setCompanyName(customEvent.detail.nombre)
        window.localStorage.setItem(COMPANY_NAME_STORAGE_KEY, customEvent.detail.nombre)
      }
    }

    window.addEventListener('empresaLogoUpdated', handleLogoUpdated)
    window.addEventListener('empresaNombreUpdated', handleNameUpdated)
    return () => {
      window.removeEventListener('empresaLogoUpdated', handleLogoUpdated)
      window.removeEventListener('empresaNombreUpdated', handleNameUpdated)
    }
  }, [])

  const [openSubmenus, setOpenSubmenus] = useState({
    inventario: true,
    reportes: true,
    configuracion: false,
  })

  const handleSubmenuToggle = (menu: 'inventario' | 'reportes' | 'configuracion') => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }))
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  const isActive = (path: string) => location.pathname === path

  // Botones de acción (funcionales)
  const actionButtons = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/punto-venta' },
    { text: 'Ventas', icon: <ReceiptIcon />, path: '/ventas' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
    { text: 'Devoluciones', icon: <AssignmentReturnIcon />, path: '/devoluciones' },
  ]

  // Submenú de Inventario (solo ADMIN)
  const inventarioSubmenus = [
    { text: 'Productos', icon: <InventoryIcon />, path: '/productos' },
    { text: 'Categorías', icon: <CategoryIcon />, path: '/categorias' },
    { text: 'Marcas', icon: <BrandingWatermarkIcon />, path: '/marcas' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
    { text: 'Ajustes', icon: <TuneIcon />, path: '/ajustes-inventario' },
  ]

  // Submenú de Reportes (solo ADMIN)
  const reportesSubmenus = [
    { text: 'Ventas', icon: <AssessmentIcon />, path: '/reportes/ventas' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/reportes/inventario' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/reportes/clientes' },
  ]

  // Submenú de Configuración (solo ADMIN)
  const configSubmenus = [
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/configuracion/usuarios' },
    { text: 'Empresa', icon: <BusinessIcon />, path: '/configuracion/empresa' },
    { text: 'Mi Perfil', icon: <PersonIcon />, path: '/configuracion/perfil' },
    { text: 'Seguridad', icon: <SecurityIcon />, path: '/configuracion/seguridad' },
    { text: 'Apariencia', icon: <PaletteIcon />, path: '/configuracion/apariencia' },
    { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/configuracion/notificaciones' },
    { text: 'Facturación', icon: <ReceiptIcon />, path: '/configuracion/facturacion' },
    { text: 'Almacenamiento', icon: <StorageIcon />, path: '/configuracion/almacenamiento' },
  ]

  // Categorías desplegables (solo expanden/colapsan, NO son botones)
  const expandableCategories = [
    {
      text: 'Inventario',
      icon: <InventoryIcon />,
      openKey: 'inventario' as const,
      submenus: inventarioSubmenus,
      visible: isAdmin
    },
    {
      text: 'Reportes',
      icon: <AssessmentIcon />,
      openKey: 'reportes' as const,
      submenus: reportesSubmenus,
      visible: isAdmin
    },
    {
      text: 'Configuración',
      icon: <SettingsIcon />,
      openKey: 'configuracion' as const,
      submenus: configSubmenus,
      visible: isAdmin
    },
  ]

  const sidebarContent = (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.main,
        borderRight: `1px solid ${theme.palette.divider}`,
        overflowY: 'auto',
        // ensure final buttons are not hidden behind viewport edges
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Logo y título */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed && !isMobile ? 0 : 1.5,
          }}
        >
          <Box
            sx={{
              width: collapsed && !isMobile ? 30 : 48,
              height: collapsed && !isMobile ? 30 : 48,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.7)}`,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
            }}
          >
            {hasCompanyLogo ? (
              <Box
                component="img"
                src={companyLogoSrc}
                alt="Logo de la empresa"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <BusinessIcon sx={{ color: theme.palette.primary.main, fontSize: collapsed && !isMobile ? 20 : 28 }} />
            )}
          </Box>
          {!collapsed && !isMobile && companyName?.trim() && (
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                letterSpacing: 0.5,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '0.95rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              {companyName.trim()}
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <IconButton onClick={toggleSidebar} size="small">
            <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: 'none' }}>
        {null}
      </Box>

      <List sx={{ flexGrow: 1, px: 1, py: 1, pb: 3 }}>
        {/* ===== BOTONES DE ACCIÓN (funcionales) ===== */}
        {actionButtons.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
            <Tooltip title={collapsed && !isMobile ? item.text : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 40,
                  justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                  borderRadius: 1.5,
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.18)',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.18)
                      : 'rgba(255, 255, 255, 0.24)',
                    color: 'white',
                    fontWeight: 600,
                    borderLeft: `3px solid ${theme.palette.common.white}`,
                    pl: collapsed && !isMobile ? 2 : 'calc(1rem - 3px)',
                    boxShadow: theme.palette.mode === 'light' ? 'inset 4px 0 0 rgba(255, 255, 255, 0.72)' : undefined,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.26)
                        : 'rgba(255, 255, 255, 0.32)',
                      transform: 'translateX(4px)',
                    },
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed && !isMobile ? 0 : 2.5,
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.3rem',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}

        {/* ===== CERRAR SESIÓN PARA VENDEDOR ===== */}
        {!isAdmin && (
          <>
            <Divider sx={{ my: 1.5, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
            <ListItem disablePadding sx={{ px: 1 }}>
              <Tooltip title={collapsed && !isMobile ? 'Cerrar Sesión' : ''} placement="right">
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    minHeight: 32,
                    py: 0.75,
                    px: 1.6,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    borderRadius: 2.5,
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    background: 'linear-gradient(145deg, #ec407a 0%, #d81b60 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    boxShadow: '0 12px 24px rgba(216, 27, 96, 0.16)',
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      border: '1px solid rgba(255, 255, 255, 0.36)',
                      background: 'linear-gradient(145deg, #d81b60 0%, #ad1457 100%)',
                      boxShadow: '0 16px 32px rgba(216, 27, 96, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '& .MuiListItemIcon-root': { color: 'white', minWidth: 'auto' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed && !isMobile ? 0 : 1.2,
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: '1rem' }} />
                  </ListItemIcon>
                  {(!collapsed || isMobile) && <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.85rem', letterSpacing: '0.01em' }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </>
        )}

        {/* ===== SECCIÓN ADMIN ===== */}
        {isAdmin && (
          <>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

            {/* CATEGORÍAS DESPLEGABLES (NO son botones) */}
            {expandableCategories.map((category) => (
              <React.Fragment key={category.text}>
                {/* Encabezado de categoría (solo expande/colapsa, NO es botón de navegación) */}
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip title={collapsed && !isMobile ? category.text : ''} placement="right">
                    <ListItemButton
                      onClick={() => handleSubmenuToggle(category.openKey)}
                      disableRipple
                      sx={{
                        minHeight: 36,
                        justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                        borderRadius: 2,
                        bgcolor: 'transparent',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed && !isMobile ? 0 : 2,
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {category.icon}
                      </ListItemIcon>
                      {(!collapsed || isMobile) && (
                        <>
                          <ListItemText
                            primary={category.text}
                            primaryTypographyProps={{
                              fontWeight: 'bold',
                              color: 'white',
                            }}
                          />
                          {openSubmenus[category.openKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>

                {/* Submenús dentro de la categoría */}
                <Collapse in={openSubmenus[category.openKey]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: collapsed && !isMobile ? 0 : 4 }}>
                    {category.submenus.map((submenu) => (
                      <ListItem key={submenu.text} disablePadding sx={{ mb: 0.5 }}>
                        <Tooltip title={collapsed && !isMobile ? submenu.text : ''} placement="right">
                          <ListItemButton
                            onClick={() => handleNavigate(submenu.path)}
                            selected={isActive(submenu.path)}
                            sx={{
                              minHeight: 46,
                              borderRadius: 1.5,
                              justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                              color: 'white',
                              bgcolor: 'rgba(255, 255, 255, 0.06)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.14)',
                                transform: 'translateX(3px)',
                              },
                              '&.Mui-selected': {
                                bgcolor: theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.primary.main, 0.22)
                                  : 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 600,
                                borderLeft: `3px solid ${theme.palette.common.white}`,
                                boxShadow: theme.palette.mode === 'light' ? 'inset 4px 0 0 rgba(255, 255, 255, 0.72)' : undefined,
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.primary.main, 0.3)
                                    : 'rgba(255, 255, 255, 0.28)',
                                  transform: 'translateX(3px)',
                                },
                                '& .MuiListItemIcon-root': { color: 'white' },
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: collapsed && !isMobile ? 0 : 2,
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.2rem',
                              }}
                            >
                              {submenu.icon}
                            </ListItemIcon>
                            {(!collapsed || isMobile) && <ListItemText primary={submenu.text} />}
                          </ListItemButton>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}

            <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

            {/* CERRAR SESIÓN PARA ADMIN */}
            <ListItem disablePadding sx={{ px: 1, mt: 1 }}>
              <Tooltip title={collapsed && !isMobile ? 'Cerrar Sesión' : ''} placement="right">
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    minHeight: 30,
                    py: 0.6,
                    px: 1.4,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    borderRadius: 2.5,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(145deg, #f06292 0%, #d81b60 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    boxShadow: '0 10px 20px rgba(216, 27, 96, 0.16)',
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      background: 'linear-gradient(145deg, #d81b60 0%, #c2185b 100%)',
                      boxShadow: '0 14px 28px rgba(216, 27, 96, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '& .MuiListItemIcon-root': { color: 'white', minWidth: 'auto' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed && !isMobile ? 0 : 1.2,
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: '1rem' }} />
                  </ListItemIcon>
                  {(!collapsed || isMobile) && <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.85rem', letterSpacing: '0.01em' }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  // Para móvil usar Drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    )
  }

  // Para escritorio
  return sidebarContent
}