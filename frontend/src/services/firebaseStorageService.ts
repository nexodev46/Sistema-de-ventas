import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, uploadBytesResumable } from 'firebase/storage'
import { storage } from './firebase'

export const firebaseStorageService = {
  // Subir imagen de producto
  uploadProductImage: async (productoId: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `productos/${productoId}/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
  },

  // Subir imagen con progreso
  uploadProductImageWithProgress: (
    productoId: string, 
    file: File, 
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `productos/${productoId}/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress(progress)
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        }
      )
    })
  },

  // Subir imagen de perfil de usuario
  uploadProfileImage: async (userId: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `perfiles/${userId}/avatar_${Date.now()}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
  },

  // Subir múltiples imágenes de producto
  uploadProductImages: async (productoId: string, files: File[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const storageRef = ref(storage, `productos/${productoId}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      urls.push(url)
    }
    return urls
  },

  // Eliminar imagen
  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      throw error
    }
  },

  // Eliminar imagen por ruta
  deleteImageByPath: async (path: string): Promise<void> => {
    try {
      const imageRef = ref(storage, path)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      throw error
    }
  },

  // Obtener todas las imágenes de un producto
  getProductImages: async (productoId: string): Promise<{ url: string; path: string }[]> => {
    try {
      const listRef = ref(storage, `productos/${productoId}`)
      const result = await listAll(listRef)
      const images = await Promise.all(
        result.items.map(async (item) => ({
          url: await getDownloadURL(item),
          path: item.fullPath
        }))
      )
      return images
    } catch (error) {
      console.error('Error obteniendo imágenes:', error)
      return []
    }
  },

  // Eliminar todas las imágenes de un producto
  deleteAllProductImages: async (productoId: string): Promise<void> => {
    try {
      const listRef = ref(storage, `productos/${productoId}`)
      const result = await listAll(listRef)
      await Promise.all(result.items.map(item => deleteObject(item)))
    } catch (error) {
      console.error('Error eliminando imágenes:', error)
      throw error
    }
  },

  // Subir imagen de categoría
  uploadCategoryImage: async (categoryId: string, file: File): Promise<string> => {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-_]/g, '_')}`
    const storageRef = ref(storage, `categorias/${categoryId}/${safeName}`)
    await uploadBytes(storageRef, file, { contentType: file.type })
    const url = await getDownloadURL(storageRef)
    return url
  },

  // Subir logo de marca
  uploadBrandImage: async (brandId: string, file: File): Promise<string> => {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-_]/g, '_')}`
    const storageRef = ref(storage, `marcas/${brandId}/${safeName}`)
    await uploadBytes(storageRef, file, { contentType: file.type })
    const url = await getDownloadURL(storageRef)
    return url
  }
}