import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Empty, Button, Typography, message, Spin } from 'antd';
import { HeartOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { favoriteAPI } from '../../services/favoriteAPI';
import postAPI from '../../services/postAPI';

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
                const raw = response.data || [];

                // Enrich favorites: ensure we have a `post` object when possible.
                const enriched = await Promise.all((raw || []).map(async (fav) => {
                    // If favorite already includes post, check SOLD status
                    const p = fav.post;
                    const postIdFromFav = fav.postId || (p && (p.postId || p.id));
                    if (p) {
                        if (String(p.status || p.Status || '').toUpperCase() === 'SOLD') {
                            return { ...fav, _postDeleted: true };
                        }
                        return fav;
                    }

                    if (!postIdFromFav) {
                        return { ...fav, _postDeleted: true };
                    }

                    try {
                        const postRes = await postAPI.getPostById(postIdFromFav);
                        if (postRes && postRes.success && postRes.data) {
                            const fetched = postRes.data;
                            if (String(fetched.status || fetched.Status || '').toUpperCase() === 'SOLD') {
                                return { ...fav, _postDeleted: true };
                            }
                            return { ...fav, post: fetched };
                        }
                        return { ...fav, _postDeleted: true };
                    } catch (err) {
                        return { ...fav, _postDeleted: true };
                    }
                }));

                setFavorites(enriched);
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

    const handleViewDetail = (favoriteOrPost) => {
        const post = favoriteOrPost?.post || favoriteOrPost;
        const id = post?.postId || post?.id;
        if (!id) {
            message.error('Không tìm thấy bài đăng');
            return;
        }
        navigate(`/post/${id}`);
    };

    const handleBuyNow = (favoriteOrPost) => {
        const post = favoriteOrPost?.post || favoriteOrPost;
        if (!post) {
            message.error('Không thể mua: bài đăng không tồn tại');
            return;
        }
        navigate('/checkout', {
            state: { post }
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

                            if (favorite._postDeleted) {
                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={favorite.favoriteId}>
                                        <Card
                                            hoverable
                                            className="flex flex-col justify-between"
                                            actions={[
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFavorite(favorite.favoriteId)}>
                                                    Xóa yêu thích
                                                </Button>,
                                                <Button type="link" onClick={() => navigate('/market')}>Khám phá</Button>
                                            ]}
                                        >
                                            <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                                Sản phẩm đã bị xóa
                                            </div>
                                            <Card.Meta
                                                title={<div className="truncate">Sản phẩm không còn tồn tại</div>}
                                                description={<div className="text-sm text-gray-500">Người bán đã xóa bài đăng hoặc bài đăng đã bán.</div>}
                                            />
                                        </Card>
                                    </Col>
                                );
                            }

                            if (!post) {
                                // Still no post and not marked deleted: show a placeholder
                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={favorite.favoriteId}>
                                        <Card hoverable>
                                            <div className="h-48 w-full bg-gray-50 flex items-center justify-center">
                                                <Spin />
                                            </div>
                                            <Card.Meta
                                                title={<div className="truncate">Đang kiểm tra bài đăng...</div>}
                                                description={<div className="text-sm text-gray-500">Vui lòng đợi</div>}
                                            />
                                        </Card>
                                    </Col>
                                );
                            }

                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={favorite.favoriteId}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div className="relative">
                                                <img
                                                    alt={post.title}
                                                    src={post.images?.[0]}
                                                    className="h-48 w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';
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
                                                    {/* <div className="text-sm text-gray-500 truncate">
                                                        {post.description || 'Không có mô tả'}
                                                    </div> */}
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
