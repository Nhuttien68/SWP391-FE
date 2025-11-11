import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Image,
    Typography,
    Button,
    Card,
    Descriptions,
    Tag,
    Avatar,
    Rate,
    Carousel,
    Divider,
    Space,
    Spin,
    FloatButton,
    message
} from 'antd';
import {
    ArrowLeftOutlined,
    CarOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    HeartOutlined,
    HeartFilled,
    ShareAltOutlined,
    PhoneOutlined,
    MessageOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    SafetyOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/postAPI';
import { favoriteAPI } from '../../services/favoriteAPI';
import { cartAPI } from '../../services/cartAPI';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

    // Robust owner detection to handle multiple API shapes
    const getOwnerId = (p) => {
        if (!p) return null;
        return (
            p.user?.id ?? p.userId ?? p.ownerId ?? p.sellerId ?? p.user?.userId ?? p.postedBy ?? p.createdBy ?? p.authorId ?? p.author?.id ?? p.Id ?? p.id ?? null
        );
    };

    const getCurrentUserId = (u) => {
        if (!u) return null;
        return (u.id ?? u.userId ?? u.userID ?? u._id ?? u.data?.id ?? u.user?.id ?? u.Id ?? null);
    };

    const ownerId = getOwnerId(post);
    const currentUserId = getCurrentUserId(user);
    const isPostOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));

    useEffect(() => {
        if (id) {
            fetchPostDetail(id);
            checkFavoriteStatus();
        }
    }, [id]);

    const checkFavoriteStatus = async () => {
        if (!isAuthenticated) {
            setLiked(false);
            setFavoriteId(null);
            return;
        }

        try {
            const response = await favoriteAPI.getAllFavorites();
            if (response.success && response.data) {
                const favorites = Array.isArray(response.data) ? response.data : [];

                // Tìm favorite có postId trùng với post hiện tại
                const favorite = favorites.find(fav => {
                    const favPostId = fav.post?.postId || fav.postId;
                    return favPostId === id;
                });

                if (favorite) {
                    setLiked(true);
                    setFavoriteId(favorite.favoriteId || favorite.id);
                } else {
                    setLiked(false);
                    setFavoriteId(null);
                }
            }
        } catch (error) {
            console.error('Check favorite status error:', error);
        }
    };

    const fetchPostDetail = async (postId) => {
        setLoading(true);
        try {
            const result = await postAPI.getPostById(postId);

            if (result.success) {
                setPost(result.data);
            } else {
                message.error(result.message);
                // Fallback to mock data for demo
                setPost(getMockPostDetail(postId));
            }
        } catch (error) {
            console.error('Error fetching post detail:', error);
            message.error('Không thể tải thông tin xe');
            // Fallback to mock data
            setPost(getMockPostDetail(postId));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Ensure we don't mutate the state object directly. If the post
        // doesn't provide images, populate `imageUrls` via setPost so React
        // re-renders and the Carousel receives the fallback images.
        if (!post) return;

        const defaultImages = [
            'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
        ];

        // If no imageUrls but there is an `images` array (mock), copy it.
        if ((!post.imageUrls || post.imageUrls.length === 0) && post.images && post.images.length > 0) {
            setPost(prev => ({ ...prev, imageUrls: post.images }));
            return;
        }

        // If neither imageUrls nor images exist, set default images.
        if (!post.imageUrls || post.imageUrls.length === 0) {
            setPost(prev => ({ ...prev, imageUrls: defaultImages }));
        }
    }, [post]);

    const getMockPostDetail = (postId) => {
        return {
            id: postId,
            title: 'Tesla Model 3 2023 - Xe điện cao cấp',
            description: 'Tesla Model 3 mới 100%, full option, tự lái cấp độ 2, màn hình cảm ứng 15 inch. Xe được nhập khẩu chính hãng từ Mỹ, đã qua kiểm định an toàn quốc tế. Thiết kế hiện đại, tiết kiệm năng lượng và thân thiện với môi trường.',
            price: 2500000000,
            brand: 'Tesla',
            model: 'Model 3',
            year: 2023,
            mileage: 0,
            batteryCapacity: 75,
            range: 500,
            chargingTime: '30 phút (DC fast charging)',
            location: 'TP.HCM',
            condition: 'Mới 100%',
            color: 'Trắng Pearl',
            transmission: 'Tự động',
            seats: 5,
            doors: 4,
            fuelType: 'Điện',
            images: [
                'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
                'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800',
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
            ],
            postedDate: '2024-01-15',
            views: 245,
            likes: 18,
            status: 'available',
            seller: {
                name: 'Nguyễn Văn A',
                rating: 4.8,
                totalSales: 15,
                joinDate: '2023-05-10',
                phone: '0901234567',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                verified: true
            },
            features: [
                'Tự lái cấp độ 2',
                'Màn hình cảm ứng 15 inch',
                'Hệ thống âm thanh Premium',
                'Camera 360 độ',
                'Phanh tự động khẩn cấp',
                'Cảnh báo điểm mù',
                'Điều hòa tự động 2 vùng',
                'Ghế da cao cấp'
            ]
        };
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDistance = (mileage) => {
        return new Intl.NumberFormat('vi-VN').format(mileage) + ' km';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days === 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                if (hours === 0) {
                    const minutes = Math.floor(diff / (1000 * 60));
                    return `${minutes} phút trước`;
                }
                return `${hours} giờ trước`;
            } else if (days === 1) {
                return 'Hôm qua';
            } else if (days < 7) {
                return `${days} ngày trước`;
            } else {
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (error) {
            return '';
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thêm vào yêu thích');
            navigate('/login');
            return;
        }

        if (isLoadingFavorite) return;

        setIsLoadingFavorite(true);

        try {
            if (liked && favoriteId) {
                // Xóa khỏi yêu thích
                const response = await favoriteAPI.removeFavorite(favoriteId);
                if (response.success) {
                    setLiked(false);
                    setFavoriteId(null);
                    message.success('Đã xóa khỏi yêu thích');
                } else {
                    message.error(response.message || 'Không thể xóa khỏi yêu thích');
                }
            } else {
                // Thêm vào yêu thích
                const response = await favoriteAPI.addFavorite(id);
                if (response.success) {
                    setLiked(true);
                    // Lấy favoriteId từ response
                    if (response.data?.favoriteId || response.data?.id) {
                        setFavoriteId(response.data.favoriteId || response.data.id);
                    }
                    message.success('Đã thêm vào yêu thích');
                } else {
                    message.error(response.message || 'Không thể thêm vào yêu thích');
                }
            }
        } catch (error) {
            console.error('Favorite error:', error);
            message.error('Có lỗi xảy ra');
        } finally {
            setIsLoadingFavorite(false);
        }
    };

    const handleContact = () => {
        // TODO: Open contact modal or redirect to chat
        message.info('Chức năng liên hệ đang được phát triển');
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }

        if (isPostOwner) {
            message.warning('Bạn không thể thêm bài đăng của chính mình vào giỏ hàng');
            return;
        }

        try {
            const response = await cartAPI.addToCart(post.id || post.postId, 1);
            if (response.success) {
                message.success('Đã thêm vào giỏ hàng!');
            } else {
                message.error(response.message || 'Không thể thêm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            message.error('Không thể thêm vào giỏ hàng');
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để mua hàng');
            navigate('/login');
            return;
        }

        if (isPostOwner) {
            message.warning('Bạn không thể mua bài đăng của chính mình');
            return;
        }

        navigate('/checkout', { state: { post: post } });
    };

    const handleCall = () => {
        if (post?.user?.phone) {
            window.open(`tel:${post.user.phone}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
                <div className="ml-4">
                    <Text>Đang tải thông tin xe...</Text>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Title level={3}>Không tìm thấy thông tin xe</Title>
                    <Button type="primary" onClick={() => navigate('/')}>
                        Quay về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-6"
                    size="large"
                >
                    Quay lại
                </Button>

                <Row gutter={[32, 32]}>
                    {/* Left Column - Images */}
                    <Col xs={24} lg={14}>
                        <Card className="mb-6">
                            <Carousel autoplay>
                                {post.imageUrls?.map((image, index) => (
                                    <div key={index}>
                                        <Image
                                            src={image}
                                            alt={`${post.title} - ${index + 1}`}
                                            className="w-full h-96 object-cover rounded-lg"
                                            fallback="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800"
                                        />
                                    </div>
                                ))}
                            </Carousel>
                        </Card>

                        {/* Description */}
                        <Card title="Mô tả chi tiết" className="mb-6">
                            <Paragraph className="text-base leading-relaxed">
                                {post.description}
                            </Paragraph>

                            {post.features && (
                                <div className="mt-6">
                                    <Title level={5}>Tính năng nổi bật:</Title>
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {post.features.map((feature, index) => (
                                            <Tag key={index} color="blue" className="mb-2">
                                                ✓ {feature}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Specifications */}
                        <Card title="Thông số kỹ thuật">
                            <Descriptions bordered column={2}>
                                {post.type === 'VEHICLE' ? (
                                    <>
                                        <Descriptions.Item label="Thương hiệu">{post.vehicle?.brandName}</Descriptions.Item>
                                        <Descriptions.Item label="Model">{post.vehicle?.model}</Descriptions.Item>
                                        <Descriptions.Item label="Năm sản xuất">{post.vehicle?.year}</Descriptions.Item>
                                        <Descriptions.Item label="Số km đã đi">{formatDistance(post.vehicle?.mileage)}</Descriptions.Item>
                                    </>
                                ) : (
                                    <>
                                        <Descriptions.Item label="Thương hiệu">{post.battery?.brandName}</Descriptions.Item>
                                        <Descriptions.Item label="Dung lượng">{post.battery?.capacity} kWh</Descriptions.Item>
                                        <Descriptions.Item label="Tình trạng">{post.battery?.condition}</Descriptions.Item>
                                    </>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Right Column - Details & Contact */}
                    <Col xs={24} lg={10}>
                        {/* Price & Basic Info */}
                        <Card className="mb-6">
                            <div className="text-center mb-4">
                                <Title level={2} className="text-red-600 mb-2">
                                    {formatPrice(post.price)}
                                </Title>
                                <Title level={3} className="mb-4">
                                    {post.title}
                                </Title>
                                <Space size="large" className="text-gray-600">
                                    <span><CalendarOutlined /> {formatDate(post.createdAt || post.postedDate)}</span>
                                </Space>
                            </div>

                            <Divider />

                            {/* Stats */}
                            <div className="flex justify-around text-center mb-4">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{post.views}</div>
                                    <div className="text-sm text-gray-500">Lượt xem</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{post.likes}</div>
                                    <div className="text-sm text-gray-500">Lượt thích</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{post.range}</div>
                                    <div className="text-sm text-gray-500">Km phạm vi</div>
                                </div>
                            </div>

                            <Divider />

                            {/* Action Buttons */}
                            <Space direction="vertical" className="w-full" size="middle">
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<PhoneOutlined />}
                                    onClick={handleCall}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Gọi điện: {post.user?.phone}
                                </Button>
                                <Button
                                    type="default"
                                    size="large"
                                    block
                                    icon={<MessageOutlined />}
                                    onClick={handleContact}
                                >
                                    Nhắn tin cho người bán
                                </Button>
                                <Space className="w-full">
                                    {/* Buy and Add-to-cart buttons */}
                                    <Button
                                        type={isPostOwner ? 'default' : 'primary'}
                                        danger={!isPostOwner}
                                        onClick={handleBuyNow}
                                        disabled={isPostOwner}
                                        className="!h-10 !font-semibold mr-2"
                                    >
                                        {isPostOwner ? 'Bài đăng của bạn' : 'Mua ngay'}
                                    </Button>
                                    <Button
                                        icon={<ShoppingCartOutlined />}
                                        onClick={handleAddToCart}
                                        disabled={isPostOwner}
                                        className="!h-10 !w-10 !rounded-lg"
                                    />
                                    <Button
                                        icon={liked ? <HeartFilled /> : <HeartOutlined />}
                                        onClick={handleLike}
                                        loading={isLoadingFavorite}
                                        className={liked ? 'text-red-500 border-red-500' : ''}
                                    >
                                        {liked ? 'Đã thích' : 'Yêu thích'}
                                    </Button>
                                    <Button icon={<ShareAltOutlined />}>
                                        Chia sẻ
                                    </Button>
                                </Space>
                            </Space>
                        </Card>

                        {/* Seller Info */}
                        <Card title="Thông tin người bán">
                            <div className="flex items-center mb-4">
                                <Avatar
                                    size={64}
                                    src={post.seller?.avatar}
                                    className="mr-4"
                                />
                                <div>
                                    <div className="flex items-center mb-1">
                                        <Text strong className="text-lg mr-2">
                                            {post.user?.fullName}
                                        </Text>
                                        {post.user?.status == 'ACTIVE' && (
                                            <Tag color="blue" icon={<SafetyOutlined />}>
                                                Đã xác minh
                                            </Tag>
                                        )}
                                    </div>
                                    <Rate
                                        disabled
                                        defaultValue={post.seller?.rating}
                                        className="mb-1"
                                    />
                                </div>
                            </div>

                            <Descriptions size="small">
                                <Descriptions.Item label="Tham gia từ">
                                    {post.seller?.joinDate}
                                </Descriptions.Item>
                                <Descriptions.Item label="Đánh giá">
                                    {post.seller?.rating}/5 ⭐
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Safety Tips */}
                        <Card title="Lưu ý an toàn" className="mt-6">
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li>• Gặp mặt trực tiếp để kiểm tra xe</li>
                                <li>• Kiểm tra giấy tờ pháp lý đầy đủ</li>
                                <li>• Không chuyển tiền trước khi nhận xe</li>
                                <li>• Thử nghiệm xe kỹ lưỡng trước khi mua</li>
                                <li>• Báo cáo nếu phát hiện gian lận</li>
                            </ul>
                        </Card>
                    </Col>
                </Row>
            </div>

            <FloatButton.BackTop />
        </div>
    );
};

export default PostDetail;