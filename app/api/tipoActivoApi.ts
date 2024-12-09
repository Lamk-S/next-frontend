import axiosInstance from '../utils/axiosInstance';

export interface TipoActivo {
    id?: number;
    nombre: string;
    descripcion: string;
}

// Obtener todos los activos
export const getTipoActivos = async () => {
    return await axiosInstance.get('recursos/tipo-activo/');
};

// Obtener un activo por ID
export const getTipoActivoById = async (id:number) => {
    return await axiosInstance.get(`recursos/tipo-activo/${id}/`);
};

// Crear un nuevo activo
export const createTipoActivo = async (data: TipoActivo) => {
    return await axiosInstance.post('recursos/tipo-activo/', data);
};

// Actualizar un activo existente
export const updateTipoActivo = async (id: number, data: TipoActivo) => {
    return await axiosInstance.put(`recursos/tipo-activo/${id}/`, data);
};

// Eliminar un activo
export const deleteTipoActivo = async (id: number) => {
    return await axiosInstance.delete(`recursos/tipo-activo/${id}/`);
};