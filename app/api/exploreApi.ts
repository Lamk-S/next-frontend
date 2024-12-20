import axiosInstance from '../utils/axiosInstance';

export const getEdificios = async () => {
    try {
        const response = await axiosInstance.get('/recursos/buildings/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener edificios:', error);
        throw error;
    }
};

export const getAmbientesPorEdificio = async (buildingId: number) => {
    try {
        const response = await axiosInstance.get(`/recursos/buildings/${buildingId}/rooms/`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener ambientes:', error);
        throw error;
    }
};

export const getActivosPorAmbiente = async (roomId: number) => {
    try {
        const response = await axiosInstance.get(`/recursos/rooms/${roomId}/assets/`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener activos:', error);
        throw error;
    }
};