import axiosInstance from '../utils/axiosInstance';

interface LoginResponse {
    token: string;
}

export const login = async (username: string, password: string): Promise<string> => {
    try {
        const response = await axiosInstance.post<LoginResponse>('auth/login', {
            username,
            password,
        });

        const authToken = response.data.token;
        localStorage.setItem('authToken', authToken);

        return authToken;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('authToken');
};