import apiClient from './apiClient';

/**
 * Transaction API - Quản lý giao dịch mua bán
 */
export const transactionAPI = {
    /**
     * Tạo giao dịch mua đơn lẻ (1 sản phẩm)
     */
    createTransaction: async (transactionData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để thực hiện giao dịch'
                };
            }

            const response = await apiClient.post('/Transactions/create', {
                PostId: transactionData.postId,
                PaymentMethod: transactionData.paymentMethod,
                ReceiverName: transactionData.receiverName,
                ReceiverPhone: transactionData.receiverPhone,
                ReceiverAddress: transactionData.receiverAddress,
                Note: transactionData.note || ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Tạo đơn hàng thành công!'
            };
        } catch (error) {
            console.error('Create transaction error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể tạo đơn hàng',
                error: error.response?.data
            };
        }
    },

    /**
     * Thanh toán toàn bộ giỏ hàng
     */
    createCartTransaction: async (cartTransactionData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để thanh toán'
                };
            }

            const response = await apiClient.post('/Transactions/create-from-cart', {
                CartId: cartTransactionData.cartId,
                PaymentMethod: cartTransactionData.paymentMethod,
                ReceiverName: cartTransactionData.receiverName,
                ReceiverPhone: cartTransactionData.receiverPhone,
                ReceiverAddress: cartTransactionData.receiverAddress,
                Note: cartTransactionData.note || ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Thanh toán giỏ hàng thành công!'
            };
        } catch (error) {
            console.error('Create cart transaction error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể thanh toán giỏ hàng',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy chi tiết giao dịch theo ID
     */
    getTransactionById: async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.get(`/Transactions/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Lấy thông tin giao dịch thành công'
            };
        } catch (error) {
            console.error('Get transaction error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải thông tin giao dịch',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy danh sách đơn mua (user hiện tại là người mua)
     */
    getMyPurchases: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.get('/Transactions/my-purchases', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Lấy danh sách đơn mua thành công'
            };
        } catch (error) {
            console.error('Get my purchases error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách đơn mua',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy danh sách đơn bán (user hiện tại là người bán)
     */
    getMySales: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.get('/Transactions/my-sales', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Lấy danh sách đơn bán thành công'
            };
        } catch (error) {
            console.error('Get my sales error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách đơn bán',
                error: error.response?.data
            };
        }
    },

    /**
     * Hủy giao dịch
     */
    cancelTransaction: async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.put(`/Transactions/cancel/${transactionId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Đã hủy giao dịch thành công'
            };
        } catch (error) {
            console.error('Cancel transaction error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể hủy giao dịch',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy tất cả giao dịch (Admin only)
     */
    getAllTransactions: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.get('/Transactions/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Lấy danh sách giao dịch thành công'
            };
        } catch (error) {
            console.error('Get all transactions error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách giao dịch',
                error: error.response?.data
            };
        }
    },

    /**
     * Cập nhật thông tin giao hàng cho đơn đấu giá
     */
    updateDeliveryInfo: async (transactionId, deliveryData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.put(`/Transactions/${transactionId}/delivery-info`, {
                ReceiverName: deliveryData.receiverName,
                ReceiverPhone: deliveryData.receiverPhone,
                ReceiverAddress: deliveryData.receiverAddress,
                Note: deliveryData.note || ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const payload = response?.Data ?? response;
            return {
                success: true,
                data: payload,
                message: response?.Message ?? 'Cập nhật thông tin giao hàng thành công'
            };
        } catch (error) {
            console.error('Update delivery info error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể cập nhật thông tin giao hàng',
                error: error.response?.data
            };
        }
    }
};

export default transactionAPI;
