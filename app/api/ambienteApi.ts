import axiosInstance from '../utils/axiosInstance';

export interface Ambiente {
    id?: number;
    codigo: string;
    capacidad: number;
    piso: number | null;
    encargado: string;
    edificio_id: number | null;
    departamento_id:  number | null;
    escuela_id:  number | null;
    tipo_ambiente_id:  number | null;
}

// Get all Ambientes
export const getAmbientes = async () => {
    return await axiosInstance.get('recursos/ambiente/');
};

// Get Ambiente by ID
export const getAmbienteById = async (id: number) => {
    return await axiosInstance.get(`recursos/ambiente/${id}/`);
};

// Create a new Ambiente
export const createAmbiente = async (data: Ambiente) => {
    return await axiosInstance.post('recursos/ambiente/', data);
};

// Update an existing Ambiente
export const updateAmbiente = async (id: number, data: Ambiente) => {
    return await axiosInstance.put(`recursos/ambiente/${id}/`, data);
};

// Delete an Ambiente
export const deleteAmbiente = async (id: number) => {
    return await axiosInstance.delete(`recursos/ambiente/${id}/`);
};