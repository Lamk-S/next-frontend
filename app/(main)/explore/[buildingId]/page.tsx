'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAmbientesPorEdificio } from '@/app/api/exploreApi';

interface Room {
    id: number;
    codigo: string;
    capacidad: number;
    piso: number;
}

const BuildingPage = () => {
    const [ambientes, setAmbientes] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const { buildingId } = useParams();

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const data = await getAmbientesPorEdificio(Number(buildingId));
                setAmbientes(data);
            } catch (error) {
                console.error('Error al cargar ambientes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAmbientes();
    }, [buildingId]);

    if (loading) return <div className="text-center mt-10">Cargando ambientes...</div>;

    return (
        <div>
            <h1 className="text-center text-3xl font-bold mb-1 text-gray-800">MAPEO DE ACTIVOS DE LA FACULTAD DE INGENIERÍA DE SISTEMAS</h1>
            <h1 className="text-center text-xl font-bold mb-6 text-gray-800">(AMBIENTES)</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-16">
                {ambientes.map((room) => (
                    <Link key={room.id} href={`/explore/${buildingId}/${room.id}`}>
                        <div className="card hover:shadow-2xl hover:scale-105 hover:border-blue-700 transition-all duration-300 rounded-lg border">
                            {/* Encabezado del Ambiente */}
                            <div className="text-white text-center">
                                <h2 className="text-lg font-semibold">{room.codigo}</h2>
                            </div>
                            {/* Detalles del Ambiente */}
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-600">Capacidad: {room.capacidad}</p>
                                <p className="text-sm text-gray-600 mt-2">Piso: {room.piso}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BuildingPage;