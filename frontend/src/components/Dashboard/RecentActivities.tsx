import React from 'react'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Skeleton, Avatar, ListItemAvatar } from '@mui/material'
import { Receipt } from '@mui/icons-material'

export const RecentActivities: React.FC<{ activities: any[]; loading?: boolean }> = ({ activities, loading }) => {
  if (loading) return <Card><CardContent><Skeleton /><Skeleton /><Skeleton /></CardContent></Card>
  return <Card><CardContent><Typography variant="h6" gutterBottom>Actividades recientes</Typography>{!activities || activities.length === 0 ? <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body2" color="text.secondary">No hay actividades recientes</Typography></Box> : <List>{activities.map(a => (<ListItem key={a.id} sx={{ px: 0 }}><ListItemAvatar><Avatar sx={{ bgcolor: '#2563eb' }}><Receipt /></Avatar></ListItemAvatar><ListItemText primary={<Typography variant="body2">{a.descripcion}</Typography>} secondary={<><Typography variant="caption" color="text.secondary" display="block">{a.detalle}</Typography><Typography variant="caption" color="text.secondary">{a.tiempo}</Typography></>} /></ListItem>))}</List>}</CardContent></Card>
}