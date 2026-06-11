export interface ProductoDevuelto {
  id: string
  codigo: string
  nombre: string
  cantidad: number
  precio: number
  subtotal: number
  motivo: string
}

export interface Devolucion {
  id: string
  numero: string
  fecha: string
  hora: string
  ventaOriginal: {
    id: string
    numero: string
    fecha: string
  }
  cliente: {
    id: string
    nombre: string
    documento: string
    telefono?: string
  }
  productos: ProductoDevuelto[]
  subtotal: number
  motivoGeneral: string
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'COMPLETADA'
  tipoDevolucion: 'PARCIAL' | 'TOTAL'
  metodoReembolso: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  observaciones: string
  creadoPor: {
    id: string
    nombre: string
  }
  creadoEn: string
}

export interface DevolucionFormData {
  ventaId: string
  productos: ProductoDevuelto[]
  motivoGeneral: string
  tipoDevolucion: 'PARCIAL' | 'TOTAL'
  metodoReembolso: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  observaciones: string
}