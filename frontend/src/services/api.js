import axios from 'axios';

// In production (Netlify), use the relative path so it hits the Netlify functions proxy.
// Locally, use the Express server on port 5002.
const API_URL = import.meta.env.PROD ? '/api/' : 'http://localhost:5002/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
