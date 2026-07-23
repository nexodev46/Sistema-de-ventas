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
import { Cliente, ClienteFormData } from '../types/cliente.types'

const COLLECTION_NAME = 'clientes'

export const clienteService = {
  // Obtener todos los clientes activos
  getAll: async (): Promise<Cliente[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('activo', '==', true),
        orderBy('nombre', 'asc')
      )
      const querySnapshot = await getDocs(q)
      const clientes: Cliente[] = []
      querySnapshot.forEach((doc) => {
        clientes.push({ id: doc.id, ...doc.data() } as Cliente)
      })
      return clientes
    } catch (error) {
      console.error('Error obteniendo clientes:', error)
      return []
    }
  },

  subscribeAll: (callback: (clientes: Cliente[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('activo', '==', true),
      orderBy('nombre', 'asc')
    )
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Cliente))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de clientes:', error)
      }
    )
  },

  // Obtener cliente por ID
  getById: async (id: string): Promise<Cliente | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Cliente
      }
      return null
    } catch (error) {
      console.error('Error obteniendo cliente:', error)
      return null
    }
  },

  // Crear nuevo cliente
  create: async (data: ClienteFormData): Promise<string> => {
    try {
      const now = new Date().toISOString()
      const clienteData = {
        ...data,
        totalCompras: 0,
        totalGastado: 0,
        ultimaCompra: '',
        fechaRegistro: now,
        activo: true,
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), clienteData)
      return docRef.id
    } catch (error) {
      console.error('Error creando cliente:', error)
      throw error
    }
  },

  // Actualizar cliente
  update: async (id: string, data: Partial<Omit<Cliente, 'id'>>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, data)
    } catch (error) {
      console.error('Error actualizando cliente:', error)
      throw error
    }
  },

  subscribeById: (id: string, callback: (cliente: Cliente | null) => void, errorCallback?: (error: Error) => void) => {
    const docRef = doc(db, COLLECTION_NAME, id)
    return onSnapshot(
      docRef,
      (snapshot) => callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Cliente) : null),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción del cliente:', error)
      }
    )
  },

  // Eliminar cliente (soft delete)
  delete: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, { activo: false })
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      throw error
    }
  },

  // Buscar clientes
  search: async (termino: string): Promise<Cliente[]> => {
    try {
      const clientes = await clienteService.getAll()
      const term = termino.toLowerCase()
      return clientes.filter(c => 
        c.nombre.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.documento.includes(term) ||
        c.telefono.includes(term)
      )
    } catch (error) {
      console.error('Error buscando clientes:', error)
      return []
    }
  },

  // Obtener total de clientes
  getTotalCount: async (): Promise<number> => {
    try {
      const clientes = await clienteService.getAll()
      return clientes.length
    } catch (error) {
      return 0
    }
  },
}