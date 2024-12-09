import axiosInstance from '../utils/axiosInstance';

export interface Edificio {
    id?: number;
    nombre: string;
    descripcion: string;
    pisos: number;
    ubicacion_lat: number;
    ubicacion_lng: number;
}

// Obtener todos los activos
export const getEdificios = async () => {
    return await axiosInstance.get('recursos/edificio/');
};

// Obtener un activo por ID
export const getEdificioById = async (id:number) => {
    return await axiosInstance.get(`recursos/edificio/${id}/`);
};

// Crear un nuevo activo
export const createEdificio = async (data: Edificio) => {
    return await axiosInstance.post('recursos/edificio/', data);
};

// Actualizar un activo existente
export const updateEdificio = async (id: number, data: Edificio) => {
    return await axiosInstance.put(`recursos/edificio/${id}/`, data);
};

// Eliminar un activo
export const deleteEdificio = async (id: number) => {
    return await axiosInstance.delete(`recursos/edificio/${id}/`);
};