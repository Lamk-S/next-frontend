'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEdificios } from '@/app/api/exploreApi';

interface Building {
    id: number;
    nombre: string;
    pisos: number;
}

const ExplorePage = () => {
    const [edificios, setEdificios] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEdificios = async () => {
            try {
                const data = await getEdificios();
                setEdificios(data);
            } catch (error) {
                console.error('Error al cargar edificios:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEdificios();
    }, []);

    if (loading) return <div className="text-center mt-10">Cargando edificios...</div>;

    return (
        <div>
            <h1 className="text-center text-3xl font-bold mb-1 text-gray-800">MAPEO DE ACTIVOS DE LA FACULTAD DE INGENIERÍA DE SISTEMAS</h1>
            <h1 className="text-center text-xl font-bold mb-6 text-gray-800">(EDIFICIOS)</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-16">
                {edificios.map((edificio) => (
                    <Link key={edificio.id} href={`/explore/${edificio.id}`}>
                        <div className="card group hover:shadow-2xl hover:scale-105 hover:border-blue-700 transition-all duration-300 rounded-lg overflow-hidden border border-gray-200">
                            {/* Detalles del Edificio */}
                            <div className="p-4 text-center bg-white group-hover:bg-blue-50 transition-colors duration-300">
                                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                                    {edificio.nombre}
                                </h2>
                                <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-800">
                                    Pisos: {edificio.pisos}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ExplorePage;