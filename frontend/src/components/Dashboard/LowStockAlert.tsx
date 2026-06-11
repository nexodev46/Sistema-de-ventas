import React from 'react'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Skeleton, Chip } from '@mui/material'
import { Warning } from '@mui/icons-material'

export const LowStockAlert: React.FC<{ products: any[]; loading?: boolean }> = ({ products, loading }) => {
  if (loading) return <Card><CardContent><Skeleton /><Skeleton /><Skeleton /></CardContent></Card>
  return <Card><CardContent><Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Warning color="warning" />Stock bajo</Typography>{!products || products.length === 0 ? <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay productos con stock bajo</Typography></Box> : <List>{products.map((p, i) => <ListItem key={i} sx={{ px: 0 }}><ListItemText primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">{p.nombre}</Typography><Chip label={`Stock: ${p.stock} uds`} size="small" color="warning" variant="outlined" /></Box>} secondary={`Mínimo: ${p.stockMinimo} unidades`} /></ListItem>)}</List>}</CardContent></Card>
}