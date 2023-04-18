import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { type User } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOutWithGoogle } from '../firebase'
import { ProviderProps } from '../types/contexts'
import paths from '../routing/paths'

export interface LoginContextType {
  authLoading: boolean
  token: string | null
  requireLogin: () => void
  withTokenRefresh: (fn: (idToken: string) => void) => void
  user?: User | null
}

export const LoginContext = createContext<LoginContextType>({
  user: null,
  token: null,
  authLoading: true,
  requireLogin: () => {}, // noop
  withTokenRefresh: () => {},
})

export const LoginProvider = ({ children }: ProviderProps) => {
  const [user, authLoading, authError] = useAuthState(auth)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()

  const requireLogin = useCallback(() => {
    if (!user && !authLoading) {
      navigate(paths.home)
    }
  }, [user, authLoading])

  const refreshToken = useCallback(() => {
    if (user) user.getIdToken(true).then((idToken) => setToken(idToken))
  }, [user])

  const withTokenRefresh = (fn: Function) => {
    if (user) {
      user.getIdToken(true).then((idToken) => {
        setToken(idToken)
        fn(idToken)
      })
    }
  }

  const value = {
    user,
    token,
    requireLogin,
    withTokenRefresh,
    authLoading,
  }

  useEffect(() => {
    if (authError) signOutWithGoogle()

    refreshToken()
  }, [user, authError])

  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
}
