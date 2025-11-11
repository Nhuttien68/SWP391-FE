import apiClient from './apiClient';
import { postAPI } from './postAPI';
import { authAPI } from './authAPI';

/**
 * Cart API - Quản lý giỏ hàng
 */
export const cartAPI = {
    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    addToCart: async (postId, quantity = 1) => {
        try {
            // Defensive client-side check: prevent adding your own post to cart
            try {
                const currentUserId = authAPI.getCurrentUserId();
                if (currentUserId) {
                    const postRes = await postAPI.getPostById(postId);
                    const owner = postRes?.data?.user?.id ?? postRes?.data?.userId ?? postRes?.data?.user?.userId ?? postRes?.data?.user?.Id ?? postRes?.data?.ownerId ?? null;
                    if (owner && String(owner) === String(currentUserId)) {
                        return {
                            success: false,
                            message: 'Bạn không thể thêm bài đăng của chính mình vào giỏ hàng'
                        };
                    }
                }
            } catch (e) {
                // If the defensive check fails for any reason, fall back to normal flow
                console.debug('Owner check failed in addToCart:', e);
            }

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

            // Normalize backend signals: some backends return a message indicating "already exists".
            const rawMessage = (response?.Message || response?.message || response?.data?.message || '') + '';
            const lower = rawMessage.toLowerCase();
            const alreadyInCart = lower.includes('already') || lower.includes('exists') || lower.includes('đã có') || lower.includes('tồn tại') || lower.includes('already in cart');

            // After adding, try to refresh cart and emit an event so header and other components can react
            try {
                const updated = await cartAPI.getCart();
                const items = updated.data?.data?.cartItems || updated.data?.cartItems || updated?.data || [];
                const count = Array.isArray(items) ? items.length : 0;
                window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count } }));
            } catch (e) {
                // ignore errors from fetching updated cart
            }

            return {
                success: true,
                alreadyInCart,
                data: response,
                message: rawMessage || 'Đã thêm vào giỏ hàng thành công!'
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

            // apiClient returns the parsed response body. Backend wraps payload inside { Status, Message, Data }
            // prefer Data, but support both shapes.
            const payload = response?.Data ?? response?.data ?? response;

            // If payload itself is a BaseResponse (has Data), unwrap again
            const cart = payload?.Data ?? payload?.data ?? payload;

            return {
                success: true,
                data: cart,
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

            // emit cartUpdated event after update
            try {
                const updated = await cartAPI.getCart();
                const items = updated.data?.data?.cartItems || updated.data?.cartItems || [];
                const count = Array.isArray(items) ? items.length : 0;
                window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count } }));
            } catch (e) {}

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

            // emit cartUpdated with zero count
            try {
                window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
            } catch (e) {}

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
