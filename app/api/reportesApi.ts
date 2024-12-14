import axiosInstance from '../utils/axiosInstance';

export const getAmbientesReporte = async () => {
    try {
        const response = await axiosInstance.get('/recursos/reportes/ambientes/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los reportes de ambientes:', error);
        throw error;
    }
};