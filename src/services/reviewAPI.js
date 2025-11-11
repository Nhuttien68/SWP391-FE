import apiClient from './apiClient';

const reviewAPI = {
  getReviewsByPostId: (postId) => apiClient.get(`/Review/Get-Reviews-By-PostId/${postId?.toString().toUpperCase()}`),
  getReviewsByUserId: (userId) => apiClient.get(`/Review/Get-Reviews-By-UserId/${userId?.toString().toUpperCase()}`),
  // Deprecated: createReviewForPost removed from UI, use createReviewForSeller instead
  createReviewForSeller: (dto) => {
    // Ensure GUID values are uppercase (backend expects uppercase GUID strings)
    const payload = { ...dto };
    if (payload.TransactionId) payload.TransactionId = payload.TransactionId.toString().toUpperCase();
    if (payload.TransactionId === undefined && payload.transactionId) payload.transactionId = payload.transactionId.toString().toUpperCase();
    return apiClient.post('/Review/Crate-review-for-Seller', payload);
  },
  updateReview: (dto) => {
    const payload = { ...dto };
    if (payload.ReviewId) payload.ReviewId = payload.ReviewId.toString().toUpperCase();
    if (payload.reviewId) payload.reviewId = payload.reviewId.toString().toUpperCase();
    return apiClient.put('/Review/Update-Review', payload);
  },
  deleteReview: (id) => apiClient.delete(`/Review/Delete-Review/${id?.toString().toUpperCase()}`),
};

export default reviewAPI;
