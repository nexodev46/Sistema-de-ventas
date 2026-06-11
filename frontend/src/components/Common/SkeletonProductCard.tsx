import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material'
import { motion } from 'framer-motion'

export const SkeletonProductCard = () => {
  const theme = useTheme()

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -8 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Imagen placeholder */}
          <Box
            sx={{
              position: 'relative',
              pt: '100%',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              overflow: 'hidden',
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            {/* Chips placeholder */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1 }}>
              <Skeleton variant="rounded" width="30%" height={24} />
              <Skeleton variant="rounded" width="35%" height={24} />
            </Box>

            {/* Título placeholder */}
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} width="85%" sx={{ mb: 2 }} />

            {/* Precio placeholder */}
            <Skeleton variant="text" height={32} width="60%" sx={{ mb: 2 }} />

            {/* Stock info placeholder */}
            <Skeleton variant="text" height={16} width="70%" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={16} width="80%" />
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
            {/* Botones placeholder */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
            <Skeleton variant="circular" width={40} height={40} />
          </CardActions>
        </Card>
      </motion.div>
    </Grid>
  )
}

export const SkeletonProductCardGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </Grid>
  )
}
