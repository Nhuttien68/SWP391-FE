import apiClient from './apiClient';


export const brandAPI = {
    // Lấy danh sách thương hiệu xe
    getVehicleBrands: async () => {
        // Giả lập delay của API call
        //await new Promise(resolve => setTimeout(resolve, 500));

        const token = localStorage.getItem('token');
        const response = await apiClient.get(`/VehicleBrand/get-all-vehicle-brands`);
        // Normalize response shapes: backend may return { Data } or { data } or the array directly
        const raw = response?.Data ?? response?.data ?? response;
        const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.Data) ? raw.Data : (Array.isArray(raw?.data) ? raw.data : []));
        return {
            success: true,
            data: data,
            message: response?.Message ?? response?.message ?? 'Lấy danh sách thương hiệu xe thành công'
        };
    },

    // Lấy danh sách thương hiệu pin
    getBatteryBrands: async () => {
        // Giả lập delay của API call
        //await new Promise(resolve => setTimeout(resolve, 500));

        const token = localStorage.getItem('token');
        const response = await apiClient.get(`/BatteryBrand/get-all-battery-brand`);
        const raw = response?.Data ?? response?.data ?? response;
        const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.Data) ? raw.Data : (Array.isArray(raw?.data) ? raw.data : []));
        return {
            success: true,
            data: data,
            message: response?.Message ?? response?.message ?? 'Lấy danh sách thương hiệu pin thành công'
        };
    }
,

    // Vehicle brand CRUD
    createVehicleBrand: async (payload) => {
        try {
            const response = await apiClient.post('/VehicleBrand/create-vehicle-brand', payload);
            return { success: true, data: response?.Data ?? response, message: response?.Message ?? 'Tạo brand thành công' };
        } catch (error) {
            console.error('Create vehicle brand error:', error);
            return { success: false, message: error.response?.data?.Message || 'Tạo brand thất bại', error: error.response?.data };
        }
    },

    updateVehicleBrand: async (payload) => {
        try {
            const response = await apiClient.put('/VehicleBrand/update-vehicle-brand', payload);
            return { success: true, data: response?.Data ?? response, message: response?.Message ?? 'Cập nhật brand thành công' };
        } catch (error) {
            console.error('Update vehicle brand error:', error);
            return { success: false, message: error.response?.data?.Message || 'Cập nhật brand thất bại', error: error.response?.data };
        }
    },

    deleteVehicleBrand: async (brandId) => {
        try {
            const id = typeof brandId === 'string' ? brandId : String(brandId);
            const response = await apiClient.delete(`/VehicleBrand/delete-vehicle-brand/${encodeURIComponent(id)}`, {
                // include empty config so axios.put/delete signature is consistent
            });
            return { success: true, data: response?.Data ?? response, message: response?.Message ?? 'Xóa brand thành công' };
        } catch (error) {
            console.error('Delete vehicle brand error:', error?.response ?? error);
            return { success: false, message: error.response?.data?.Message || error.response?.data?.message || 'Xóa brand thất bại', error: error.response?.data };
        }
    },

    // Battery brand CRUD
    createBatteryBrand: async (payload) => {
        try {
            const response = await apiClient.post('/BatteryBrand/create-battery-brand', payload);
            return { success: true, data: response?.Data ?? response, message: response?.Message ?? 'Tạo battery brand thành công' };
        } catch (error) {
            console.error('Create battery brand error:', error);
            return { success: false, message: error.response?.data?.Message || 'Tạo battery brand thất bại', error: error.response?.data };
        }
    },

    updateBatteryBrand: async (payload) => {
        try {
            const response = await apiClient.put('/BatteryBrand/update-battery-brand', payload);
            return { success: true, data: response?.Data ?? response, message: response?.Message ?? 'Cập nhật battery brand thành công' };
        } catch (error) {
            console.error('Update battery brand error:', error);
            return { success: false, message: error.response?.data?.Message || 'Cập nhật battery brand thất bại', error: error.response?.data };
        }
    },

    deleteBatteryBrand: async (brandId) => {
        try {
            const id = typeof brandId === 'string' ? brandId : String(brandId);
            const response = await apiClient.delete(`/BatteryBrand/delete-battery-brand/${encodeURIComponent(id)}`);
            return { success: true, data: response?.Data ?? response, message: response?.Message ?? 'Xóa battery brand thành công' };
        } catch (error) {
            console.error('Delete battery brand error:', error?.response ?? error);
            return { success: false, message: error.response?.data?.Message || error.response?.data?.message || 'Xóa battery brand thất bại', error: error.response?.data };
        }
    }
};

export default brandAPI;
