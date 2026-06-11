import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Chip,
} from '@mui/material'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp, CalendarToday, ShowChart } from '@mui/icons-material'
import { Periodo, getPeriodLabel } from '../../utils/chartHelpers'

type SalesChartData =
  | { fecha: string; total: number }
  | { hora: string; total: number }

interface SalesChartProps {
  data: SalesChartData[]
  loading?: boolean
  periodo?: Periodo
  setPeriodo?: (periodo: Periodo) => void
}

// Datos de ejemplo para diferentes períodos (cuando no hay datos reales)
const sampleData = {
  dia: [
    { hora: '00:00', total: 0 },
    { hora: '04:00', total: 0 },
    { hora: '08:00', total: 0 },
    { hora: '12:00', total: 0 },
    { hora: '16:00', total: 0 },
    { hora: '20:00', total: 0 },
  ],
  semana: [
    { fecha: 'Lun', total: 0 },
    { fecha: 'Mar', total: 0 },
    { fecha: 'Mié', total: 0 },
    { fecha: 'Jue', total: 0 },
    { fecha: 'Vie', total: 0 },
    { fecha: 'Sáb', total: 0 },
    { fecha: 'Dom', total: 0 },
  ],
  mes: [
    { fecha: 'Sem 1', total: 0 },
    { fecha: 'Sem 2', total: 0 },
    { fecha: 'Sem 3', total: 0 },
    { fecha: 'Sem 4', total: 0 },
  ],
  ano: [
    { fecha: 'Ene', total: 0 },
    { fecha: 'Feb', total: 0 },
    { fecha: 'Mar', total: 0 },
    { fecha: 'Abr', total: 0 },
    { fecha: 'May', total: 0 },
    { fecha: 'Jun', total: 0 },
    { fecha: 'Jul', total: 0 },
    { fecha: 'Ago', total: 0 },
    { fecha: 'Sep', total: 0 },
    { fecha: 'Oct', total: 0 },
    { fecha: 'Nov', total: 0 },
    { fecha: 'Dic', total: 0 },
  ],
}

export const SalesChart: React.FC<SalesChartProps> = ({ 
  data, 
  loading = false,
  periodo: periodoFromProps = 'semana',
  setPeriodo: setPeriodoFromProps
}) => {
  const theme = useTheme()
  const [localPeriodo, setLocalPeriodo] = useState<Periodo>(periodoFromProps)
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area')
  const [displayData, setDisplayData] = useState<SalesChartData[]>([])

  // Usar las props o el estado local
  const periodo = setPeriodoFromProps ? periodoFromProps : localPeriodo
  const setPeriodo = setPeriodoFromProps || setLocalPeriodo

  useEffect(() => {
    if (data && data.length > 0) {
      setDisplayData(data)
    } else {
      setDisplayData(sampleData[periodo])
    }
  }, [data, periodo])

  const handlePeriodoChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriodo: Periodo | null
  ) => {
    if (newPeriodo !== null) {
      setPeriodo(newPeriodo)
    }
  }

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: 'area' | 'bar' | 'line' | null
  ) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `S/ ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `S/ ${(value / 1000).toFixed(0)}k`
    return `S/ ${value}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
            S/ {payload[0].value.toLocaleString()}
          </Typography>
        </Box>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey={periodo === 'dia' ? 'hora' : 'fecha'}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey={periodo === 'dia' ? 'hora' : 'fecha'}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main, r: 4 }}
            />
          </LineChart>
        )
      default:
        return (
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey={periodo === 'dia' ? 'hora' : 'fecha'}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fill="url(#colorSales)"
            />
          </AreaChart>
        )
    }
  }

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Box>
    )
  }

  const hasData = displayData.some((item) => item.total > 0)

  return (
    <Box>
      {/* Selectores de período y tipo de gráfico */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
          <ToggleButtonGroup
            value={periodo}
            exclusive
            onChange={handlePeriodoChange}
            aria-label="período"
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.5,
                fontSize: 13,
                borderRadius: 1.2,
                textTransform: 'none'
              },
              '& .MuiToggleButton-root.Mui-selected': {
                bgcolor: 'primary.main',
                color: '#fff',
                boxShadow: '0 8px 20px rgba(2,6,23,0.08)'
              }
            }}
          >
            <ToggleButton value="dia">Día</ToggleButton>
            <ToggleButton value="semana">Semana</ToggleButton>
            <ToggleButton value="mes">Mes</ToggleButton>
            <ToggleButton value="ano">Año</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShowChart sx={{ fontSize: 20, color: 'text.secondary' }} />
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="tipo de gráfico"
            size="small"
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none' }, '& .MuiToggleButton-root.Mui-selected': { bgcolor: 'primary.main', color: '#fff' } }}
          >
            <ToggleButton value="area">Área</ToggleButton>
            <ToggleButton value="bar">Barras</ToggleButton>
            <ToggleButton value="line">Línea</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Indicador del período actual */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip
          label={getPeriodLabel(periodo)}
          size="small"
          color="primary"
          variant="outlined"
        />
        {!hasData && (
          <Typography variant="caption" color="text.secondary">
            Sin datos registrados para este período
          </Typography>
        )}
      </Box>

      {/* Gráfico */}
      {!hasData ? (
        <Box
          sx={{
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(16,185,129,0.04))',
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(2,6,23,0.04)'
          }}
        >
          <TrendingUp sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.primary" sx={{ mb: 0.5 }}>
            Sin datos de ventas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Registra tus primeras ventas para ver el gráfico
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          {renderChart()}
        </ResponsiveContainer>
      )}

      {/* Resumen del período */}
      {hasData && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Total del período: S/ {displayData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              📈 vs período anterior: +0%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              🎯 Promedio: S/ 0
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}