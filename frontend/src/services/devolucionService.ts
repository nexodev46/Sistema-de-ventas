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
import { Devolucion, DevolucionFormData } from '../types/devolucion.types'

const COLLECTION_NAME = 'devoluciones'

export const devolucionService = {
  // Obtener todas las devoluciones
  getAll: async (): Promise<Devolucion[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'))
      const querySnapshot = await getDocs(q)
      const devoluciones: Devolucion[] = []
      querySnapshot.forEach((doc) => {
        devoluciones.push({ id: doc.id, ...doc.data() } as Devolucion)
      })
      return devoluciones
    } catch (error) {
      console.error('Error obteniendo devoluciones:', error)
      return []
    }
  },

  subscribeAll: (callback: (devoluciones: Devolucion[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'))
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Devolucion))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de devoluciones:', error)
      }
    )
  },

  // Obtener devolución por ID
  getById: async (id: string): Promise<Devolucion | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Devolucion
      }
      return null
    } catch (error) {
      console.error('Error obteniendo devolución:', error)
      return null
    }
  },

  // Obtener devoluciones por venta
  getByVentaId: async (ventaId: string): Promise<Devolucion[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('ventaOriginal.id', '==', ventaId))
      const querySnapshot = await getDocs(q)
      const devoluciones: Devolucion[] = []
      querySnapshot.forEach((doc) => {
        devoluciones.push({ id: doc.id, ...doc.data() } as Devolucion)
      })
      return devoluciones
    } catch (error) {
      console.error('Error obteniendo devoluciones por venta:', error)
      return []
    }
  },

  // Crear nueva devolución
  create: async (devolucion: Omit<Devolucion, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), devolucion)
      return docRef.id
    } catch (error) {
      console.error('Error creando devolución:', error)
      throw error
    }
  },

  // Actualizar estado de devolución
  updateEstado: async (id: string, estado: Devolucion['estado']): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, { estado })
    } catch (error) {
      console.error('Error actualizando estado:', error)
      throw error
    }
  },

  deleteDevolucion: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error eliminando devolución:', error)
      throw error
    }
  },

  // Obtener total de devoluciones
  getTotalCount: async (): Promise<number> => {
    try {
      const devoluciones = await devolucionService.getAll()
      return devoluciones.length
    } catch (error) {
      return 0
    }
  },

  // Obtener total reembolsado en el mes
  getTotalReembolsadoMes: async (): Promise<number> => {
    try {
      const devoluciones = await devolucionService.getAll()
      const mesActual = new Date().getMonth()
      const devolucionesMes = devoluciones.filter(d => 
        new Date(d.fecha).getMonth() === mesActual && 
        d.estado === 'COMPLETADA'
      )
      return devolucionesMes.reduce((sum, d) => sum + d.subtotal, 0)
    } catch (error) {
      return 0
    }
  },
}