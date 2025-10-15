import apiClient from './apiClient';

// Dữ liệu mẫu cho brands
const mockVehicleBrands = [
    { id: '1', name: 'VinFast' },
    { id: '2', name: 'Honda' },
    { id: '3', name: 'Yamaha' },
    { id: '4', name: 'Pega' },
    { id: '5', name: 'Yadea' },
    { id: '6', name: 'Dibao' },
    { id: '7', name: 'DK Bike' },
    { id: '8', name: 'Ninja' }
];

const mockBatteryBrands = [
    { id: '1', name: 'VinFast' },
    { id: '2', name: 'Bosch' },
    { id: '3', name: 'LG Chem' },
    { id: '4', name: 'Panasonic' },
    { id: '5', name: 'Samsung SDI' },
    { id: '6', name: 'CATL' },
    { id: '7', name: 'BYD' },
    { id: '8', name: 'Lithium Power' }
];

export const brandAPI = {
    // Lấy danh sách thương hiệu xe
    getVehicleBrands: async () => {
        // Giả lập delay của API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            data: mockVehicleBrands,
            message: 'Lấy danh sách thương hiệu xe thành công'
        };
    },

    // Lấy danh sách thương hiệu pin
    getBatteryBrands: async () => {
        // Giả lập delay của API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            data: mockBatteryBrands,
            message: 'Lấy danh sách thương hiệu pin thành công'
        };
    }
};

export default brandAPI;
