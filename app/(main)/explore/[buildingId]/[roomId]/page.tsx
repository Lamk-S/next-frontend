'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getActivosPorAmbiente } from '@/app/api/exploreApi';
import { FaToolbox, FaTag, FaInfoCircle } from 'react-icons/fa';

interface Asset {
    id: number;
    nombre: string;
    marca: string;
    modelo: string;
    estado: string; // "Operativo", "En Mantenimiento", "No Operativo"
}

const RoomPage = () => {
    const [activos, setActivos] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const { roomId } = useParams();

    useEffect(() => {
        const fetchActivos = async () => {
            try {
                const data = await getActivosPorAmbiente(Number(roomId));
                setActivos(data);
            } catch (error) {
                console.error('Error al cargar activos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivos();
    }, [roomId]);

    if (loading) return <div className="text-center mt-10">Cargando activos...</div>;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Operativo':
                return 'bg-green-100 border-green-400 text-green-700 hover:shadow-2xl hover:scale-200 hover:border-green-700 transition-all duration-300';
            case 'En Mantenimiento':
                return 'bg-yellow-100 border-yellow-400 text-yellow-700 hover:shadow-2xl hover:scale-200 hover:border-yellow-700 transition-all duration-300';
            case 'No Operativo':
                return 'bg-red-100 border-red-400 text-red-700 hover:shadow-2xl hover:scale-200 hover:border-red-700 transition-all duration-300';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-700';
        }
    };

    return (
        <div>
            <h1 className="text-center text-3xl font-bold mb-1 text-gray-800">MAPEO DE ACTIVOS DE LA FACULTAD DE INGENIERÍA DE SISTEMAS</h1>
            <h1 className="text-center text-xl font-bold mb-6 text-gray-800">(ACTIVOS)</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-16">
                {activos.map((asset) => (
                    <div
                        key={asset.id}
                        className={`card shadow-lg rounded-lg border hover:shadow-xl transition-all duration-300 ${getEstadoColor(
                            asset.estado
                        )}`}
                        style={{
                            width: '280px',
                            height: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                    >
                        <h2 className="text-lg font-semibold text-center mb-2">{asset.nombre}</h2>
                        <div className="text-sm space-y-2">
                            <p className="flex items-center">
                                <FaToolbox className="mr-2 text-gray-600" />
                                <span className="font-medium">Modelo:</span> {asset.modelo}
                            </p>
                            <p className="flex items-center">
                                <FaTag className="mr-2 text-gray-600" />
                                <span className="font-medium">Marca:</span> {asset.marca}
                            </p>
                            <p className="flex items-center">
                                <FaInfoCircle className="mr-2 text-gray-600" />
                                <span className="font-medium">Estado:</span> {asset.estado}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomPage;