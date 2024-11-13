import { Metadata } from 'next';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

// Exporta `metadata` sin el campo `viewport`
export const metadata: Metadata = {
    title: 'FACING - RECURSOS',
    description: 'Plataforma de FACING para gestionar y optimizar la infraestructura y recursos en tiempo real, con funciones avanzadas de monitoreo y análisis.',
    robots: { index: true, follow: true },
    openGraph: {
        type: 'website',
        title: 'FACING',
        description: 'Optimización y control de infraestructura y recursos en una plataforma segura y accesible.',
        images: ['/layout/images/logo-facing.webp'],
        ttl: 604800
    },
    icons: {
        icon: '/logo-facing.svg'
    }
};

// Exporta `viewport` de forma separada
export const viewport = {
    initialScale: 1,
    width: 'device-width',
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}