import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const useAuth = () => {
    const router = useRouter();
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    useEffect(() => {
        if (!authToken) {
            router.push('/auth/login'); // Cambia a la ruta de tu página de login
        }
    }, [authToken, router]);

    return authToken;
};

export default useAuth;