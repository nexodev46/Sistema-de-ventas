export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  precioCompra: number
  precioVenta: number
  stockActual: number
  stockMinimo: number
  categoria: string
  marca: string
  imagenUrl?: string
  imagenes?: string[]
  oferta?: boolean
  destacado?: boolean
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface ProductoFormData {
  codigo: string
  nombre: string
  descripcion: string
  precioCompra: number
  precioVenta: number
  stockActual: number
  stockMinimo: number
  categoria: string
  marca: string
  imagenUrl?: string
  imagenes?: string[]
  oferta?: boolean
  destacado?: boolean
}

export interface MovimientoInventario {
  id: string
  productoId: string
  productoNombre: string
  tipo: 'entrada' | 'salida'
  cantidad: number
  motivo: string
  observacion?: string
  proveedor?: string
  cliente?: string
  costoUnitario?: number
  precioUnitario?: number
  stockAntes?: number
  stockDespues?: number
  registradoEn: string
}