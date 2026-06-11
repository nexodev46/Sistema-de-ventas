export interface Categoria {
  id: string
  nombre: string
  descripcion: string
  color: string
  icono: string
  productoCount: number
  activo: boolean
  creadoEn: string
}

export interface CategoriaFormData {
  nombre: string
  descripcion: string
  color: string
  icono: string
}