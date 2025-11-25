import apiClient from './apiClient';

const normalize = (resp) => {
    const data = resp?.Data ?? resp?.data ?? resp;
    const message = resp?.Message ?? resp?.message ?? '';
    const status = resp?.Status ?? resp?.status ?? '';
    return { data, message, status };
};

export const withdrawalAPI = {
    // Tạo yêu cầu rút tiền
    createWithdrawalRequest: async (requestData) => {
        try {
            const resp = await apiClient.post('/Withdrawal/create', requestData);
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể tạo yêu cầu rút tiền',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    // Lấy danh sách yêu cầu rút tiền của user
    getMyWithdrawalRequests: async () => {
        try {
            const resp = await apiClient.get('/Withdrawal/my-requests');
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể lấy danh sách yêu cầu rút tiền',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    // Admin: Lấy tất cả yêu cầu rút tiền
    getAllWithdrawalRequests: async () => {
        try {
            const resp = await apiClient.get('/Withdrawal/all');
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể lấy danh sách yêu cầu',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    // Admin: Duyệt yêu cầu rút tiền
    approveWithdrawal: async (id, adminNote = '') => {
        try {
            const resp = await apiClient.put(`/Withdrawal/approve/${id}`, { adminNote });
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể duyệt yêu cầu',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    // Admin: Từ chối yêu cầu rút tiền
    rejectWithdrawal: async (id, adminNote) => {
        try {
            const resp = await apiClient.put(`/Withdrawal/reject/${id}`, { adminNote });
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể từ chối yêu cầu',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    }
};

export default withdrawalAPI;
