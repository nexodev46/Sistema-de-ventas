export interface AjusteInventario {
  id: string
  fecha: string
  hora: string
  producto: {
    id: string
    codigo: string
    nombre: string
  }
  cantidadAnterior: number
  cantidadNueva: number
  diferencia: number
  motivo: 'CORRECCION' | 'MERMA' | 'SOBRANTE' | 'CADUCIDAD' | 'ROTURA' | 'OTRO'
  observacion: string
  creadoPor: {
    id: string
    nombre: string
  }
  creadoEn: string
}

export interface AjusteFormData {
  productoId: string
  nuevaCantidad: number
  motivo: AjusteInventario['motivo']
  observacion: string
}