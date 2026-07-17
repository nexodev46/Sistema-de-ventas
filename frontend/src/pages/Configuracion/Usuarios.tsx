import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Badge,
  Alert,
  Divider,
  Fade,
  Zoom,
} from '@mui/material'
import {
  People,
  Search,
  Add,
  Edit,
  Delete,
  Lock,
  AdminPanelSettings,
  Person,
  PersonAdd,
  Email,
  Phone,
  Badge as BadgeIcon,
  CheckCircle,
  Cancel,
  MoreVert,
  Visibility,
  Block,
  Settings,
  Security,
  VerifiedUser,
  SupervisorAccount,
  Storefront,
} from '@mui/icons-material'
import { firebaseAuthService, UserData } from '../../services/firebaseAuthService'
import { useAuth } from '../../contexts/AuthContext'
import { useSnackbar } from 'notistack'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { motion } from 'framer-motion'

// Componente de tarjeta de estadística
const StatCard = ({ title, value, icon, color, delay = 0 }: any) => {
  const theme = useTheme()
  return (
    <Zoom in style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          borderRadius: 3,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[12],
          },
          background: `linear-gradient(135deg, ${color}10, ${color}05)`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  )
}

// Componente de tarjeta de usuario
const UserCard = ({ user, onEdit, onDelete, onToggleStatus, currentUser }: any) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return '#ef4444'
      case 'GERENTE': return '#f59e0b'
      case 'ALMACEN': return '#6366f1'
      default: return '#10b981'
    }
  }

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return <AdminPanelSettings />
      case 'GERENTE': return <SupervisorAccount />
      case 'ALMACEN': return <Storefront />
      default: return <Person />
    }
  }

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'Administrador'
      case 'GERENTE': return 'Gerente'
      case 'ALMACEN': return 'Almacén'
      default: return 'Vendedor'
    }
  }

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            borderRadius: 3,
            height: '100%',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[12],
            },
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Status badge */}
          <Badge
            color={user.activo ? 'success' : 'error'}
            variant="dot"
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              '& .MuiBadge-badge': { width: 12, height: 12, borderRadius: '50%' }
            }}
          />
          
          <CardContent sx={{ pt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: alpha(getRoleColor(user.rol), 0.15),
                  color: getRoleColor(user.rol),
                  fontSize: 32,
                  fontWeight: 'bold',
                  mb: 2,
                  boxShadow: 3,
                }}
              >
                {(user.nombre || 'Usuario').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" textAlign="center">
                {user.nombre || 'Usuario'}
              </Typography>
              <Chip
                icon={getRoleIcon(user.rol)}
                label={getRoleLabel(user.rol)}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: alpha(getRoleColor(user.rol), 0.1),
                  color: getRoleColor(user.rol),
                  fontWeight: 'bold',
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                  {user.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                  {user.telefono || 'Sin teléfono'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Chip
                label={user.activo ? 'Activo' : 'Inactivo'}
                size="small"
                color={user.activo ? 'success' : 'default'}
                icon={user.activo ? <CheckCircle /> : <Cancel />}
              />
              <Box>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEdit(user)} sx={{ color: theme.palette.warning.main }}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                {currentUser?.id !== user.uid && (
                  <>
                    <Tooltip title={user.activo ? 'Desactivar' : 'Activar'}>
                      <IconButton size="small" onClick={() => onToggleStatus(user)} sx={{ color: user.activo ? theme.palette.error.main : theme.palette.success.main }}>
                        {user.activo ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar usuario">
                      <IconButton size="small" onClick={() => onDelete(user)} sx={{ color: theme.palette.error.main }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  )
}

export const Usuarios = () => {
  const theme = useTheme()
  const { user: currentUser } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [usuarios, setUsuarios] = useState<UserData[]>([])
  const [filtered, setFiltered] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [newRole, setNewRole] = useState<'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'ALMACEN'>('VENDEDOR')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  useEffect(() => {
    filtrarUsuarios()
  }, [search, usuarios, tabValue])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const users = await firebaseAuthService.getAllUsersIncludingInactive()
      setUsuarios(users)
      setFiltered(users)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarUsuarios = () => {
    let result = [...usuarios]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(u =>
        u.nombre.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.telefono?.includes(term)
      )
    }

    if (tabValue === 1) {
      result = result.filter(u => u.rol === 'ADMIN')
    } else if (tabValue === 2) {
      result = result.filter(u => u.rol === 'GERENTE')
    } else if (tabValue === 3) {
      result = result.filter(u => u.rol === 'VENDEDOR')
    } else if (tabValue === 4) {
      result = result.filter(u => !u.activo)
    }

    setFiltered(result)
  }

  const handleOpenRoleDialog = (user: UserData) => {
    setEditingUser(user)
    setNewRole(user.rol)
    setOpenDialog(true)
    setError('')
    setSuccess('')
  }

  const handleSaveRole = async () => {
    if (!editingUser) return
    setSaving(true)
    setError('')
    try {
      const userRef = doc(db, 'usuarios', editingUser.uid)
      await updateDoc(userRef, { rol: newRole })
      setSuccess(`Rol actualizado a ${newRole}`)
      await cargarUsuarios()
      setTimeout(() => setOpenDialog(false), 1500)
    } catch (error) {
      setError('Error actualizando rol')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user: UserData) => {
    if (currentUser?.id === user.uid) {
      alert('No puedes cambiar tu propio estado')
      return
    }
    try {
      await firebaseAuthService.toggleUserStatus(user.uid, !user.activo)
      await cargarUsuarios()
    } catch (error) {
      console.error('Error cambiando estado:', error)
    }
  }

  const handleDeleteClick = (user: UserData) => {
    if (currentUser?.id === user.uid) {
      alert('No puedes eliminar tu propio usuario')
      return
    }
    setUserToDelete(user)
    setOpenDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    try {
      await firebaseAuthService.deleteUserAccount(userToDelete.uid)
      enqueueSnackbar(`Usuario ${userToDelete.nombre} eliminado correctamente`, { variant: 'success' })
      await cargarUsuarios()
      setOpenDeleteDialog(false)
      setUserToDelete(null)
    } catch (error: any) {
      console.error('Error eliminando usuario:', error)
      enqueueSnackbar('Error al eliminar el usuario. Intenta de nuevo.', { variant: 'error' })
    }
  }

  const navigate = useNavigate()

  const stats = {
    total: usuarios.length,
    admins: usuarios.filter(u => u.rol === 'ADMIN').length,
    gerentes: usuarios.filter(u => u.rol === 'GERENTE').length,
    vendedores: usuarios.filter(u => u.rol === 'VENDEDOR').length,
    activos: usuarios.filter(u => u.activo).length,
    inactivos: usuarios.filter(u => !u.activo).length,
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Usuarios del Sistema
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gestiona los accesos y roles de los usuarios
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2,
              px: 3,
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Usuarios" value={stats.total} icon={<People />} color={theme.palette.primary.main} delay={100} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Administradores" value={stats.admins} icon={<AdminPanelSettings />} color="#ef4444" delay={200} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Gerentes" value={stats.gerentes} icon={<SupervisorAccount />} color="#f59e0b" delay={300} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Vendedores" value={stats.vendedores} icon={<Person />} color="#10b981" delay={400} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Activos" value={stats.activos} icon={<CheckCircle />} color="#10b981" delay={500} />
        </Grid>
      </Grid>

      {/* Filtros y búsqueda */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Todos" />
          <Tab label="Administradores" />
          <Tab label="Gerentes" />
          <Tab label="Vendedores" />
          <Tab label="Inactivos" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar usuario por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
      </Paper>

      {/* Lista de usuarios */}
      {filtered.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <People sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay usuarios registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Los usuarios aparecerán aquí cuando se registren
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((user, idx) => (
            <UserCard
              key={user.uid}
              user={user}
              onEdit={handleOpenRoleDialog}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              currentUser={currentUser}
            />
          ))}
        </Grid>
      )}

      {/* Diálogo de cambio de rol */}
      <Dialog open={openDialog} onClose={() => !saving && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security /> Cambiar Rol de Usuario
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              {editingUser?.nombre?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{editingUser?.nombre}</Typography>
              <Typography variant="caption" color="text.secondary">{editingUser?.email}</Typography>
            </Box>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} label="Rol">
              <MenuItem value="ADMIN">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettings sx={{ color: '#ef4444' }} /> Administrador - Acceso total
                </Box>
              </MenuItem>
              <MenuItem value="GERENTE">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupervisorAccount sx={{ color: '#f59e0b' }} /> Gerente - Acceso parcial
                </Box>
              </MenuItem>
              <MenuItem value="VENDEDOR">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: '#10b981' }} /> Vendedor - Solo ventas
                </Box>
              </MenuItem>
              <MenuItem value="ALMACEN">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storefront sx={{ color: '#6366f1' }} /> Almacén - Inventario
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveRole} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <Delete /> Eliminar Usuario Permanentemente
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.nombre}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
            <strong>⚠️ Advertencia:</strong> Esta acción es permanente e irreversible. El usuario será eliminado completamente de la base de datos.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            El usuario no podrá acceder al sistema. Deberá registrarse nuevamente para crear una nueva cuenta.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}