import apiClient from './apiClient';

// Helper to normalize backend BaseResponse (backend returns { Status, Message, Data })
const normalize = (resp) => {
    // apiClient interceptor returns response.data already, so resp should be the BaseResponse
    const data = resp?.Data ?? resp?.data ?? resp;
    const message = resp?.Message ?? resp?.message ?? '';
    const status = resp?.Status ?? resp?.status ?? '';
    return { data, message, status };
};

export const walletAPI = {
    getWallet: async () => {
        try {
            const resp = await apiClient.get('/Wallet/info');
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể lấy thông tin ví',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    createWallet: async () => {
        try {
            const resp = await apiClient.post('/Wallet/create');
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể tạo ví',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    withdraw: async (amount) => {
        try {
            const resp = await apiClient.post(`/Wallet/withdraw?amount=${amount}`);
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể rút tiền từ ví',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    },

    getBalance: async () => {
        try {
            const resp = await apiClient.get('/Wallet/balance');
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể lấy số dư ví',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    }
};

export default walletAPI;
