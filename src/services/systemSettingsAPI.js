import apiClient from './apiClient';

/**
 * System Settings API - Quản lý cài đặt hệ thống (Commission Rate, Payment Settings)
 */
export const systemSettingsAPI = {
    /**
     * Lấy tỷ lệ hoa hồng hiện tại
     */
    getCommissionRate: async () => {
        try {
            const response = await apiClient.get('/SystemSettings/commission-rate');

            // Response có cấu trúc: { data: { commissionRate: 10, description: "..." } }
            const rate = response?.data?.data?.commissionRate
                || response?.data?.data?.CommissionRate
                || response?.data?.commissionRate
                || response?.data?.CommissionRate
                || 0;

            return {
                success: true,
                data: {
                    commissionRate: rate,
                    CommissionRate: rate,
                    description: response?.data?.data?.description || response?.data?.description || ''
                },
                message: response?.message ?? response?.Message ?? 'Lấy thông tin hoa hồng thành công'
            };
        } catch (error) {
            console.error('Get commission rate error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể lấy tỷ lệ hoa hồng',
                error: error.response?.data
            };
        }
    },

    /**
     * Cập nhật tỷ lệ hoa hồng (Admin only)
     * @param {number} commissionRate - Tỷ lệ hoa hồng mới (0-100)
     */
    updateCommissionRate: async (commissionRate) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.put('/SystemSettings/commission-rate', {
                CommissionRate: commissionRate
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response?.Data ?? response,
                message: response?.Message ?? 'Cập nhật hoa hồng thành công'
            };
        } catch (error) {
            console.error('Update commission rate error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể cập nhật tỷ lệ hoa hồng',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy tất cả cài đặt thanh toán (Admin only)
     */
    getPaymentSettings: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.get('/SystemSettings/payment-settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response?.Data ?? response,
                message: response?.Message ?? 'Lấy cài đặt thanh toán thành công'
            };
        } catch (error) {
            console.error('Get payment settings error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy cài đặt thanh toán',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy báo cáo hoa hồng theo khoảng thời gian (Admin only)
     * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
     * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
     */
    getCommissionReport: async (startDate, endDate) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.get(
                `/SystemSettings/commission-report?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                data: response?.Data ?? response,
                message: response?.Message ?? 'Lấy báo cáo hoa hồng thành công'
            };
        } catch (error) {
            console.error('Get commission report error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể lấy báo cáo hoa hồng',
                error: error.response?.data
            };
        }
    }
};

export default systemSettingsAPI;
