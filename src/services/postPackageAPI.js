import apiClient from './apiClient';

export const postPackageAPI = {
    // Lấy tất cả các gói đăng tin
    getAllPackages: async () => {
        try {
            const response = await apiClient.get('/PostPackage/get-all');
            return {
                success: true,
                data: response,
                message: 'Lấy danh sách gói đăng tin thành công'
            };
        } catch (error) {
            console.error('Error fetching packages:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách gói đăng tin',
                error: error.response?.data
            };
        }
    },

    // Lấy thông tin chi tiết 1 gói đăng tin
    getPackageById: async (id) => {
        try {
            const response = await apiClient.get(`/PostPackage/get-by-id/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: 'Lấy thông tin gói đăng tin thành công'
            };
        } catch (error) {
            console.error('Error fetching package:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy thông tin gói đăng tin',
                error: error.response?.data
            };
        }
    },

    // Tạo gói đăng tin mới (Admin only)
    createPackage: async (packageData) => {
        try {
            const response = await apiClient.post('/PostPackage/create-postpackage', packageData);
            return {
                success: true,
                data: response.data.data,
                message: 'Tạo gói đăng tin thành công'
            };
        } catch (error) {
            console.error('Error creating package:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo gói đăng tin',
                error: error.response?.data
            };
        }
    },

    // Cập nhật gói đăng tin (Admin only)
    updatePackage: async (packageData) => {
        try {
            const response = await apiClient.put('/PostPackage/update-postpackage', packageData);
            return {
                success: true,
                data: response.data.data,
                message: 'Cập nhật gói đăng tin thành công'
            };
        } catch (error) {
            console.error('Error updating package:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật gói đăng tin',
                error: error.response?.data
            };
        }
    },

    // Xóa gói đăng tin (Admin only)
    deletePackage: async (id) => {
        try {
            const response = await apiClient.delete(`/PostPackage/delete/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: 'Xóa gói đăng tin thành công'
            };
        } catch (error) {
            console.error('Error deleting package:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa gói đăng tin',
                error: error.response?.data
            };
        }
    }
};
