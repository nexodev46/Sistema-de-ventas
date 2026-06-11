export interface Marca {
  id: string
  nombre: string
  descripcion: string
  logo: string
  color: string
  imagenUrl?: string
  productoCount: number
  activo: boolean
  creadoEn: string
}

export interface MarcaFormData {
  nombre: string
  descripcion: string
  logo: string
  color: string
  imagenUrl?: string
}