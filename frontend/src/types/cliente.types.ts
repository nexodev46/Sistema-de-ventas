export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE'
  fechaNacimiento: string
  fechaRegistro: string
  totalCompras: number
  ultimaCompra: string
  notas: string
  activo: boolean
}

export interface ClienteFormData {
  nombre: string
  email: string
  telefono: string
  direccion: string
  documento: string
  tipoDocumento: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE'
  fechaNacimiento: string
  notas: string
}