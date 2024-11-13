'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

const DashboardPage = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login'); // Redirige al login si no está autenticado
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null; // Evita renderizar contenido si no está autenticado

    return (
        <div>
            <h1>Bienvenido al Dashboard</h1>
            <p>Contenido del dashboard para usuarios autenticados.</p>
        </div>
    );
};

export default DashboardPage;