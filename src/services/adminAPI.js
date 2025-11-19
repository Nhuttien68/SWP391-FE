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
    }
};

export default adminAPI;
