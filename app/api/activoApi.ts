import axiosInstance from '../utils/axiosInstance';

export interface Activo {
    id?: number;
    codigo: string;
    descripcion: string;
    marca: string;
    modelo: string;
    serie: string;
    estado: string;
    observaciones: string;
    ambiente_id: number | null; // ID del ambiente relacionado
}

// Get all Ambientes
export const getActivos = async () => {
    return await axiosInstance.get('recursos/activo/');
};

// Get Ambiente by ID
export const getActivoById = async (id: number) => {
    return await axiosInstance.get(`recursos/activo/${id}/`);
};

// Create a new Ambiente
export const createActivo = async (data: Activo) => {
    return await axiosInstance.post('recursos/activo/', data);
};

// Update an existing Ambiente
export const updateActivo = async (id: number, data: Activo) => {
    return await axiosInstance.put(`recursos/activo/${id}/`, data);
};

// Delete an Ambiente
export const deleteActivo = async (id: number) => {
    return await axiosInstance.delete(`recursos/activo/${id}/`);
};