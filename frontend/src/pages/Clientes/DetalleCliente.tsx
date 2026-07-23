import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { ArrowBack, Email, LocationOn, Person, Phone, Badge, Cake, Notes } from '@mui/icons-material'
import { clienteService } from '../../services/clienteService'
import { Cliente } from '../../types/cliente.types'

export const DetalleCliente = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id) {
      setError('ID de cliente inválido.')
      setLoading(false)
      return
    }

    const unsubscribe = clienteService.subscribeById(
      id,
      (result) => {
        if (!result) {
          setError('No se encontró el cliente solicitado.')
        } else {
          setCliente(result)
          setError('')
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error cargando cliente:', error)
        setError('Ocurrió un error al cargar los detalles del cliente.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [id])

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/clientes')}
        sx={{ mb: 3, borderRadius: 2 }}
        variant="outlined"
      >
        Volver a Clientes
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            Detalles del cliente
          </Typography>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : cliente ? (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {cliente.nombre}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip label={cliente.tipoDocumento} color="primary" size="small" />
              <Chip label={cliente.activo ? 'Activo' : 'Inactivo'} size="small" color={cliente.activo ? 'success' : 'default'} />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Información completa del cliente y datos asociados.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Datos de contacto
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email color="action" />
                      <Typography>{cliente.email || 'No registrado'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone color="action" />
                      <Typography>{cliente.telefono || 'No registrado'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="action" />
                      <Typography>{cliente.direccion || 'No registrada'}</Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Identificación
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge color="action" />
                      <Typography>{cliente.documento || 'No disponible'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cake color="action" />
                      <Typography>{cliente.fechaNacimiento || 'No registrada'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="action" />
                      <Typography>Registrado el {new Date(cliente.fechaRegistro).toLocaleDateString()}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Estadísticas del cliente
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Compras</Typography>
                    <Typography fontWeight="bold">{cliente.totalCompras || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Total gastado</Typography>
                    <Typography fontWeight="bold">S/ {(cliente.totalGastado || 0).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Última compra</Typography>
                    <Typography fontWeight="bold">{cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString() : 'Sin compras'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Notas</Typography>
                    <Typography fontWeight="bold">{cliente.notas || 'Sin notas'}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[1] }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Descripción adicional
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Notes color="action" />
                <Typography color="text.secondary">Información adicional guardada por el equipo.</Typography>
              </Box>
              <Typography sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                {cliente.notas || 'No hay notas adicionales para este cliente.'}
              </Typography>
            </Paper>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
