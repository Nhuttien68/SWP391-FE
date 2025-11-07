import apiClient from './apiClient';


export const brandAPI = {
    // Lấy danh sách thương hiệu xe
    getVehicleBrands: async () => {
        // Giả lập delay của API call
        //await new Promise(resolve => setTimeout(resolve, 500));

        const token = localStorage.getItem('token');
        const response = await apiClient.get(`/VehicleBrand/get-all-vehicle-brands`);

        return {
            success: true,
            data: response.data || [],
            message: 'Lấy danh sách thương hiệu xe thành công'
        };
    },

    // Lấy danh sách thương hiệu pin
    getBatteryBrands: async () => {
        // Giả lập delay của API call
        //await new Promise(resolve => setTimeout(resolve, 500));

        const token = localStorage.getItem('token');
        const response = await apiClient.get(`/BatteryBrand/get-all-battery-brand`);

        return {
            success: true,
            data: response.data || [],
            message: 'Lấy danh sách thương hiệu pin thành công'
        };
    }
};

export default brandAPI;
