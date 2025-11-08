import apiClient from './apiClient';

export const favoriteAPI = {
    // Thêm sản phẩm vào yêu thích
    addFavorite: async (postId) => {
        try {
            const response = await apiClient.post(`/Favorite/create/${postId}`);
            return {
                success: true,
                data: response.data,
                message: 'Đã thêm vào yêu thích'
            };
        } catch (error) {
            console.error('Add favorite error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể thêm vào yêu thích',
                error: error.response?.data
            };
        }
    },

    // Xóa khỏi yêu thích
    removeFavorite: async (favoriteId) => {
        try {
            const response = await apiClient.delete(`/Favorite/delete/${favoriteId}`);
            return {
                success: true,
                data: response.data,
                message: 'Đã xóa khỏi yêu thích'
            };
        } catch (error) {
            console.error('Remove favorite error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể xóa khỏi yêu thích',
                error: error.response?.data
            };
        }
    },

    // Lấy danh sách yêu thích
    getAllFavorites: async () => {
        try {
            const response = await apiClient.get('/Favorite/getall');
            return {
                success: true,
                data: response.data?.data || response.data,
                message: 'Lấy danh sách yêu thích thành công'
            };
        } catch (error) {
            console.error('Get favorites error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể lấy danh sách yêu thích',
                error: error.response?.data
            };
        }
    },

    // Lấy chi tiết một favorite
    getFavoriteById: async (favoriteId) => {
        try {
            const response = await apiClient.get(`/Favorite/getbyid/${favoriteId}`);
            return {
                success: true,
                data: response.data?.data || response.data,
                message: 'Lấy thông tin yêu thích thành công'
            };
        } catch (error) {
            console.error('Get favorite by id error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.Message || 'Không thể lấy thông tin yêu thích',
                error: error.response?.data
            };
        }
    }
};
