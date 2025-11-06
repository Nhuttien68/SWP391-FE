import apiClient from './apiClient';

// Helper to normalize backend BaseResponse
const normalize = (resp) => {
    const data = resp?.Data ?? resp?.data ?? resp;
    const message = resp?.Message ?? resp?.message ?? '';
    const status = resp?.Status ?? resp?.status ?? '';
    return { data, message, status };
};

export const paymentAPI = {
    /**
     * Tạo URL thanh toán VNPay để nạp tiền vào ví
     * @param {number} amount - Số tiền cần nạp
     * @param {string} info - Thông tin giao dịch
     * @param {string} orderId - Mã đơn hàng (optional)
     * @param {string} returnUrl - URL frontend để redirect sau khi thanh toán (optional)
     */
    createPayment: async (amount, info = 'Nạp tiền vào ví', orderId = null, returnUrl = null) => {
        try {
            const params = {
                amount,
                info,
                ...(orderId && { orderId }),
                ...(returnUrl && { returnUrl })
            };

            const resp = await apiClient.get('/Payment/create', { params });
            const { data, message, status } = normalize(resp);
            return { success: true, data, message, status };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.Message || error.message || 'Không thể tạo thanh toán',
                status: error.response?.data?.Status || error.response?.status
            };
        }
    }
};

export default paymentAPI;
