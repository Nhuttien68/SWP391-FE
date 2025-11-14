import apiClient from './apiClient';

/**
 * API service cho chức năng đấu giá
 */

// 1. Tạo phiên đấu giá mới
export const createAuction = async (auctionData) => {
    try {
        const response = await apiClient.post('/Auction/create', auctionData);
        return response;
    } catch (error) {
        console.error('Error creating auction:', error);
        throw error;
    }
};

// 2. Đặt giá thầu (Bid)
export const placeBid = async (bidData) => {
    try {
        const response = await apiClient.post('/Auction/bid', bidData);
        return response;
    } catch (error) {
        console.error('Error placing bid:', error);
        throw error;
    }
};

// 3. Lấy chi tiết 1 phiên đấu giá
export const getAuctionById = async (auctionId) => {
    try {
        const response = await apiClient.get(`/Auction/${auctionId}`);
        return response;
    } catch (error) {
        console.error('Error fetching auction details:', error);
        throw error;
    }
};

// 4. Lấy danh sách các phiên đang hoạt động
export const getActiveAuctions = async () => {
    try {
        const response = await apiClient.get('/Auction/active');
        return response;
    } catch (error) {
        console.error('Error fetching active auctions:', error);
        throw error;
    }
};

// 5. Cập nhật thông tin người nhận sau khi thắng
export const updateTransactionReceiver = async (transactionId, receiverData) => {
    try {
        const response = await apiClient.put(`/Auction/update-transaction/${transactionId}`, receiverData);
        return response;
    } catch (error) {
        console.error('Error updating receiver info:', error);
        throw error;
    }
};

// 6. Đóng các phiên đấu giá hết hạn (Admin only)
export const closeExpiredAuctions = async () => {
    try {
        const response = await apiClient.post('/Auction/close-expired');
        return response;
    } catch (error) {
        console.error('Error closing expired auctions:', error);
        throw error;
    }
};

export default {
    createAuction,
    placeBid,
    getAuctionById,
    getActiveAuctions,
    updateTransactionReceiver,
    closeExpiredAuctions,
};
