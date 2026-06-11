import React from 'react'
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Divider, Skeleton, Avatar, useTheme } from '@mui/material'

export const TopProducts: React.FC<{ products: any[]; loading?: boolean }> = ({ products, loading }) => {
  const theme = useTheme()
  if (loading) return <Card><CardContent><Skeleton /><Skeleton /><Skeleton /></CardContent></Card>
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 12px 30px rgba(2,6,23,0.06)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Top Productos</Typography>
        <List>
          {products.map((p, i) => {
            const title = p.nombre || p.name || p.label || 'Producto'
            const sold = p.unidades || p.sold || p.total || 0
            const image = p.imagen || p.image || ''
            return (
              <ListItem key={i} disableGutters sx={{ py: 1.25, borderRadius: 1, '&:hover': { background: theme.palette.action.hover } }}>
                <Avatar src={image} sx={{ mr: 2, width: 44, height: 44 }} />
                <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>{title}</Typography>} secondary={<Typography variant="caption" color="text.secondary">{sold} vendidos</Typography>} />
              </ListItem>
            )
          })}
        </List>
      </CardContent>
    </Card>
  )
}