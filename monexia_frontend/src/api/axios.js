import axios from 'axios';

// En tu archivo api/axios.js (o donde tengas axios.create)
const api = axios.create({
  baseURL: 'http://localhost:8000', // Usa localhost si el backend usa localhost
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Esto es lo que quita el error 401
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;