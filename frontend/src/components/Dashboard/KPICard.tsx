import React from 'react'
import { Card, CardContent, Typography, Box, Skeleton, useTheme } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

interface KPICardProps { title: string; value: number; prefix?: string; suffix?: string; variation?: number; variationText?: string; loading?: boolean }

export const KPICard: React.FC<KPICardProps> = ({ title, value, prefix = '', suffix = '', variation = 0, variationText = 'vs mes pasado', loading = false }) => {
  const theme = useTheme()
  if (loading) return (
    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Skeleton sx={{ height: 24, mb: 1 }} />
        <Skeleton sx={{ height: 36, mb: 1 }} />
        <Skeleton sx={{ height: 12 }} />
      </CardContent>
    </Card>
  )
  const isPositive = variation >= 0
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(2,6,23,0.08)', overflow: 'hidden' }}>
      <CardContent sx={{ bgcolor: theme.palette.mode === 'light' ? 'white' : 'background.paper', p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ letterSpacing: 0.4 }}>{title}</Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>{prefix}{value.toLocaleString()}{suffix}</Typography>
        {variation !== 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main', bgcolor: isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)', px: 1, py: 0.5, borderRadius: 1 }}>
              {isPositive ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>{Math.abs(variation)}%</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">{variationText}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}