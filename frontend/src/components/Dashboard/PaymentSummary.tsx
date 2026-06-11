import React from 'react'
import { Card, CardContent, Typography, Box, LinearProgress, Skeleton, useTheme } from '@mui/material'

export const PaymentSummary: React.FC<{ data: any; loading?: boolean }> = ({ data, loading }) => {
  const theme = useTheme()
  if (loading) return <Card sx={{ borderRadius: 3, boxShadow: 4 }}><CardContent><Skeleton /><Skeleton /><Skeleton /></CardContent></Card>
  const methods = [{ label: 'Efectivo', value: data.efectivo, color: '#10b981' }, { label: 'Tarjeta', value: data.tarjeta, color: '#3b82f6' }, { label: 'Yape', value: data.yape, color: '#8b5cf6' }, { label: 'Transferencia', value: data.transferencia, color: '#f59e0b' }]
  const getPercent = (v: number) => data.total === 0 ? 0 : (v / data.total) * 100
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 12px 34px rgba(2,6,23,0.06)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Resumen de pagos</Typography>
        {data.total === 0 ? (
          <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No hay ventas registradas</Typography>
          </Box>
        ) : (
          <>
            {methods.map(m => (
              <Box key={m.label} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{m.label}</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>S/ {m.value.toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{getPercent(m.value).toFixed(1)}%</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={getPercent(m.value)} sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.action.hover, '& .MuiLinearProgress-bar': { bgcolor: m.color, borderRadius: 4 } }} />
              </Box>
            ))}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">S/ {data.total.toLocaleString()}</Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}