import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, increment, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { Producto, ProductoFormData } from '../types/producto.types'

const COLLECTION_NAME = 'productos'

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const q = query(collection(db, COLLECTION_NAME), where('activo', '==', true), orderBy('nombre', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto))
  },

  subscribeAll: (callback: (productos: Producto[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), where('activo', '==', true), orderBy('nombre', 'asc'))
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de productos:', error)
      }
    )
  },

  getById: async (id: string): Promise<Producto | null> => {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id))
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Producto : null
  },

  create: async (data: ProductoFormData): Promise<string> => {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, COLLECTION_NAME), { ...data, activo: true, creadoEn: now, actualizadoEn: now })
    return docRef.id
  },

  update: async (id: string, data: Partial<ProductoFormData>): Promise<void> => {
    await updateDoc(doc(db, COLLECTION_NAME, id), { ...data, actualizadoEn: new Date().toISOString() })
  },

  updateStock: async (id: string, quantity: number, action: 'incrementar' | 'decrementar'): Promise<void> => {
    const incrementValue = action === 'incrementar' ? quantity : -quantity
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      stockActual: increment(incrementValue),
      actualizadoEn: new Date().toISOString(),
    })
  },

  delete: async (id: string): Promise<void> => {
    await updateDoc(doc(db, COLLECTION_NAME, id), { activo: false })
  },
}