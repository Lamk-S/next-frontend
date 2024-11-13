import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');

        // Redirige a la página de login si el token no está presente
        if (!authToken) {
            router.push('/auth/login');
        }
    }, [router]);

    return <>{children}</>;
};

export default ProtectedRoute;