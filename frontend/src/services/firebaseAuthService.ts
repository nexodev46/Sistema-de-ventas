import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { auth, db } from './firebase'
import api from './api'

export interface UserData {
  uid: string
  nombre: string
  email: string
  rol: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'ALMACEN'
  telefono?: string
  direccion?: string
  documento?: string
  fotoURL?: string
  creadoEn: string
  activo: boolean
  ultimoAcceso?: string
}

export const firebaseAuthService = {
  // Registrar usuario normal (VENDEDOR por defecto)
  register: async (
    email: string, 
    password: string, 
    nombre: string, 
    telefono?: string, 
    direccion?: string,
    documento?: string
  ) => {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Actualizar perfil con nombre
      await updateProfile(user, { displayName: nombre })
      
      // Enviar correo de verificación
      await sendEmailVerification(user)
      
      // Guardar datos adicionales en Firestore
      const userData: UserData = {
        uid: user.uid,
        nombre,
        email,
        rol: 'VENDEDOR', // Por defecto es VENDEDOR
        telefono: telefono || '',
        direccion: direccion || '',
        documento: documento || '',
        fotoURL: '',
        creadoEn: new Date().toISOString(),
        activo: true,
      }
      
      await setDoc(doc(db, 'usuarios', user.uid), userData)
      
      return { user, userData }
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    }
  },

  // Crear usuario ADMIN (solo para el dueño del negocio)
  registerAdmin: async (
    email: string, 
    password: string, 
    nombre: string, 
    telefono?: string, 
    direccion?: string
  ) => {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Actualizar perfil
      await updateProfile(user, { displayName: nombre })
      
      // Enviar correo de verificación
      await sendEmailVerification(user)
      
      // Guardar como ADMIN
      const userData: UserData = {
        uid: user.uid,
        nombre,
        email,
        rol: 'ADMIN', // Forzar ADMIN
        telefono: telefono || '',
        direccion: direccion || '',
        documento: '',
        fotoURL: '',
        creadoEn: new Date().toISOString(),
        activo: true,
      }
      
      await setDoc(doc(db, 'usuarios', user.uid), userData)
      
      return { user, userData }
    } catch (error) {
      console.error('Error creando admin:', error)
      throw error
    }
  },

  // Iniciar sesión
  login: async (email: string, password: string, rememberMe = false) => {
    try {
      // Consultar al backend si el email/IP está permitido (protección server-side)
      try {
        const resp = await api.post('/auth/check', { email })
        if (resp && resp.data && resp.data.allowed === false) {
          const err: any = new Error('Demasiados intentos fallidos. Intenta de nuevo más tarde.')
          err.code = 'auth/temporarily-blocked'
          throw err
        }
      } catch (checkErr) {
        // Si el check falla por red, no bloquear el login para evitar denegación accidental.
        console.warn('Auth check failed, proceeding with login:', checkErr)
      }
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Obtener datos adicionales de Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
      const userData = userDoc.exists() ? userDoc.data() as UserData : null
      
      // Verificar si el usuario está activo
      if (userData && !userData.activo) {
        // Cerrar sesión inmediatamente
        await signOut(auth)
        const error: any = new Error('Tu cuenta ha sido deshabilitada. Contacta al administrador.')
        error.code = 'auth/user-disabled'
        throw error
      }
      
      // Actualizar último acceso
      if (userData) {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          ultimoAcceso: new Date().toISOString()
        })
      }
      
      // Generar token
      const token = await user.getIdToken()

      // Notificar éxito al backend para resetear contador
      try {
        await api.post('/auth/success', { email })
      } catch (notifyErr) {
        console.warn('No se pudo notificar éxito de login al backend:', notifyErr)
      }
      
      return { 
        user, 
        userData,
        token 
      }
    } catch (error) {
      // Notificar intento fallido al backend (no bloquear si el backend falla)
      try {
        await api.post('/auth/failed', { email })
      } catch (notifyErr) {
        console.warn('No se pudo notificar fallo de login al backend:', notifyErr)
      }
      console.error('Error en login:', error)
      throw error
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('userName')
    } catch (error) {
      console.error('Error en logout:', error)
      throw error
    }
  },

  // Restablecer contraseña
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error en reset password:', error)
      throw error
    }
  },

  // Verificar email
  verifyEmail: async () => {
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
      }
    } catch (error) {
      console.error('Error enviando verificación:', error)
      throw error
    }
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (uid: string, data: Partial<UserData>) => {
    try {
      const userRef = doc(db, 'usuarios', uid)
      await updateDoc(userRef, data)
      
      if (data.nombre && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.nombre })
      }
      
      return true
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      throw error
    }
  },

  // Cambiar rol de usuario (solo ADMIN puede hacer esto)
  changeUserRole: async (uid: string, nuevoRol: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'ALMACEN') => {
    try {
      const userRef = doc(db, 'usuarios', uid)
      await updateDoc(userRef, { rol: nuevoRol })
      return true
    } catch (error) {
      console.error('Error cambiando rol:', error)
      throw error
    }
  },

  // Cambiar estado activo/inactivo de usuario
  toggleUserStatus: async (uid: string, activo: boolean) => {
    try {
      const userRef = doc(db, 'usuarios', uid)
      await updateDoc(userRef, { activo })
      return true
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error)
      throw error
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    return auth.currentUser
  },

  // Obtener datos de usuario desde Firestore
  getUserData: async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid))
      return userDoc.exists() ? userDoc.data() as UserData : null
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
  },

  // Eliminar cuenta de usuario permanentemente
  deleteUserAccount: async (uid: string) => {
    try {
      const userRef = doc(db, 'usuarios', uid)
      await deleteDoc(userRef)
      
      // Intentar eliminar la cuenta de Firebase Auth también
      try {
        const userAuth = auth.currentUser
        if (userAuth && userAuth.uid === uid) {
          await userAuth.delete()
        }
      } catch (authError) {
        console.warn('No se pudo eliminar la cuenta de Firebase Auth:', authError)
      }
      
      return true
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      throw error
    }
  },

  // Obtener todos los usuarios activos (solo para ADMIN)
  getAllUsers: async (): Promise<UserData[]> => {
    try {
      const usuariosRef = collection(db, 'usuarios')
      const q = query(usuariosRef, where('activo', '==', true))
      const querySnapshot = await getDocs(q)
      
      const usuarios: UserData[] = []
      querySnapshot.forEach((doc) => {
        usuarios.push(doc.data() as UserData)
      })
      
      return usuarios
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      return []
    }
  },

  // Obtener todos los usuarios incluyendo inactivos (para administración)
  getAllUsersIncludingInactive: async (): Promise<UserData[]> => {
    try {
      const usuariosRef = collection(db, 'usuarios')
      const querySnapshot = await getDocs(usuariosRef)
      
      const usuarios: UserData[] = []
      querySnapshot.forEach((doc) => {
        usuarios.push(doc.data() as UserData)
      })
      
      return usuarios
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      return []
    }
  },

  // Iniciar sesión con Google
  signInWithGoogle: async () => {
    try {
      await setPersistence(auth, browserSessionPersistence)
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user
      const userDocRef = doc(db, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      let userData: UserData | null = null

      if (!userDoc.exists()) {
        const nombre = user.displayName || user.email?.split('@')[0] || 'Usuario'
        userData = {
          uid: user.uid,
          nombre,
          email: user.email || '',
          rol: 'VENDEDOR',
          telefono: '',
          direccion: '',
          documento: '',
          fotoURL: user.photoURL || '',
          creadoEn: new Date().toISOString(),
          activo: true,
        }
        await setDoc(userDocRef, userData)
      } else {
        userData = userDoc.data() as UserData
        if (!userData.activo) {
          await signOut(auth)
          const error: any = new Error('Tu cuenta ha sido deshabilitada. Contacta al administrador.')
          error.code = 'auth/user-disabled'
          throw error
        }
        await updateDoc(userDocRef, { ultimoAcceso: new Date().toISOString() })
      }

      const token = await user.getIdToken()
      return { user, userData, token }
    } catch (error) {
      console.error('Error en Google sign-in:', error)
      throw error
    }
  },

  // Iniciar sesión con Facebook
  signInWithFacebook: async () => {
    try {
      await setPersistence(auth, browserSessionPersistence)
      const provider = new FacebookAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user
      const userDocRef = doc(db, 'usuarios', user.uid)
      const userDoc = await getDoc(userDocRef)
      let userData: UserData | null = null

      if (!userDoc.exists()) {
        const nombre = user.displayName || user.email?.split('@')[0] || 'Usuario'
        userData = {
          uid: user.uid,
          nombre,
          email: user.email || '',
          rol: 'VENDEDOR',
          telefono: '',
          direccion: '',
          documento: '',
          fotoURL: user.photoURL || '',
          creadoEn: new Date().toISOString(),
          activo: true,
        }
        await setDoc(userDocRef, userData)
      } else {
        userData = userDoc.data() as UserData
        if (!userData.activo) {
          await signOut(auth)
          const error: any = new Error('Tu cuenta ha sido deshabilitada. Contacta al administrador.')
          error.code = 'auth/user-disabled'
          throw error
        }
        await updateDoc(userDocRef, { ultimoAcceso: new Date().toISOString() })
      }

      const token = await user.getIdToken()
      return { user, userData, token }
    } catch (error) {
      console.error('Error en Facebook sign-in:', error)
      throw error
    }
  },

  // Verificar si el usuario actual es ADMIN
  isAdmin: async (): Promise<boolean> => {
    const user = auth.currentUser
    if (!user) return false
    
    const userData = await firebaseAuthService.getUserData(user.uid)
    return userData?.rol === 'ADMIN'
  }
}