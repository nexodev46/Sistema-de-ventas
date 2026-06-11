import { Box, Button, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'

export const DetalleVenta = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/ventas')} sx={{ mb: 3 }}>
        Volver a Ventas
      </Button>
      <Typography variant="h4" gutterBottom>Detalle de Venta</Typography>
      <Typography variant="body1" color="text.secondary">
        ID de venta: {id}
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Aquí puedes mostrar los detalles de la venta seleccionada cuando el servicio de ventas esté listo.
      </Typography>
    </Box>
  )
}
