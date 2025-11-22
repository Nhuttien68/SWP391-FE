import axios from 'axios';

// Base URL của backend API

// const BASE_URL = 'https://ev-marketplace-etabdkefebdghqfa.southeastasia-01.azurewebsites.net/api';

const BASE_URL = "http://localhost:5037/api"
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});


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

            const hadToken = localStorage.getItem('token');


            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/home', '/login', '/register', '/post', '/cart', '/checkout', '/auction', '/market'];

            const isPublicPath = publicPaths.some(path =>
                currentPath === path || currentPath.startsWith(path)
            );


            if (!isPublicPath && hadToken) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Đang ở trang protected VÀ có token cũ, redirect về login
                window.location.href = '/login';
            }
        }
        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;