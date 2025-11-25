import React, { useEffect, useState } from 'react';
import { List, Avatar, Rate, Typography, Spin, Empty } from 'antd';
import reviewAPI from '../services/reviewAPI';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ReviewList = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

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

  if (loading) return <div className="text-center py-6"><Spin /></div>;

  if (!reviews || reviews.length === 0) return <Empty description="Chưa có đánh giá" />;

  return (
    <List
      itemLayout="horizontal"
      dataSource={reviews}
      pagination={{ pageSize: 5 }}
      renderItem={(item) => (
        <List.Item>
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
  );
};

export default ReviewList;
