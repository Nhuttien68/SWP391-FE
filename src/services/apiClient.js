import axios from 'axios';

// Base URL của backend API
const BASE_URL = 'https://localhost:7184/api';

// Tạo axios instance với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 giây timeout
});

// Interceptor để thêm token vào header tự động
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response và error
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // Trả về data thay vì toàn bộ response
    },
    (error) => {
        // if (error.response?.status === 401) {
        //     // Token hết hạn, redirect về login
        //     localStorage.removeItem('token');
        //     localStorage.removeItem('user');
        //     window.location.href = '/login';
        // }
        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;