import axios from 'axios';
import { getAuthToken } from './auth'; // Assume you have a function to get the auth token
import { BASE_URL } from './apiPaths';
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    }
    , (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific status codes
            if (error.response.status === 401) {
                // Handle unauthorized access, e.g., redirect to login
                window.location.href = '/login';
            }
            else if (error.response.status === 403) {
                console.error('Forbidden! You do not have permission to access this resource.');
            }
            else if (error.response.status === 500) {
                console.error('Server error! Please try again later.');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout! Please try again later.');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;