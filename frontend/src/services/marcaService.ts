import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { Marca, MarcaFormData } from '../types/marca.types'
import { productoService } from './productoService'

const COLLECTION_NAME = 'marcas'

export const marcaService = {
  // Obtener todas las marcas activas
  getAll: async (): Promise<Marca[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('activo', '==', true), orderBy('nombre', 'asc'))
      const querySnapshot = await getDocs(q)
      const marcas: Marca[] = []
      querySnapshot.forEach((doc) => {
        marcas.push({ id: doc.id, ...doc.data() } as Marca)
      })
      
      // Contar productos por marca
      const productos = await productoService.getAll()
      for (const marca of marcas) {
        marca.productoCount = productos.filter(p => p.marca === marca.nombre).length
      }
      
      return marcas
    } catch (error) {
      console.error('Error obteniendo marcas:', error)
      return []
    }
  },

  subscribeAll: (callback: (marcas: Marca[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), where('activo', '==', true), orderBy('nombre', 'asc'))
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Marca))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de marcas:', error)
      }
    )
  },

  // Obtener marca por ID
  getById: async (id: string): Promise<Marca | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Marca
      }
      return null
    } catch (error) {
      console.error('Error obteniendo marca:', error)
      return null
    }
  },

  // Crear nueva marca
  create: async (data: MarcaFormData): Promise<string> => {
    try {
      const now = new Date().toISOString()
      const marcaData = {
        ...data,
        productoCount: 0,
        activo: true,
        creadoEn: now,
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), marcaData)
      return docRef.id
    } catch (error) {
      console.error('Error creando marca:', error)
      throw error
    }
  },

  // Actualizar marca
  update: async (id: string, data: Partial<MarcaFormData>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, data)
    } catch (error) {
      console.error('Error actualizando marca:', error)
      throw error
    }
  },

  // Eliminar marca (soft delete)
  delete: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, { activo: false })
    } catch (error) {
      console.error('Error eliminando marca:', error)
      throw error
    }
  },

  // Obtener total de marcas
  getTotalCount: async (): Promise<number> => {
    try {
      const marcas = await marcaService.getAll()
      return marcas.length
    } catch (error) {
      return 0
    }
  },
}