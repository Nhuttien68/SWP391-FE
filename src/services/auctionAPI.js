import apiClient from './apiClient';

/**
 * API service cho chức năng đấu giá
 */

// 1. Tạo phiên đấu giá mới
export const createAuction = async (auctionData) => {
    try {
        const response = await apiClient.post('/Auction/create', auctionData);
        return {
            success: true,
            status: response?.Status ?? response?.status ?? '201',
            data: response?.Data ?? response,
            message: response?.Message ?? response?.message
        };
    } catch (error) {
        console.error('Error creating auction:', error);
        throw error;
    }
};

// 2. Đặt giá thầu (Bid)
export const placeBid = async (bidData) => {
    try {
        const response = await apiClient.post('/Auction/bid', bidData);
        return {
            success: true,
            data: response?.Data ?? response,
            message: response?.Message
        };
    } catch (error) {
        console.error('Error placing bid:', error);
        throw error;
    }
};

// 3. Lấy chi tiết 1 phiên đấu giá
export const getAuctionById = async (auctionId) => {
    try {
        const response = await apiClient.get(`/Auction/${auctionId}`);
        return {
            success: true,
            data: response?.Data ?? response,
            message: response?.Message
        };
    } catch (error) {
        console.error('Error fetching auction details:', error);
        throw error;
    }
};

// 4. Lấy danh sách các phiên đang hoạt động
export const getActiveAuctions = async () => {
    try {
        const response = await apiClient.get('/Auction/active');
        return {
            success: true,
            data: response?.Data ?? response,
            message: response?.Message
        };
    } catch (error) {
        console.error('Error fetching active auctions:', error);
        throw error;
    }
};

// 5. Cập nhật thông tin người nhận sau khi thắng
export const updateTransactionReceiver = async (transactionId, receiverData) => {
    try {
        const response = await apiClient.put(`/Auction/update-transaction/${transactionId}`, receiverData);
        return {
            success: true,
            data: response?.Data ?? response,
            message: response?.Message
        };
    } catch (error) {
        console.error('Error updating receiver info:', error);
        throw error;
    }
};

// 6. Đóng các phiên đấu giá hết hạn (Admin only)
export const closeExpiredAuctions = async () => {
    try {
        const response = await apiClient.post('/Auction/close-expired');
        return {
            success: true,
            data: response?.Data ?? response,
            message: response?.Message
        };
    } catch (error) {
        console.error('Error closing expired auctions:', error);
        throw error;
    }
};

// 7. Kiểm tra xem post đã có đấu giá chưa (workaround: dùng API active auctions)
export const checkPostHasAuction = async (postId) => {
    try {
        // Lấy tất cả đấu giá đang hoạt động
        const response = await getActiveAuctions();

        if (response.success) {
            const auctions = Array.isArray(response.data) ? response.data : [];

            // Tìm đấu giá có postId trùng với post hiện tại VÀ đang Active
            const existingAuction = auctions.find(auction => {
                const auctionPostId = auction.postId || auction.PostId || auction.post?.postId || auction.post?.PostId;
                const isActive = (auction.status || auction.Status) === 'Active';
                return String(auctionPostId) === String(postId) && isActive;
            });

            if (existingAuction) {
                return {
                    success: true,
                    hasAuction: true,
                    auctionId: existingAuction.auctionId || existingAuction.AuctionId || existingAuction.id,
                    data: existingAuction
                };
            }

            return {
                success: true,
                hasAuction: false,
                auctionId: null
            };
        }

        return {
            success: false,
            hasAuction: false
        };
    } catch (error) {
        console.error('Error checking post auction:', error);
        return {
            success: false,
            hasAuction: false
        };
    }
}; export default {
    createAuction,
    placeBid,
    getAuctionById,
    getActiveAuctions,
    updateTransactionReceiver,
    closeExpiredAuctions,
    checkPostHasAuction,
};
