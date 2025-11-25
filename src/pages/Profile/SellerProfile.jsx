import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Avatar, Button, Descriptions, Typography, Row, Col, Tag, Empty, Pagination } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import userAPI from '../../services/userAPI';
import postAPI from '../../services/postAPI';
import ReviewList from '../../components/ReviewList';

const { Title, Text } = Typography;

const SellerProfile = () => {
  // use `:id` in the route (e.g. /seller/:id)
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedUser = location.state?.user;
  const [seller, setSeller] = useState(passedUser || null);
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsPageSize] = useState(6);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (passedUser) {
      setSeller(passedUser);
      loadPostsForSeller(passedUser);
      return;
    }

    if (id) {
      loadSeller();
    }

  }, [id, passedUser]);

  // reset pagination when posts change
  useEffect(() => {
    setPostsPage(1);
  }, [posts.length]);

  const loadSeller = async () => {
    setLoading(true);
    try {
      // fetch seller info by id from URL
      const res = await userAPI.getUserById(id);
      const sellerData = (res && res.success) ? (res.data || res.data?.data || res) : null;
      if (sellerData) {
        setSeller(sellerData);
      }

      // fetch all posts and filter by seller id
      const all = await postAPI.getAllPosts();
      const list = (all && (all.data || all.data?.data)) || all || [];
      const filtered = (Array.isArray(list) ? list : []).filter(p => {
        const pid = p.user?.userId || p.userId || p.user?.id || p.postedBy || p.ownerId || p.sellerId;
        return String(pid) === String(id);
      });
      setPosts(filtered);
    } catch (err) {
      console.error('Load seller error', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPostsForSeller = async (sellerObj) => {
    setLoading(true);
    try {
      const sellerId = sellerObj?.userId || sellerObj?.id || sellerObj?.UserId;
      const all = await postAPI.getAllPosts();
      const list = (all && (all.data || all.data?.data)) || all || [];
      const filtered = (Array.isArray(list) ? list : []).filter(p => {
        const pid = p.user?.userId || p.userId || p.user?.id || p.postedBy || p.ownerId || p.sellerId;
        return String(pid) === String(sellerId);
      });
      setPosts(filtered);
    } catch (err) {
      console.error('Load posts for seller error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-[80vh] bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card>
                <div className="text-center">
                  <Avatar size={120} icon={<UserOutlined />} src={seller?.avatar} />
                  <Title level={4} className="mt-4">{seller?.fullName || seller?.name || 'Người bán'}</Title>
                  {seller?.status === 'ACTIVE' && <Tag color="blue">Đã xác minh</Tag>}
                </div>
              </Card>
              {/* Reviews moved to left column below avatar */}
              <Card title="Đánh giá từ khách hàng" className="mt-6">
                {seller && (seller.userId || seller.id) ? (
                  <ReviewList userId={seller.userId || seller.id || id} />
                ) : (
                  <Empty description="Chưa có thông tin người bán" />
                )}
              </Card>
            </Col>

            <Col xs={24} md={16}>
              <Card title="Thông tin người bán">
                {seller ? (
                  <Descriptions column={1}>
                    <Descriptions.Item label="Họ và tên">{seller.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{seller.email}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{seller.phone}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Không tìm thấy người dùng" />
                )}
              </Card>

              <Card title="Bài đăng" className="mt-6">
                {posts.length === 0 ? (
                  <Empty description="Người bán chưa có bài đăng công khai" />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {posts.slice((postsPage - 1) * postsPageSize, postsPage * postsPageSize).map(p => (
                        <Card key={p.postId || p.id} type="inner" title={p.title || p.name} extra={<Button onClick={() => navigate(`/post/${p.postId || p.id}`)}>Xem</Button>}>
                          <Text strong className="text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price || p.Price || 0)}</Text>
                          <div className="mt-2 text-sm text-gray-600">{p.description?.slice(0, 120)}</div>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Pagination current={postsPage} pageSize={postsPageSize} total={posts.length} onChange={(page) => setPostsPage(page)} />
                    </div>
                  </>
                )}
              </Card>

              {/* Reviews were moved to the left column (below avatar) */}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
