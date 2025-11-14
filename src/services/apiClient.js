import axios from 'axios';

// Base URL của backend API
const BASE_URL = 'http://localhost:5037/api';

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
        if (error.response?.status === 401) {
            // Xóa token hết hạn
            const hadToken = localStorage.getItem('token');

            // Chỉ redirect về login nếu KHÔNG phải ở trang public
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/home', '/login', '/register', '/post', '/cart', '/checkout', '/auction', '/market'];

            const isPublicPath = publicPaths.some(path =>
                currentPath === path || currentPath.startsWith(path)
            );

            // Chỉ xóa token và redirect khi KHÔNG phải đang ở public path
            if (!isPublicPath && hadToken) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Đang ở trang protected VÀ có token cũ, redirect về login
                window.location.href = '/login';
            }
            // Nếu ở trang public, cứ để error propagate, component tự xử lý
        }
        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;