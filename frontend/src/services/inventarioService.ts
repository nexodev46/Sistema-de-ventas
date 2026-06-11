import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'
import { MovimientoInventario } from '../types/producto.types'

const COLLECTION_NAME = 'movimientos_inventario'

export const inventarioService = {
  registrarMovimiento: async (movimiento: Omit<MovimientoInventario, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), movimiento)
    return docRef.id
  },

  getAllMovimientos: async (): Promise<MovimientoInventario[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('registradoEn', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MovimientoInventario))
  },

  eliminarMovimiento: async (movimientoId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, movimientoId))
  },
}
