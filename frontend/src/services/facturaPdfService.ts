import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Venta } from '../types/venta.types'

// Interfaz para la configuración de facturación
export interface ConfiguracionFactura {
  empresa: {
    nombre: string
    ruc: string
    direccion: string
    telefono: string
    email: string
  }
  factura: {
    serie: string
    siguienteNumero: number
    iva: number
    ivaNombre: string
    moneda: string
    simbolo: string
    plantilla: string
    incluirIgv: boolean
    mostrarQr: boolean
    piePagina: string
    terminos: string
  }
}

export const facturaPdfService = {
  /**
   * Genera un PDF de factura desde un elemento HTML
   */
  generarPdfDesdeHTML: async (elementId: string, nombreArchivo: string): Promise<void> => {
    try {
      const elemento = document.getElementById(elementId)
      if (!elemento) {
        throw new Error('Elemento no encontrado')
      }

      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      pdf.save(nombreArchivo)
    } catch (error) {
      console.error('Error generando PDF:', error)
      throw error
    }
  },

  /**
   * Genera una factura HTML formateada (clásica)
   */
  generarFacturaHTML: (
    venta: Venta,
    config: ConfiguracionFactura,
    numeroFactura: string
  ): string => {
    // Obtener productos de venta - intentar múltiples fuentes
    const productos = venta.items || venta.productos || []

    // Calcular subtotal basado en los productos disponibles
    let subtotal = 0
    if (productos.length > 0) {
      subtotal = productos.reduce((sum: number, item: any) => {
        return sum + (item.cantidad * item.precio)
      }, 0)
    } else {
      // Si no hay productos, usar el total de la venta si existe
      subtotal = venta.subtotal || venta.total || 0
    }

    // Calcular impuestos
    const impuestos = config.factura.incluirIgv ? (subtotal * config.factura.iva) / 100 : 0
    const totalConImpuestos = subtotal + impuestos

    // Generar filas de productos
    const productosHTML = productos.map(
      (item: any) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.nombre || 'Producto'}</td>
          <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.cantidad}</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${config.factura.simbolo}${(item.precio || 0).toFixed(2)}</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${config.factura.simbolo}${(item.cantidad * (item.precio || 0)).toFixed(2)}</td>
        </tr>
      `
    ).join('')

    return `
      <div id="factura-printable" style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 30px; background: white; color: #333;">
        <!-- Encabezado -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1976d2; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #1976d2; font-size: 28px;">${config.empresa.nombre || 'MI EMPRESA'}</h1>
          <p style="margin: 8px 0; font-size: 13px; font-weight: bold;">RUC: ${config.empresa.ruc || 'No registrado'}</p>
          <p style="margin: 3px 0; font-size: 12px;">${config.empresa.direccion || 'Dirección no registrada'}</p>
          <p style="margin: 3px 0; font-size: 12px;">Tel: ${config.empresa.telefono || '-'} | Email: ${config.empresa.email || '-'}</p>
        </div>

        <!-- Sección: Número y Fecha de Factura -->
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f7ff; border-left: 4px solid #1976d2; border-radius: 4px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Número de Factura</p>
              <p style="margin: 8px 0; font-size: 22px; color: #1976d2; font-weight: bold;">${numeroFactura}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 12px; color: #666;">Fecha de Emisión</p>
              <p style="margin: 8px 0; font-size: 14px; font-weight: bold;">${venta.fecha || new Date().toLocaleDateString('es-PE')}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">Moneda: ${config.factura.moneda || 'PEN'}</p>
            </div>
          </div>
        </div>

        <!-- Datos del cliente -->
        <div style="margin-bottom: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 13px; text-transform: uppercase; color: #1976d2;">Datos del Cliente</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Nombre:</strong> ${venta.cliente?.nombre || 'Cliente Genérico'}</p>
          ${venta.cliente?.documento ? `<p style="margin: 5px 0; font-size: 13px;"><strong>DNI/RUC:</strong> ${venta.cliente.documento}</p>` : ''}
          ${venta.cliente?.email ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Email:</strong> ${venta.cliente.email}</p>` : ''}
          ${venta.cliente?.telefono ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Teléfono:</strong> ${venta.cliente.telefono}</p>` : ''}
          ${venta.cliente?.direccion ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Dirección:</strong> ${venta.cliente.direccion}</p>` : ''}
        </div>

        <!-- Tabla de productos -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 13px; text-transform: uppercase; color: #1976d2;">Detalle de Productos</p>
          <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead>
              <tr style="background-color: #1976d2; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #1976d2; font-weight: bold;">Producto</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1976d2; font-weight: bold;">Cantidad</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #1976d2; font-weight: bold;">Precio Unit.</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #1976d2; font-weight: bold;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML || '<tr><td colspan="4" style="padding: 10px; text-align: center; border: 1px solid #ddd; color: #999;">Sin productos registrados</td></tr>'}
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div style="margin-bottom: 30px; display: flex; justify-content: flex-end;">
          <div style="width: 100%; max-width: 350px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f9f9f9; border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: left; font-size: 13px;">Subtotal:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 13px;">${config.factura.simbolo}${subtotal.toFixed(2)}</td>
              </tr>
              ${config.factura.incluirIgv
        ? `
              <tr style="background-color: #f0f7ff; border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: left; font-size: 13px;">${config.factura.ivaNombre} (${config.factura.iva}%):</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 13px; color: #1976d2;">${config.factura.simbolo}${impuestos.toFixed(2)}</td>
              </tr>
            `
        : ''
      }
              <tr style="border-top: 3px solid #1976d2; background-color: #1976d2; color: white;">
                <td style="padding: 15px; text-align: left; font-weight: bold; font-size: 16px;">TOTAL:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">${config.factura.simbolo}${totalConImpuestos.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Información adicional -->
        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 8px 0; text-align: center; font-size: 13px; color: #333; font-style: italic;">"${config.factura.piePagina || '¡Gracias por su compra!'}"</p>
          ${config.factura.terminos
        ? `<p style="margin: 8px 0; text-align: center; color: #999; font-size: 11px;">${config.factura.terminos}</p>`
        : ''
      }
          <p style="margin-top: 15px; text-align: center; color: #999; font-size: 10px;">Documento generado automáticamente el ${new Date().toLocaleString('es-PE')}</p>
        </div>
      </div>
    `
  },

  /**
   * Descarga una factura en PDF
   */
  descargarFactura: async (
    venta: Venta,
    config: ConfiguracionFactura,
    numeroFactura: string
  ): Promise<void> => {
    try {
      // Crear un contenedor temporal
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = facturaPdfService.generarFacturaHTML(venta, config, numeroFactura)
      document.body.appendChild(tempDiv)

      // Generar el PDF
      await facturaPdfService.generarPdfDesdeHTML('factura-printable', `Factura_${numeroFactura}.pdf`)

      // Limpiar
      document.body.removeChild(tempDiv)
    } catch (error) {
      console.error('Error descargando factura:', error)
      throw error
    }
  },

  /**
   * Vista previa de factura en HTML
   */
  abrirVistaPrevia: (
    venta: Venta,
    config: ConfiguracionFactura,
    numeroFactura: string
  ): void => {
    try {
      const html = facturaPdfService.generarFacturaHTML(venta, config, numeroFactura)
      const ventana = window.open('', 'Vista Previa', 'width=900,height=700')
      if (ventana) {
        ventana.document.write(html)
        ventana.document.close()
      }
    } catch (error) {
      console.error('Error abriendo vista previa:', error)
      throw error
    }
  },

  /**
   * Imprime directamente una factura
   */
  imprimirFactura: async (
    venta: Venta,
    config: ConfiguracionFactura,
    numeroFactura: string
  ): Promise<void> => {
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = facturaPdfService.generarFacturaHTML(venta, config, numeroFactura)
      document.body.appendChild(tempDiv)

      const printWindow = window.open('', '', 'width=900,height=700')
      if (printWindow) {
        printWindow.document.write(tempDiv.innerHTML)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }

      document.body.removeChild(tempDiv)
    } catch (error) {
      console.error('Error imprimiendo factura:', error)
      throw error
    }
  },
}
