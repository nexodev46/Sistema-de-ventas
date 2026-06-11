export interface ProductoVenta {
  id: string
  codigo: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
  imagen?: string
}

export interface Venta {
  id: string
  numero: string
  fecha: string
  cliente: {
    id: string
    nombre: string
    documento: string
  }
  productos: ProductoVenta[]
  subtotal: number
  igv: number
  total: number
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  estado: 'COMPLETADA' | 'ANULADA' | 'PENDIENTE'
  vendedor: {
    id: string
    nombre: string
  }
  hora?: string
}

export interface MetodoPago {
  id: string
  nombre: string
  icono: string
  color: string
}