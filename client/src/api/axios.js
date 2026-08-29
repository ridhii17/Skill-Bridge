import axios from 'axios';
import { API_URL } from '../lib/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — unwrap data and handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({ message, status: error.response?.status, data: error.response?.data });
  }
);

export default api;
