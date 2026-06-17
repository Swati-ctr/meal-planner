import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cp_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  // Verify token on app start
  useEffect(() => {
    const token = localStorage.getItem('cp_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.getMe()
      .then(({ data }) => {
        setUser(data.user)
        localStorage.setItem('cp_user', JSON.stringify(data.user))
      })
      .catch(() => {
        localStorage.removeItem('cp_token')
        localStorage.removeItem('cp_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('cp_token', data.token)
    localStorage.setItem('cp_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    localStorage.setItem('cp_token', data.token)
    localStorage.setItem('cp_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cp_token')
    localStorage.removeItem('cp_user')
    setUser(null)
  }, [])

  const updateUser = useCallback(async (payload) => {
    const { data } = await authApi.updateProfile(payload)
    setUser(data.user)
    localStorage.setItem('cp_user', JSON.stringify(data.user))
    return data.user
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
