import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type {
    AuthResponse,
    Document,
    PaginatedQueryResponse,
    Query,
    SearchResponse,
    User
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
    baseURL: API_URL
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: { name: string; email: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/login', data),
    getProfile: (): Promise<AxiosResponse<User>> =>
        api.get('/auth/me')
};

// Documents API
export const documentsAPI = {
    upload: (data: File | FormData): Promise<AxiosResponse<Document>> => {
        const formData = data instanceof FormData ? data : new FormData();
        if (!(data instanceof FormData)) {
            formData.append('document', data);
        }
        return api.post('/documents/upload', formData);
    },
    getAll: (page: number = 1, limit: number = 20): Promise<AxiosResponse<import('../types').PaginatedDocumentResponse>> =>
        api.get(`/documents?page=${page}&limit=${limit}`),
    getOne: (id: string): Promise<AxiosResponse<Document>> =>
        api.get(`/documents/${id}`),
    delete: (id: string): Promise<AxiosResponse<{ message: string }>> =>
        api.delete(`/documents/${id}`),
    getStatus: (id: string): Promise<AxiosResponse<{ status: string }>> =>
        api.get(`/documents/${id}/status`)
};

// Search API
export const searchAPI = {
    ask: (question: string, documentIds?: string[]): Promise<AxiosResponse<SearchResponse>> =>
        api.post('/search', { question, documentIds }),
    getHistory: (page: number = 1, limit: number = 20): Promise<AxiosResponse<PaginatedQueryResponse>> =>
        api.get(`/search/history?page=${page}&limit=${limit}`),
    getQuery: (id: string): Promise<AxiosResponse<Query>> =>
        api.get(`/search/history/${id}`),
    deleteQuery: (id: string): Promise<AxiosResponse<{ message: string }>> =>
        api.delete(`/search/history/${id}`),
    clearHistory: (): Promise<AxiosResponse<{ message: string }>> =>
        api.delete('/search/history')
};

export default api;
