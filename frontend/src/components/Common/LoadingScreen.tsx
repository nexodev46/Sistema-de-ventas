import React from 'react'
import { Box, Grid, useTheme } from '@mui/material'
import { SkeletonProductCardGrid } from './SkeletonProductCard'
import { SkeletonTable, SkeletonDashboardGrid } from './SkeletonTable'

interface LoadingScreenProps {
  type?: 'products' | 'table' | 'dashboard' | 'cards'
  headerHeight?: number
  itemCount?: number
}

export const LoadingScreen = ({
  type = 'products',
  headerHeight = 120,
  itemCount = 8,
}: LoadingScreenProps) => {
  const theme = useTheme()

  return (
    <Box sx={{ p: 3 }}>
      {/* Header skeleton */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          mb: 4,
          height: headerHeight,
        }}
      />

      {/* Content skeleton based on type */}
      {type === 'products' && <SkeletonProductCardGrid count={itemCount} />}

      {type === 'table' && <SkeletonTable rows={itemCount} columns={7} />}

      {type === 'dashboard' && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <SkeletonDashboardGrid count={4} />
          </Grid>
          <SkeletonTable rows={itemCount} columns={6} />
        </>
      )}

      {type === 'cards' && (
        <Grid container spacing={3}>
          <SkeletonDashboardGrid count={itemCount} />
        </Grid>
      )}
    </Box>
  )
}
