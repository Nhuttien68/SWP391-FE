import apiClient from './apiClient';

// Auth API endpoints
export const authAPI = {
    // Đăng ký tài khoản
    register: async (userData) => {
        try {
            const response = await apiClient.post('/User/register', userData);
            return {
                success: true,
                data: response,
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng ký thất bại',
                error: error.response?.data
            };
        }
    },

    // Xác thực OTP
    verifyOTP: async (email, otp) => {
        try {
            const response = await apiClient.post(`/User/verify-email-active-account?email=${email}&otp=${otp}`);
            return {
                success: true,
                data: response,
                message: 'Xác thực tài khoản thành công!'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Mã OTP không hợp lệ',
                error: error.response?.data
            };
        }
    },

    // Đăng nhập
    login: async (loginData) => {
        try {
            const response = await apiClient.post('/User/login', loginData);

            if (response.isSuccess && response.data?.token) {
                // Lưu token và thông tin user vào localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.accountId,
                    fullName: response.data.fullName,
                    email: response.data.email
                }));

                return {
                    success: true,
                    data: response.data,
                    message: 'Đăng nhập thành công!'
                };
            }

            return {
                success: false,
                message: response.message || 'Đăng nhập thất bại'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng nhập thất bại',
                error: error.response?.data
            };
        }
    },

    // Đổi mật khẩu
    changePassword: async (changePasswordData) => {
        try {
            const response = await apiClient.put('/User/change-password', changePasswordData);
            return {
                success: true,
                data: response,
                message: 'Đổi mật khẩu thành công!'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đổi mật khẩu thất bại',
                error: error.response?.data
            };
        }
    },

    // Gửi lại OTP
    resendOTP: async (email) => {
        try {
            const response = await apiClient.post('/User/resend-otp', JSON.stringify(email));
            return {
                success: true,
                data: response,
                message: 'Đã gửi lại mã OTP!'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gửi OTP thất bại',
                error: error.response?.data
            };
        }
    },

    // Đăng xuất
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    // Kiểm tra trạng thái đăng nhập
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default authAPI;