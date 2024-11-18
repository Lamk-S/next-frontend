import axiosInstance from '../utils/axiosInstance';

export interface CambioEstado {
    id?: number;
    activo_id: number; // ID del Activo relacionado
    descripcion: string;
    estado_anterior: string;
    estado_nuevo: string;
    fecha_cambio: string; // ISO formato de fecha
    razon: string; // Opcional
}

// Get all CambioEstado
export const getCambioEstados = async () => {
    return await axiosInstance.get('recursos/cambio-estado/');
};

// Get CambioEstado by ID
export const getCambioEstadoById = async (id: number) => {
    return await axiosInstance.get(`recursos/cambio-estado/${id}/`);
};

// Get all CambioEstado related to a specific Activo
export const getCambioEstadosByActivo = async (activoId: number) => {
    return await axiosInstance.get(`recursos/cambio-estado/by_activo/?activo_id=${activoId}`);
};

// Create a new CambioEstado
export const createCambioEstado = async (data: CambioEstado) => {
    return await axiosInstance.post('recursos/cambio-estado/', data);
};

// Update an existing CambioEstado
export const updateCambioEstado = async (id: number, data: CambioEstado) => {
    return await axiosInstance.put(`recursos/cambio-estado/${id}/`, data);
};

// Delete a CambioEstado
export const deleteCambioEstado = async (id: number) => {
    return await axiosInstance.delete(`recursos/cambio-estado/${id}/`);
};
