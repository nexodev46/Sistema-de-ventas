import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { AjusteInventario, AjusteFormData } from '../types/ajuste.types'
import { productoService } from './productoService'

const COLLECTION_NAME = 'ajustes_inventario'

export const ajusteService = {
  // Obtener todos los ajustes
  getAll: async (): Promise<AjusteInventario[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'))
      const querySnapshot = await getDocs(q)
      const ajustes: AjusteInventario[] = []
      querySnapshot.forEach((doc) => {
        ajustes.push({ id: doc.id, ...doc.data() } as AjusteInventario)
      })
      return ajustes
    } catch (error) {
      console.error('Error obteniendo ajustes:', error)
      return []
    }
  },

  subscribeAll: (callback: (ajustes: AjusteInventario[]) => void, errorCallback?: (error: Error) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'))
    return onSnapshot(
      q,
      (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AjusteInventario))),
      (error) => {
        if (errorCallback) errorCallback(error)
        else console.error('Error en la suscripción de ajustes:', error)
      }
    )
  },

  // Obtener ajustes por fecha
  getByFecha: async (fechaInicio: string, fechaFin: string): Promise<AjusteInventario[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('fecha', '>=', fechaInicio),
        where('fecha', '<=', fechaFin),
        orderBy('fecha', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const ajustes: AjusteInventario[] = []
      querySnapshot.forEach((doc) => {
        ajustes.push({ id: doc.id, ...doc.data() } as AjusteInventario)
      })
      return ajustes
    } catch (error) {
      console.error('Error obteniendo ajustes por fecha:', error)
      return []
    }
  },

  // Crear nuevo ajuste
  create: async (ajuste: Omit<AjusteInventario, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), ajuste)
      return docRef.id
    } catch (error) {
      console.error('Error creando ajuste:', error)
      throw error
    }
  },

  // Eliminar ajuste
  delete: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error eliminando ajuste:', error)
      throw error
    }
  },

  // Realizar ajuste de stock
  realizarAjuste: async (data: AjusteFormData, usuarioNombre: string): Promise<void> => {
    try {
      const producto = await productoService.getById(data.productoId)
      if (!producto) throw new Error('Producto no encontrado')

      const cantidadAnterior = producto.stockActual
      const diferencia = data.nuevaCantidad - cantidadAnterior
      const now = new Date()
      const fecha = now.toISOString().split('T')[0]
      const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

      // Guardar ajuste
      const ajusteData: Omit<AjusteInventario, 'id'> = {
        fecha,
        hora,
        producto: {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
        },
        cantidadAnterior,
        cantidadNueva: data.nuevaCantidad,
        diferencia,
        motivo: data.motivo,
        observacion: data.observacion,
        creadoPor: {
          id: 'current-user',
          nombre: usuarioNombre,
        },
        creadoEn: now.toISOString(),
      }
      await ajusteService.create(ajusteData)

      // Actualizar stock del producto
      await productoService.update(data.productoId, { stockActual: data.nuevaCantidad })
    } catch (error) {
      console.error('Error realizando ajuste:', error)
      throw error
    }
  },

  // Obtener total de ajustes en el mes
  getTotalAjustesMes: async (): Promise<number> => {
    try {
      const ajustes = await ajusteService.getAll()
      const mesActual = new Date().getMonth()
      return ajustes.filter(a => new Date(a.fecha).getMonth() === mesActual).length
    } catch (error) {
      return 0
    }
  },
}