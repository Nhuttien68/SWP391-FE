import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Empty, Button, Typography, message, Spin } from 'antd';
import { HeartOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { favoriteAPI } from '../../services/favoriteAPI';

const { Title, Text } = Typography;

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const response = await favoriteAPI.getAllFavorites();
            
            if (response.success) {
                setFavorites(response.data || []);
            } else {
                console.error('Get favorites failed:', response);
                // Không hiển thị error nếu là lỗi 404 (chưa có yêu thích)
                if (response.error?.status !== 404) {
                    message.error(response.message || 'Không thể tải danh sách yêu thích');
                }
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            // Không hiển thị error để tránh spam
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (favoriteId) => {
        try {
            const response = await favoriteAPI.removeFavorite(favoriteId);
            
            if (response.success) {
                setFavorites(favorites.filter(fav => fav.favoriteId !== favoriteId));
                message.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                message.error(response.message || 'Không thể xóa khỏi yêu thích');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            message.error('Có lỗi xảy ra');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const handleViewDetail = (post) => {
        navigate(`/post/${post.postId}`);
    };

    const handleBuyNow = (post) => {
        navigate('/checkout', {
            state: { post: post.post }
        });
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <Spin size="large" />
                <div className="mt-4">
                    <Text>Đang tải danh sách yêu thích...</Text>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Title level={2} className="flex items-center gap-2">
                        <HeartOutlined className="text-red-500" />
                        Danh sách yêu thích
                    </Title>
                    <Text type="secondary">
                        Bạn có {favorites.length} sản phẩm trong danh sách yêu thích
                    </Text>
                </div>

                {favorites.length === 0 ? (
                    <Card>
                        <Empty
                            description="Chưa có sản phẩm yêu thích nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={() => navigate('/market')}>
                                Khám phá sản phẩm
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <Row gutter={[16, 16]}>
                        {favorites.map((favorite) => {
                            const post = favorite.post;
                            if (!post) return null;
                            
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={favorite.favoriteId}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div className="relative">
                                                <img
                                                    alt={post.title}
                                                    src={post.imageUrl || 'https://via.placeholder.com/300'}
                                                    className="h-48 w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                                                    }}
                                                />
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    className="absolute top-2 right-2 bg-white hover:bg-red-50"
                                                    onClick={() => removeFavorite(favorite.favoriteId)}
                                                />
                                            </div>
                                        }
                                        actions={[
                                            <Button
                                                type="link"
                                                onClick={() => handleViewDetail(favorite)}
                                            >
                                                Xem chi tiết
                                            </Button>,
                                            <Button
                                                type="primary"
                                                icon={<ShoppingCartOutlined />}
                                                onClick={() => handleBuyNow(favorite)}
                                            >
                                                Mua ngay
                                            </Button>,
                                        ]}
                                    >
                                        <Card.Meta
                                            title={
                                                <div className="truncate" title={post.title}>
                                                    {post.title}
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="text-red-600 font-bold text-lg mb-2">
                                                        {formatCurrency(post.price)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {post.description || 'Không có mô tả'}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
