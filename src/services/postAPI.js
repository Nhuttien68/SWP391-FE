import apiClient from './apiClient';

// Posts API endpoints
export const postAPI = {
    // Tạo bài đăng mới
    createPost: async (postData, type) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để tạo bài đăng'
                };
            }

            // Convert form data to JSON if needed
            const isFormData = postData instanceof FormData;

            // When sending FormData do NOT set Content-Type manually —
            // the browser/axios will add the correct multipart boundary.
            // When sending FormData we must ensure no explicit Content-Type is set
            // so the browser/axios can add the correct multipart boundary.
            const headers = isFormData
                ? { 'Authorization': `Bearer ${token}`, 'Content-Type': undefined }
                : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            const response = await apiClient.post(`/Posts/create-post-${type}`, postData, { headers });

            return {
                success: true,
                data: response.data,
                message: 'Tạo bài đăng thành công!'
            };
        } catch (error) {
            console.error('Create post error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Có lỗi xảy ra khi tạo bài đăng',
                error: error.response?.data
            };
        }
    },
    // Lấy tất cả posts
    getAllPosts: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);

            // Add filters
            if (params.search) queryParams.append('search', params.search);
            if (params.brand) queryParams.append('brand', params.brand);
            if (params.minPrice) queryParams.append('minPrice', params.minPrice);
            if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
            if (params.year) queryParams.append('year', params.year);

            //const response = await apiClient.get(`/Posts?${queryParams.toString()}`);
            const response = await apiClient.get(`/Posts/Get-All-Post`);

            return {
                success: true,
                data: response.data || response,
                message: 'Lấy danh sách bài đăng thành công'
            };
        } catch (error) {
            console.error('Get posts error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách xe điện',
                error: error.response?.data
            };
        }
    },

    // Lấy chi tiết post
    getPostById: async (postId) => {
        try {
            const response = await apiClient.get(`/Posts/${postId}`);

            return {
                success: true,
                data: response.data || response,
                message: 'Lấy thông tin xe thành công'
            };
        } catch (error) {
            console.error('Get post detail error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải thông tin xe',
                error: error.response?.data
            };
        }
    },

    // Tìm kiếm posts
    searchPosts: async (searchParams) => {
        try {
            const queryParams = new URLSearchParams();

            if (searchParams.keyword) queryParams.append('keyword', searchParams.keyword);
            if (searchParams.category) queryParams.append('category', searchParams.category);
            if (searchParams.location) queryParams.append('location', searchParams.location);
            if (searchParams.priceMin) queryParams.append('priceMin', searchParams.priceMin);
            if (searchParams.priceMax) queryParams.append('priceMax', searchParams.priceMax);

            const response = await apiClient.get(`/Posts/search?${queryParams.toString()}`);

            return {
                success: true,
                data: response.data || response,
                message: 'Tìm kiếm thành công'
            };
        } catch (error) {
            console.error('Search posts error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Tìm kiếm thất bại',
                error: error.response?.data
            };
        }
    },

    // Lấy posts theo danh mục
    getPostsByCategory: async (categoryId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);

            const response = await apiClient.get(`/Posts/category/${categoryId}?${queryParams.toString()}`);

            return {
                success: true,
                data: response.data || response,
                message: 'Lấy danh sách theo danh mục thành công'
            };
        } catch (error) {
            console.error('Get posts by category error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách theo danh mục',
                error: error.response?.data
            };
        }
    },



    // Cập nhật post
    updatePost: async (postId, postData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Chưa đăng nhập'
                };
            }

            const response = await apiClient.put(`/Posts/${postId}`, postData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Cập nhật bài đăng thành công!'
            };
        } catch (error) {
            console.error('Update post error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Cập nhật thất bại',
                error: error.response?.data
            };
        }
    },

    // Xóa post
    deletePost: async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Chưa đăng nhập'
                };
            }

            const response = await apiClient.delete(`/Posts/Delete-Post/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Xóa bài đăng thành công!'
            };
        } catch (error) {
            console.error('Delete post error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Xóa bài đăng thất bại',
                error: error.response?.data
            };
        }
    },

    // Lấy posts của user hiện tại
    getMyPosts: async (params = {}) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Chưa đăng nhập'
                };
            }

            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);

            const response = await apiClient.get(`/Posts/my-posts?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Lấy danh sách bài đăng của bạn thành công'
            };
        } catch (error) {
            console.error('Get my posts error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải bài đăng của bạn',
                error: error.response?.data
            };
        }
    },

    // Admin Functions
    // Lấy danh sách bài đăng chờ duyệt
    getPendingPosts: async () => {
        try {
            const response = await apiClient.get('/Posts/Get-All-Post-Pendding');
            return {
                success: true,
                data: response.data || response,
                message: 'Lấy danh sách bài đăng chờ duyệt thành công'
            };
        } catch (error) {
            console.error('Get pending posts error:', error);
            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể tải danh sách bài đăng chờ duyệt',
                error: error.response?.data
            };
        }
    },

    // Phê duyệt bài đăng
    approvePost: async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để thực hiện thao tác này'
                };
            }

            const response = await apiClient.put('/Posts/Approved-Post', null, {
                params: { postId: postId }, // Sửa thành postId
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Phê duyệt bài đăng thành công'
            };
        } catch (error) {
            // Log chi tiết lỗi để debug
            console.error('Approve post error:', error);
            console.error('Error response:', error.response);

            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể phê duyệt bài đăng',
                error: error.response?.data
            };
        }
    },

    // Từ chối bài đăng
    rejectPost: async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để thực hiện thao tác này'
                };
            }

            const response = await apiClient.put('/Posts/Reject-Post', null, {
                params: { postId: postId }, // Sửa thành postId
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Từ chối bài đăng thành công'
            };
        } catch (error) {
            // Log chi tiết lỗi để debug
            console.error('Reject post error:', error);
            console.error('Error response:', error.response);

            return {
                success: false,
                message: error.response?.data?.Message || 'Không thể từ chối bài đăng',
                error: error.response?.data
            };
        }
    }
};

export default postAPI;