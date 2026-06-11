import React from 'react'
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Skeleton, Chip, useTheme } from '@mui/material'

export const RecentSales: React.FC<{ sales: any[]; loading?: boolean }> = ({ sales, loading }) => {
  const theme = useTheme()
  if (loading) return <Card sx={{ borderRadius: 3, boxShadow: 4 }}><CardContent><Skeleton /><Skeleton /></CardContent></Card>
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 12px 34px rgba(2,6,23,0.06)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Últimas ventas</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Venta</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!sales || sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No hay ventas registradas</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map(s => (
                  <TableRow key={s.id} hover sx={{ '&:hover': { background: theme.palette.action.hover } }}>
                    <TableCell><Chip label={s.id} size="small" variant="outlined" /></TableCell>
                    <TableCell>{s.cliente}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{s.fecha}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.hora}</Typography>
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight={700}>S/ {s.total.toLocaleString()}</Typography></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}