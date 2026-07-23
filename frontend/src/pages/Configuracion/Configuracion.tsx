import { Box, Typography, Grid, Card, CardActionArea, Avatar, useTheme, alpha } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  People,
  Business,
  Security,
  Notifications,
  Palette,
  Receipt,
  Person,
  
  LocalShipping,
} from '@mui/icons-material'

const configModules = [
  {
    title: 'Usuarios',
    icon: <People />,
    path: '/configuracion/usuarios',
    description: 'Gestionar usuarios y roles del sistema',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    title: 'Empresa',
    icon: <Business />,
    path: '/configuracion/empresa',
    description: 'Datos de tu negocio, logo y contacto',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
  },
  {
    title: 'Mi Perfil',
    icon: <Person />,
    path: '/configuracion/perfil',
    description: 'Información personal y seguridad',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    title: 'Seguridad',
    icon: <Security />,
    path: '/configuracion/seguridad',
    description: 'Cambiar contraseña, 2FA',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    title: 'Notificaciones',
    icon: <Notifications />,
    path: '/configuracion/notificaciones',
    description: 'Alertas y emails',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
  {
    title: 'Apariencia',
    icon: <Palette />,
    path: '/configuracion/apariencia',
    description: 'Tema oscuro/claro',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
  {
    title: 'Facturación',
    icon: <Receipt />,
    path: '/configuracion/facturacion',
    description: 'Configuración de facturas',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
  {
    title: 'Almacenamiento',
    icon: <LocalShipping />,
    path: '/configuracion/almacenamiento',
    description: 'Gestión de archivos y backups',
    color: '#78716c',
    gradient: 'linear-gradient(135deg, #78716c, #57534e)',
  },
]

export const Configuracion = () => {
  const navigate = useNavigate()
  const theme = useTheme()

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
          Configuración
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Personaliza tu sistema y gestiona la configuración de tu negocio
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {configModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[12],
                  },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: module.gradient,
                  }}
                />
                <CardActionArea onClick={() => navigate(module.path)} sx={{ height: '100%', p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(module.color, 0.15),
                      color: module.color,
                      width: 56,
                      height: 56,
                      mb: 2,
                    }}
                  >
                    {module.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {module.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}