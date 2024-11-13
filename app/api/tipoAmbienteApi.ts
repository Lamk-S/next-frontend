import axiosInstance from '../utils/axiosInstance';

export interface TipoAmbiente {
    id?: number;
    nombre: string;
    descripcion: string;
}

// Obtener todos los ambientes
export const getTipoAmbientes = async () => {
    return await axiosInstance.get('recursos/tipo-ambiente/');
};

// Obtener un ambiente por ID
export const getTipoAmbienteById = async (id:number) => {
    return await axiosInstance.get(`recursos/tipo-ambiente/${id}/`);
};

// Crear un nuevo ambiente
export const createTipoAmbiente = async (data: TipoAmbiente) => {
    return await axiosInstance.post('recursos/tipo-ambiente/', data);
};

// Actualizar un ambiente existente
export const updateTipoAmbiente = async (id: number, data: TipoAmbiente) => {
    return await axiosInstance.put(`recursos/tipo-ambiente/${id}/`, data);
};

// Eliminar un ambiente
export const deleteTipoAmbiente = async (id: number) => {
    return await axiosInstance.delete(`recursos/tipo-ambiente/${id}/`);
};