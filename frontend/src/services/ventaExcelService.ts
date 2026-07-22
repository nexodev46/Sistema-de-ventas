import * as XLSX from 'xlsx'
import { Venta } from '../types/venta.types'

/**
 * Servicio para exportar ventas a Excel
 */

interface ExcelVenta {
  'N° Venta': string
  'Fecha': string
  'Hora': string
  'Cliente': string
  'DNI/RUC': string
  'Email': string
  'Teléfono': string
  'Método Pago': string
  'Subtotal': number
  'IGV (18%)': number
  'Total': number
  'Estado': string
  'Productos': string
}

/**
 * Exporta un listado de ventas a un archivo Excel
 * @param ventas Array de ventas a exportar
 * @param nombreArchivo Nombre del archivo (sin extensión)
 */
export const descargarVentasExcel = (ventas: Venta[], nombreArchivo = 'Ventas') => {
  try {
    // Preparar datos para Excel
    const datosExcel: ExcelVenta[] = ventas.map((venta) => {
      // Obtener lista de productos
      const productos = (venta.productos || [])
        .map((p) => `${p.nombre} (Cant: ${p.cantidad}, Precio: ${p.precio})`)
        .join('; ')

      return {
        'N° Venta': venta.numero?.toString() || '',
        'Fecha': venta.fecha || '',
        'Hora': venta.hora || '',
        'Cliente': venta.cliente?.nombre || '',
        'DNI/RUC': venta.cliente?.documento || '',
        'Email': venta.cliente?.email || '',
        'Teléfono': venta.cliente?.telefono || '',
        'Método Pago': venta.metodoPago || '',
        'Subtotal': venta.subtotal || 0,
        'IGV (18%)': (venta.total - (venta.subtotal || 0)) || 0,
        'Total': venta.total || 0,
        'Estado': venta.estado || '',
        'Productos': productos,
      }
    })

    // Crear workbook
    const worksheet = XLSX.utils.json_to_sheet(datosExcel, {
      header: [
        'N° Venta',
        'Fecha',
        'Hora',
        'Cliente',
        'DNI/RUC',
        'Email',
        'Teléfono',
        'Método Pago',
        'Subtotal',
        'IGV (18%)',
        'Total',
        'Estado',
        'Productos',
      ],
    })

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 12 }, // N° Venta
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 20 }, // Cliente
      { wch: 14 }, // DNI/RUC
      { wch: 20 }, // Email
      { wch: 14 }, // Teléfono
      { wch: 14 }, // Método Pago
      { wch: 12 }, // Subtotal
      { wch: 12 }, // IGV
      { wch: 12 }, // Total
      { wch: 12 }, // Estado
      { wch: 40 }, // Productos
    ]
    worksheet['!cols'] = columnWidths

    // Estilos para encabezado (si es posible)
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1976D2' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      }
    }

    // Crear workbook y agregar hoja
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas')

    // Generar nombre de archivo con fecha
    const fecha = new Date().toISOString().split('T')[0]
    const nombreFinal = `${nombreArchivo}_${fecha}.xlsx`

    // Descargar archivo
    XLSX.writeFile(workbook, nombreFinal)
  } catch (error) {
    console.error('Error al exportar Excel:', error)
    throw new Error('No se pudo exportar a Excel')
  }
}

/**
 * Exporta una venta individual a Excel
 * @param venta Venta a exportar
 */
export const descargarVentaExcel = (venta: Venta) => {
  const nombreCliente = venta.cliente?.nombre?.replace(/\s+/g, '_') || 'venta'
  descargarVentasExcel([venta], `Venta_${nombreCliente}`)
}

/**
 * Exporta ventas con resumen
 * @param ventas Array de ventas
 * @param nombreArchivo Nombre base del archivo
 */
export const descargarVentasConResumen = (ventas: Venta[], nombreArchivo = 'Ventas_Resumen') => {
  try {
    // Datos de ventas
    const datosVentas: ExcelVenta[] = ventas.map((venta) => {
      const productos = (venta.productos || [])
        .map((p) => `${p.nombre} (Cant: ${p.cantidad}, Precio: ${p.precio})`)
        .join('; ')

      return {
        'N° Venta': venta.numero?.toString() || '',
        'Fecha': venta.fecha || '',
        'Hora': venta.hora || '',
        'Cliente': venta.cliente?.nombre || '',
        'DNI/RUC': venta.cliente?.documento || '',
        'Email': venta.cliente?.email || '',
        'Teléfono': venta.cliente?.telefono || '',
        'Método Pago': venta.metodoPago || '',
        'Subtotal': venta.subtotal || 0,
        'IGV (18%)': (venta.total - (venta.subtotal || 0)) || 0,
        'Total': venta.total || 0,
        'Estado': venta.estado || '',
        'Productos': productos,
      }
    })

    // Calcular resumen
    const totalVentas = ventas.length
    const montoTotal = ventas.reduce((sum, v) => sum + v.total, 0)
    const montoSubtotal = ventas.reduce((sum, v) => sum + (v.subtotal || 0), 0)
    const montoIgv = montoTotal - montoSubtotal

    const resumen = [
      {
        'N° Venta': 'RESUMEN',
        'Fecha': '',
        'Hora': '',
        'Cliente': '',
        'DNI/RUC': '',
        'Email': '',
        'Teléfono': '',
        'Método Pago': '',
        'Subtotal': montoSubtotal,
        'IGV (18%)': montoIgv,
        'Total': montoTotal,
        'Estado': `${totalVentas} ventas`,
        'Productos': '',
      },
    ]

    // Crear workbook
    const worksheet1 = XLSX.utils.json_to_sheet(datosVentas)
    const worksheet2 = XLSX.utils.json_to_sheet(resumen)

    const columnWidths = [
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 14 },
      { wch: 20 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 40 },
    ]

    worksheet1['!cols'] = columnWidths
    worksheet2['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Ventas')
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Resumen')

    const fecha = new Date().toISOString().split('T')[0]
    const nombreFinal = `${nombreArchivo}_${fecha}.xlsx`

    XLSX.writeFile(workbook, nombreFinal)
  } catch (error) {
    console.error('Error al exportar Excel con resumen:', error)
    throw new Error('No se pudo exportar a Excel')
  }
}
