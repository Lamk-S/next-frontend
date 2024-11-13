import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../utils/axiosInstance';

interface AuthContextType {
    isAuthenticated: boolean;
    loginUser: (username: string, password: string) => Promise<string | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const loginUser = async (username: string, password: string): Promise<string | null> => {
        try {
            const response = await axiosInstance.post('auth/login', { username, password });
            const authToken = response.data.token;
            await localStorage.setItem('authToken', authToken); // Guardar token
            console.log("Token guardado en localStorage:", authToken);
            setIsAuthenticated(true);
            router.push('/');
            return null;
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                return 'Credenciales incorrectas. Por favor, inténtelo de nuevo.';
            }
            return 'Ocurrió un error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.';
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};