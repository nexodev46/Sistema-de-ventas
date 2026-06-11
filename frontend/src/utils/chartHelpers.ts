export type Periodo = 'dia' | 'semana' | 'mes' | 'ano'

export const getPeriodLabel = (periodo: Periodo): string => {
  switch (periodo) {
    case 'dia':
      return 'Hoy'
    case 'semana':
      return 'Esta semana'
    case 'mes':
      return 'Este mes'
    case 'ano':
      return 'Este año'
    default:
      return 'Esta semana'
  }
}
