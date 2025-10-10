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
            console.error('Registration error:', error);
            console.error('Error response data:', error.response?.data);
            // Xử lý error response với format {Status, Message}
            if (error.response?.data?.Message) {
                return {
                    success: false,
                    message: error.response.data.Message
                };
            }

            // Fallback cho các format khác
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
            // Xử lý error response với format {Status, Message}
            if (error.response?.data?.Message) {
                return {
                    success: false,
                    message: error.response.data.Message
                };
            }

            // Fallback cho các format khác
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
            // Chuyển đổi field names để match với backend expectation
            const requestData = {
                Email: loginData.email,
                Password: loginData.password
            };

            const response = await apiClient.post('/User/login', requestData);

            console.log('Login response:', response);
            console.log('Response data:', response.data);

            // Check if login successful (status "200" và có token)
            if (response.status === "200" && response.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.accountId,
                    fullName: response.data.fullName,
                    email: response.data.email,
                    isActive: response.data.isActive || response.data.IsActive
                }));

                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Đăng nhập thành công!'
                };
            }

            // Nếu có lỗi (status "400" hoặc không có token)
            return {
                success: false,
                message: response.message || 'Đăng nhập thất bại'
            };
        } catch (error) {
            // Nếu có error response từ backend (404, 400, etc.)
            if (error.response?.data?.Message) {
                return {
                    success: false,
                    message: error.response.data.Message
                };
            }

            // Fallback cho trường hợp message với chữ thường
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            }

            return {
                success: false,
                message: 'Đăng nhập thất bại',
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
            // Xử lý error response với format {Status, Message}
            if (error.response?.data?.Message) {
                return {
                    success: false,
                    message: error.response.data.Message
                };
            }

            // Fallback cho các format khác
            return {
                success: false,
                message: error.response?.data?.message || 'Đổi mật khẩu thất bại',
                error: error.response?.data
            };
        }
    },

    // Gửi OTP cho forgot password
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post('/User/forgot-password', JSON.stringify(email));

            // Kiểm tra response thành công
            if (response.status === "200") {
                return {
                    success: true,
                    data: response,
                    message: response.message || 'Mã OTP đã được gửi đến email của bạn!'
                };
            }

            return {
                success: false,
                message: response.message || 'Gửi OTP thất bại'
            };
        } catch (error) {
            // Xử lý error response với format {Status, Message}
            if (error.response?.data?.Message) {
                return {
                    success: false,
                    message: error.response.data.Message
                };
            }

            // Fallback cho các format khác
            return {
                success: false,
                message: error.response?.data?.message || 'Gửi OTP thất bại',
                error: error.response?.data
            };
        }
    },

    // Gửi lại OTP (cho activate account)
    resendOTP: async (email) => {
        try {
            const response = await apiClient.post('/User/resend-otp', { Email: email });
            return {
                success: true,
                data: response,
                message: 'Đã gửi lại mã OTP!'
            };
        } catch (error) {
            // Xử lý error response với format {Status, Message}
            if (error.response?.data?.Message) {
                return {
                    success: false,
                    message: error.response.data.Message
                };
            }

            // Fallback cho các format khác
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
    },

    // Tạo ví điện tử
    createWallet: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Chưa đăng nhập'
                };
            }

            const response = await apiClient.post('/Wallet/create-wallet', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response,
                message: 'Tạo ví thành công!'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || 'Tạo ví thất bại',
                error: error.response?.data
            };
        }
    }
};

export default authAPI;