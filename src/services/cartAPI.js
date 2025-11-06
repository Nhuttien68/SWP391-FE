import apiClient from './apiClient';

/**
 * Cart API - Quản lý giỏ hàng
 */
export const cartAPI = {
    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    addToCart: async (postId, quantity = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để thêm vào giỏ hàng'
                };
            }

            const response = await apiClient.post('/Cart/add', {
                postId: postId,
                quantity: quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data,
                message: 'Đã thêm vào giỏ hàng thành công!'
            };
        } catch (error) {
            console.error('Add to cart error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể thêm vào giỏ hàng',
                error: error.response?.data
            };
        }
    },

    /**
     * Lấy giỏ hàng của user hiện tại
     */
    getCart: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để xem giỏ hàng'
                };
            }

            const response = await apiClient.get('/Cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data,
                message: 'Lấy giỏ hàng thành công'
            };
        } catch (error) {
            console.error('Get cart error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải giỏ hàng',
                error: error.response?.data
            };
        }
    },

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     */
    updateCartItem: async (cartItemId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.put('/Cart/update', {
                cartItemId: cartItemId,
                quantity: quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data,
                message: 'Cập nhật số lượng thành công'
            };
        } catch (error) {
            console.error('Update cart item error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể cập nhật giỏ hàng',
                error: error.response?.data
            };
        }
    },

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    removeFromCart: async (cartItemId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.delete('/Cart/remove', {
                data: {
                    cartItemId: cartItemId
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data,
                message: 'Đã xóa sản phẩm khỏi giỏ hàng'
            };
        } catch (error) {
            console.error('Remove from cart error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể xóa sản phẩm',
                error: error.response?.data
            };
        }
    },

    /**
     * Xóa toàn bộ giỏ hàng
     */
    clearCart: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await apiClient.delete('/Cart/clear', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data,
                message: 'Đã xóa toàn bộ giỏ hàng'
            };
        } catch (error) {
            console.error('Clear cart error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể xóa giỏ hàng',
                error: error.response?.data
            };
        }
    }
};

export default cartAPI;
