import React, { useEffect, useState } from 'react';
import { List, Avatar, Rate, Typography, Spin, Empty, Button, Space, Popconfirm, Modal, Form, Input, message } from 'antd';
import reviewAPI from '../services/reviewAPI';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;
const { TextArea } = Input;

const ReviewList = ({ userId, onReviewUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    if (!userId) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const normalizedId = userId?.toString().toUpperCase();

      // Try fetching reviews by userId first (seller reviews), but fall back to post reviews
      let res = null;
      try {
        res = await reviewAPI.getReviewsByUserId(normalizedId);
      } catch (e) {
        res = null;
      }

      let list = [];

      // Normalise many possible shapes: API might return an array directly, or an object with data or Data
      const extractArray = (r) => {
        if (!r) return null;
        if (Array.isArray(r)) return r;
        if (Array.isArray(r.data)) return r.data;
        if (Array.isArray(r.Data)) return r.Data;
        // Some responses wrap data further
        if (r.data && Array.isArray(r.data.data)) return r.data.data;
        return null;
      };

      list = extractArray(res) || [];

      // If no user reviews found, try post reviews (in case caller passed a post id)
      if ((list.length === 0) && userId) {
        try {
          const res2 = await reviewAPI.getReviewsByPostId(normalizedId);
          list = extractArray(res2) || [];
        } catch (e) {
          // ignore
        }
      }

      setReviews(list || []);
    } catch (err) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    form.setFieldsValue({
      rating: review.rating,
      comment: review.comment,
    });
    setEditModalVisible(true);
  };

  const handleUpdateReview = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ReviewId: editingReview.reviewId || editingReview.ReviewId,
        Rating: values.rating,
        Comment: values.comment,
      };

      const res = await reviewAPI.updateReview(payload);
      
      if (res.success || res.Success || (res.status >= 200 && res.status < 300)) {
        message.success('Cập nhật đánh giá thành công');
        setEditModalVisible(false);
        form.resetFields();
        fetchReviews();
        onReviewUpdated && onReviewUpdated();
      } else {
        message.error(res.message || 'Không thể cập nhật đánh giá');
      }
    } catch (error) {
      console.error('Update review error:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật đánh giá');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await reviewAPI.deleteReview(reviewId);
      
      if (res.success || res.Success || (res.status >= 200 && res.status < 300)) {
        message.success('Đã xóa đánh giá');
        fetchReviews();
        onReviewUpdated && onReviewUpdated();
      } else {
        message.error(res.message || 'Không thể xóa đánh giá');
      }
    } catch (error) {
      console.error('Delete review error:', error);
      message.error(error.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const isMyReview = (review) => {
    if (!user) {
      console.log('[ReviewList] No user logged in');
      return false;
    }
    
    // Check by userId first
    const currentUserId = user.id || user.userId || user.Id || user.ID;
    const reviewerId = review.reviewerId || review.ReviewerId || review.userId || review.UserId || review.reviewerUserId || review.createdBy || review.authorId;
    
    if (currentUserId && reviewerId) {
      const match = String(currentUserId).toLowerCase() === String(reviewerId).toLowerCase();
      console.log('[ReviewList] Match by userId:', match);
      if (match) return true;
    }
    
    // Fallback: Check by email - check userObject.email
    const currentEmail = user.email || user.Email;
    const reviewerEmail = review.reviewerEmail || review.email || review.Email || review.userObject?.email || review.userObject?.Email || review.user?.email;
    
    console.log('[ReviewList] Checking by email:', {
      currentEmail,
      reviewerEmail,
      match: currentEmail && reviewerEmail && String(currentEmail).toLowerCase() === String(reviewerEmail).toLowerCase()
    });
    
    if (currentEmail && reviewerEmail) {
      return String(currentEmail).toLowerCase() === String(reviewerEmail).toLowerCase();
    }
    
    return false;
  };

  if (loading) return <div className="text-center py-6"><Spin /></div>;

  if (!reviews || reviews.length === 0) return <Empty description="Chưa có đánh giá" />;

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={reviews}
        renderItem={(item) => (
          <List.Item
            actions={
              isMyReview(item) ? [
                <Button
                  key="edit"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditReview(item)}
                >
                  Chỉnh sửa
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Xóa đánh giá này?"
                  description="Bạn có chắc muốn xóa đánh giá này không?"
                  onConfirm={() => handleDeleteReview(item.reviewId || item.ReviewId)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              ] : []
            }
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={<Text strong>{item.reviewerName || 'Người dùng'}</Text>}
              description={<Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Text>}
            />
            <div>
              <Rate disabled value={item.rating || 0} />
              <div className="mt-2">{item.comment}</div>
            </div>
          </List.Item>
        )}
      />

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đánh giá"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        onOk={handleUpdateReview}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Nhận xét"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
          >
            <TextArea rows={4} placeholder="Nhập nhận xét của bạn..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReviewList;
