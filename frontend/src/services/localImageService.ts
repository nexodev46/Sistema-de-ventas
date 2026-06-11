const UPLOADS_SERVER_URL =
  import.meta.env.VITE_UPLOADS_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:4000'

export const localImageService = {
  uploadProductImages: async (productoId: string, files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return []
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    const res = await fetch(`${UPLOADS_SERVER_URL}/api/uploads/productos/${productoId}`, {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) throw new Error('Error subiendo imágenes al servidor local')
    const data = await res.json()
    return data.urls || []
  },

  uploadBrandImage: async (marcaId: string, file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('files', file)
    const res = await fetch(`${UPLOADS_SERVER_URL}/api/uploads/marcas/${marcaId}`, {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) throw new Error('Error subiendo imagen de marca al servidor local')
    const data = await res.json()
    return (data.urls && data.urls[0]) || ''
  },

  uploadProfileImage: async (userId: string, file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('files', file)
    const res = await fetch(`${UPLOADS_SERVER_URL}/api/uploads/perfiles/${userId}`, {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) throw new Error('Error subiendo imagen de perfil al servidor local')
    const data = await res.json()
    return (data.urls && data.urls[0]) || ''
  }
}
