import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { Categoria, CategoriaFormData } from '../types/categoria.types'
import { productoService } from './productoService'

const COLLECTION_NAME = 'categorias'

export const categoriaService = {
  // Obtener todas las categorías activas
  getAll: async (): Promise<Categoria[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('activo', '==', true), orderBy('nombre', 'asc'))
      const querySnapshot = await getDocs(q)
      const categorias: Categoria[] = []
      querySnapshot.forEach((doc) => {
        categorias.push({ id: doc.id, ...doc.data() } as Categoria)
      })
      
      // Contar productos por categoría
      const productos = await productoService.getAll()
      for (const categoria of categorias) {
        categoria.productoCount = productos.filter(p => p.categoria === categoria.nombre).length
      }
      
      return categorias
    } catch (error) {
      console.error('Error obteniendo categorías:', error)
      return []
    }
  },

  subscribeAll: (callback: (categorias: Categoria[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), where('activo', '==', true), orderBy('nombre', 'asc'))
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Categoria))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de categorías:', error)
      }
    )
  },

  // Obtener categoría por ID
  getById: async (id: string): Promise<Categoria | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Categoria
      }
      return null
    } catch (error) {
      console.error('Error obteniendo categoría:', error)
      return null
    }
  },

  // Crear nueva categoría
  create: async (data: CategoriaFormData): Promise<string> => {
    try {
      const now = new Date().toISOString()
      const categoriaData = {
        ...data,
        productoCount: 0,
        activo: true,
        creadoEn: now,
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), categoriaData)
      return docRef.id
    } catch (error) {
      console.error('Error creando categoría:', error)
      throw error
    }
  },

  // Actualizar categoría
  update: async (id: string, data: Partial<CategoriaFormData>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, data)
    } catch (error) {
      console.error('Error actualizando categoría:', error)
      throw error
    }
  },

  // Eliminar categoría (soft delete)
  delete: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, { activo: false })
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      throw error
    }
  },

  // Obtener total de categorías
  getTotalCount: async (): Promise<number> => {
    try {
      const categorias = await categoriaService.getAll()
      return categorias.length
    } catch (error) {
      return 0
    }
  },
}