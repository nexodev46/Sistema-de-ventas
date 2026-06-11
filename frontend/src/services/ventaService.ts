import { collection, doc, getDocs, getDoc, addDoc, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Venta } from '../types/venta.types'

const COLLECTION_NAME = 'ventas'

export const ventaService = {
  getAll: async (): Promise<Venta[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Venta))
    } catch (error) {
      console.error('Error obteniendo ventas:', error)
      return []
    }
  },

  subscribeAll: (callback: (ventas: Venta[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'))
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Venta))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de ventas:', error)
      }
    )
  },

  create: async (ventaData: Omit<Venta, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), ventaData)
      return docRef.id
    } catch (error) {
      console.error('Error creando venta:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<Venta | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Venta) : null
    } catch (error) {
      console.error('Error obteniendo venta:', error)
      return null
    }
  },

  deleteVenta: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error eliminando venta:', error)
      throw error
    }
  },
}
