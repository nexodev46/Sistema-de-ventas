import { onSnapshot, Query, Unsubscribe, DocumentData } from 'firebase/firestore'

export const subscribeQuery = <T>(query: Query<DocumentData>, mapFn: (doc: DocumentData & { id: string }) => T, callback: (items: T[]) => void, errorCallback?: (error: Error) => void): Unsubscribe => {
  return onSnapshot(
    query,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => mapFn({ id: doc.id, ...doc.data() } as DocumentData & { id: string }))
      callback(items)
    },
    (error) => {
      if (errorCallback) errorCallback(error)
      else console.error('Realtime snapshot error:', error)
    }
  )
}
