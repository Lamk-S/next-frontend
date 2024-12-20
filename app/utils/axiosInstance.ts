import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/bsc-unt/',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const authToken = localStorage.getItem('authToken');

        if (authToken) {
            config.headers['Authorization'] = authToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;