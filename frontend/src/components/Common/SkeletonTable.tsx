import React from 'react'
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material'

export const SkeletonTableRow = ({ columns = 6 }: { columns?: number }) => {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant="text" height={20} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export const SkeletonTable = ({ rows = 8, columns = 6, hasHeader = true }: { rows?: number; columns?: number; hasHeader?: boolean }) => {
  const theme = useTheme()

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        {hasHeader && (
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" height={24} width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonTableRow key={index} columns={columns} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export const SkeletonDashboardCard = () => {
  const theme = useTheme()

  return (
    <Paper sx={{ borderRadius: 2, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" height={16} width="40%" sx={{ mb: 1 }} />
          <Skeleton variant="text" height={32} width="60%" />
        </Box>
        <Skeleton variant="circular" width={60} height={60} />
      </Box>
    </Paper>
  )
}

export const SkeletonDashboardGrid = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <SkeletonDashboardCard />
        </div>
      ))}
    </>
  )
}
