import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export const authContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/auth/me")
                if (response.data.user) {
                    setUser({
                        id: response.data.user._id,
                        username: response.data.user.username,
                        email: response.data.user.email
                    })
                    setIsLoggedIn(true)
                }
            } catch (error) {
                console.error("Auth check failed", error)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = (userdata) => {
        setUser(userdata)
        setIsLoggedIn(true)
    }

    const logOut = () => {
        setUser(null)
        setIsLoggedIn(false)
    }

    return (
        <authContext.Provider value={{ user, isLoggedIn, login, logOut, loading }}>
            {children}
        </authContext.Provider>
    )
}

export const useAuth = () => useContext(authContext)