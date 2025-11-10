import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Select, Button, Typography, Spin, Empty, Pagination, Space, Card, Modal } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThunderboltOutlined, CarOutlined } from '@ant-design/icons';
import PostCard from './PostCard';
import { postAPI } from '../../services/postAPI';
import { brandAPI } from '../../services/brandAPI';

const { Title, Text } = Typography;
const { Option } = Select;

const MarketPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [postType, setPostType] = useState('vehicle');
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;
    const [pendingModalVisible, setPendingModalVisible] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [postRes, brandRes] = await Promise.all([
                    postAPI.getAllPosts({ page: 1, pageSize: 200 }),
                    brandAPI.getVehicleBrands(),
                ]);

                const postsData = postRes?.data?.data || postRes?.data || [];
                const normalized = postsData.map((p) => ({
                    ...p,
                    id: p.id ?? p.postId ?? p.postID,
                }));
                setPosts(normalized);
                setBrands(brandRes?.data || []);
            } catch (err) {
                console.error('Fetch posts error', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        // If navigated here with state to show pending-modal, show it then clear history state
        if (location?.state?.showPendingModal) {
            setPendingModalVisible(true);
            // Replace the history entry to avoid re-showing on refresh/back
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, []);

    const filteredPosts = useMemo(() => {
        let result = posts.slice();

        if (postType === 'vehicle') {
            result = result.filter(
                (p) => p.vehicle || p.Vehicle || p.type === 'VEHICLE' || !p.battery,
            );
        } else {
            result = result.filter((p) => p.battery || p.Battery || p.type === 'BATTERY');
        }

        if (searchText) {
            const q = searchText.toLowerCase();
            result = result.filter((p) => {
                const title = (p.title || p.Title || '').toString().toLowerCase();
                const desc = (p.description || p.Description || '').toString().toLowerCase();
                const brandName = (
                    (p.vehicle || p.Vehicle)?.brandName ||
                    (p.battery || p.Battery)?.brandName ||
                    p.brand ||
                    ''
                )
                    .toString()
                    .toLowerCase();

                return title.includes(q) || desc.includes(q) || brandName.includes(q);
            });
        }

        if (selectedBrand) {
            result = result.filter((p) => {
                const brandName =
                    (p.vehicle || p.Vehicle)?.brandName ||
                    (p.battery || p.Battery)?.brandName ||
                    p.brand ||
                    '';
                return brandName === selectedBrand;
            });
        }

        return result;
    }, [posts, postType, searchText, selectedBrand]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredPosts]);

    const startIndex = (currentPage - 1) * pageSize;
    const current = filteredPosts.slice(startIndex, startIndex + pageSize);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-10">
            <div className="max-w-7xl mx-auto px-4">
                <Card className="mb-6 shadow-sm bg-white/90">
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Space wrap>
                                <Select
                                    placeholder="Thương hiệu"
                                    allowClear
                                    style={{ width: 200 }}
                                    value={selectedBrand || undefined}
                                    onChange={setSelectedBrand}
                                    suffixIcon={<CarOutlined />}
                                >
                                    {brands.map((b) => (
                                        <Option key={b.brandId ?? b.id} value={b.brandName ?? b.BrandName}>
                                            {b.brandName ?? b.BrandName}
                                        </Option>
                                    ))}
                                </Select>
                                <Select placeholder="Khoảng giá" allowClear style={{ width: 180 }}>
                                    <Option value="0-100">Dưới 100tr</Option>
                                    <Option value="100-300">100tr - 300tr</Option>
                                    <Option value="300-500">300tr - 500tr</Option>
                                    <Option value="500+">Trên 500tr</Option>
                                </Select>
                                <Select placeholder="Khu vực" allowClear style={{ width: 180 }}>
                                    <Option value="HN">Hà Nội</Option>
                                    <Option value="HCM">TP.HCM</Option>
                                    <Option value="DN">Đà Nẵng</Option>
                                </Select>
                            </Space>
                        </Col>
                        <Col>
                            <Text type="secondary">Tìm thấy <strong>{filteredPosts.length}</strong> sản phẩm</Text>
                        </Col>
                    </Row>
                </Card>

                <div className="flex items-center justify-between mb-6">
                    <Title level={3} className="!mb-0">
                        <ThunderboltOutlined className="text-yellow-500 mr-2" />
                        {postType === 'vehicle' ? 'Xe điện đang bán' : 'Pin xe điện nổi bật'}
                    </Title>
                    <div className="space-x-2">
                        <Button type={postType === 'vehicle' ? 'primary' : 'default'} onClick={() => setPostType('vehicle')}>Xe</Button>
                        <Button type={postType === 'battery' ? 'primary' : 'default'} onClick={() => setPostType('battery')}>Pin</Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <Spin size="large" spinning={true}>
                            <div className="py-12">
                                <Text type="secondary">Đang tải sản phẩm...</Text>
                            </div>
                        </Spin>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <Empty description="Không tìm thấy sản phẩm phù hợp" />
                ) : (
                    <>
                        <Row gutter={[16, 16]}>
                            {current.map((post) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={post.id ?? post.postId}>
                                    <PostCard post={post} />
                                </Col>
                            ))}
                        </Row>
                        <div className="text-center mt-8">
                            <Pagination
                                current={currentPage}
                                total={filteredPosts.length}
                                pageSize={pageSize}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                                showTotal={(total) => `Tổng ${total} sản phẩm`}
                            />
                        </div>
                    </>
                )}
            </div>
            <Modal
                title="Bài đăng đã được gửi"
                open={pendingModalVisible}
                onOk={() => {
                    setPendingModalVisible(false);
                    navigate('/profile/posts');
                }}
                onCancel={() => setPendingModalVisible(false)}
                okText="Xem bài đăng của tôi"
            >
                <div>
                    <p>Bài đăng của bạn đã được tạo và sẽ được kiểm duyệt bởi quản trị viên trước khi hiển thị công khai.</p>
                    <p>Bạn có thể xem trạng thái bài đăng trong trang hồ sơ của mình.</p>
                </div>
            </Modal>
        </div>
    );
};

export default MarketPage;
