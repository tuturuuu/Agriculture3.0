// src/api.js or src/utils/api.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Change this to your actual API URL
  timeout: 10000, // Optional: set a timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach the JWT token to every request
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

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

export default api;