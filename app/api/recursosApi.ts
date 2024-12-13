import axiosInstance from '../utils/axiosInstance';

export interface ResumenData {
    activos_por_estado: { estado: string; total: number }[];
    capacidad_por_edificio: { nombre_edificio: string; total_capacidad: number }[];
    consumo_por_activo: { total_energia: number; total_agua: number };
}

export const getResumen = async (): Promise<ResumenData> => {
    const response = await axiosInstance.get('/recursos/resumen/');
    return response.data;
};