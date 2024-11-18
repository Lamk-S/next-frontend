import axiosInstance from '../utils/axiosInstance';

export interface Departamento {
    id: number;
    denominacion: string;
    departamento: string;
    programa_de_estudios: number;
}


// Obtener todos los ambientes
export const getPeriodos = async () => {
    return await axiosInstance.get('recursos/periodo/');
};
export const getEscuelas = async () => {
    return await axiosInstance.get('recursos/escuela/');
};
export const getDepartamentos = async () => {
    return await axiosInstance.get('recursos/departamento/');
};