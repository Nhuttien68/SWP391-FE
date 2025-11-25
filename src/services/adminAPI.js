import apiClient from './apiClient';

export const adminAPI = {
    getAllUsers: async () => {
        try {
            const response = await apiClient.get('/Admin/users');
            // apiClient returns server payload (should be BaseResponse)
            // Normalize possible shapes into an array
            let data = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (Array.isArray(response?.Data)) {
                data = response.Data;
            } else if (Array.isArray(response?.data)) {
                data = response.data;
            } else if (response && typeof response === 'object' && Object.keys(response).length === 0) {
                data = [];
            } else {
                // Unexpected shape: try to use response directly if it's iterable
                data = Array.isArray(response) ? response : [];
            }

            return {
                success: true,
                data,
                message: response?.Message ?? 'Lấy danh sách người dùng thành công'
            };
        } catch (error) {
            console.error('Get all users error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách người dùng',
                error: error.response?.data
            };
        }
    },

    countUsers: async () => {
        try {
            const response = await apiClient.get('/Admin/users/count');
            return {
                success: true,
                data: response?.Data ?? response,
                message: response?.Message ?? 'Lấy số lượng người dùng thành công'
            };
        } catch (error) {
            console.error('Count users error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể đếm người dùng',
                error: error.response?.data
            };
        }
    },

    /**
     * Khóa/Mở khóa user
     * @param {string} userId - ID của user
     * @param {string} status - ACTIVE hoặc INACTIVE
     */
    updateUserStatus: async (userId, status) => {
        try {
            const response = await apiClient.put(`/Admin/users/${userId}/status?status=${status}`);
            return {
                success: true,
                data: response?.Data ?? response?.data ?? response,
                message: response?.Message || `Đã cập nhật trạng thái user thành ${status}`
            };
        } catch (error) {
            console.error('Update user status error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể cập nhật trạng thái user'
            };
        }
    },

    // Transaction APIs for statistics
    getTransactionsByDate: async (day, month, year) => {
        try {
            const response = await apiClient.get(`/Admin/transactions/date?day=${day}&month=${month}&year=${year}`);
            return {
                success: true,
                data: response?.Data ?? response?.data ?? response,
                message: response?.Message || 'Lấy giao dịch theo ngày thành công'
            };
        } catch (error) {
            console.error('Get transactions by date error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy giao dịch',
                error: error.response?.data
            };
        }
    },

    getTransactionsByMonth: async (month, year) => {
        try {
            const response = await apiClient.get(`/Admin/transactions/month?month=${month}&year=${year}`);
            return {
                success: true,
                data: response?.Data ?? response?.data ?? response,
                message: response?.Message || 'Lấy giao dịch theo tháng thành công'
            };
        } catch (error) {
            console.error('Get transactions by month error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy giao dịch',
                error: error.response?.data
            };
        }
    },

    getTransactionsByYear: async (year) => {
        try {
            const response = await apiClient.get(`/Admin/transactions/year?year=${year}`);
            return {
                success: true,
                data: response?.Data ?? response?.data ?? response,
                message: response?.Message || 'Lấy giao dịch theo năm thành công'
            };
        } catch (error) {
            console.error('Get transactions by year error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy giao dịch',
                error: error.response?.data
            };
        }
    },

    getTransactionsByRange: async (startDate, endDate) => {
        try {
            const response = await apiClient.get(`/Admin/transactions/range?startDate=${startDate}&endDate=${endDate}`);
            return {
                success: true,
                data: response?.Data ?? response?.data ?? response,
                message: response?.Message || 'Lấy giao dịch theo khoảng thành công'
            };
        } catch (error) {
            console.error('Get transactions by range error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy giao dịch',
                error: error.response?.data
            };
        }
    },

    // Lấy tất cả giao dịch (chi tiết đầy đủ)
    getAllTransactions: async () => {
        try {
            const response = await apiClient.get('/Transactions/all');
            return {
                success: true,
                data: response?.Data ?? response?.data ?? response,
                message: response?.Message || 'Lấy tất cả giao dịch thành công'
            };
        } catch (error) {
            console.error('Get all transactions error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy danh sách giao dịch',
                error: error.response?.data
            };
        }
    }
};

export default adminAPI;
