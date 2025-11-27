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
    message,
    Modal,
    Form,
    DatePicker,
    InputNumber
} from 'antd';
import {
    ArrowLeftOutlined,
    CarOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    HeartOutlined,
    HeartFilled,
    ShoppingCartOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    SafetyOutlined,
    DollarCircleOutlined,
    SwapOutlined,
    FireOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/postAPI';
import { favoriteAPI } from '../../services/favoriteAPI';
import { cartAPI } from '../../services/cartAPI';
import reviewAPI from '../../services/reviewAPI';
import { createAuction, checkPostHasAuction } from '../../services/auctionAPI';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from '../../components/ReviewForm';

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
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState('...');

    // Auction modal state
    const [isAuctionModalVisible, setIsAuctionModalVisible] = useState(false);
    const [auctionForm] = Form.useForm();
    const [creatingAuction, setCreatingAuction] = useState(false);
    const [hasExistingAuction, setHasExistingAuction] = useState(false);
    const [existingAuctionId, setExistingAuctionId] = useState(null);
    const [checkingAuction, setCheckingAuction] = useState(false);

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
            checkAuctionStatus();
        }
    }, [id]);

    // When post loads, fetch seller reviews to compute average rating
    useEffect(() => {
        const fetchSellerReviews = async () => {
            if (!post) return;

            // derive seller id robustly
            const sellerId = post.user?.userId || post.user?.id || post.seller?.id || post.seller?.userId || post.userId || post.sellerId || post.ownerId || null;
            if (!sellerId) return;

            const normalizedId = sellerId.toString().toUpperCase();
            try {
                let res = null;
                try {
                    res = await reviewAPI.getReviewsByUserId(normalizedId);
                } catch (e) {
                    res = null;
                }

                const extractArray = (r) => {
                    if (!r) return null;
                    if (Array.isArray(r)) return r;
                    if (Array.isArray(r.data)) return r.data;
                    if (Array.isArray(r.Data)) return r.Data;
                    if (r.data && Array.isArray(r.data.data)) return r.data.data;
                    return null;
                };

                let list = extractArray(res) || [];
                setReviews(list || []);

                if (list.length > 0) {
                    const ratings = list.map(it => Number(it.rating || it.Rating || 0)).filter(n => !Number.isNaN(n));
                    const sum = ratings.reduce((s, v) => s + v, 0);
                    const avg = ratings.length > 0 ? sum / ratings.length : null;
                    setAvgRating(avg ? Math.round(avg * 10) / 10 : null);
                } else {
                    setAvgRating('...');
                }
            } catch (err) {
                setReviews([]);
                setAvgRating('...');
            }
        };

        fetchSellerReviews();
    }, [post]);

    const checkAuctionStatus = async () => {
        if (!id) return;

        setCheckingAuction(true);
        try {
            const result = await checkPostHasAuction(id);
            if (result.success && result.hasAuction) {
                setHasExistingAuction(true);
                setExistingAuctionId(result.auctionId);
            } else {
                setHasExistingAuction(false);
                setExistingAuctionId(null);
            }
        } catch (error) {
            console.error('Error checking auction status:', error);
            setHasExistingAuction(false);
        } finally {
            setCheckingAuction(false);
        }
    };

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
                    const fId = favorite.favoriteId || favorite.id;
                    setFavoriteId(fId);
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
                    const fId = response.data?.favoriteId || response.data?.id;
                    setFavoriteId(fId);
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

    const handleCompare = () => {
        // Chuyển trực tiếp đến trang so sánh với sản phẩm hiện tại
        const params = new URLSearchParams(window.location.search);
        const currentPost1 = params.get('post1');
        const currentPost2 = params.get('post2');

        // Nếu chưa có sản phẩm nào, đặt làm post1
        if (!currentPost1) {
            navigate(`/compare?post1=${id}`);
        }
        // Nếu đã có post1 nhưng chưa có post2, đặt làm post2
        else if (!currentPost2) {
            // Kiểm tra xem post1 có trùng với sản phẩm hiện tại không
            if (currentPost1 === id) {
                message.info('Sản phẩm này đã được chọn để so sánh');
                navigate(`/compare?post1=${id}`);
            } else {
                navigate(`/compare?post1=${currentPost1}&post2=${id}`);
            }
        }
        // Nếu đã có đủ 2 sản phẩm
        else {
            message.warning('Đã có 2 sản phẩm để so sánh. Vui lòng xóa bớt sản phẩm trong trang so sánh.');
            navigate(`/compare?post1=${currentPost1}&post2=${currentPost2}`);
        }

        message.success('Đã thêm vào danh sách so sánh');
    };

    // Handle create auction
    const handleCreateAuction = async (values) => {
        // Check authentication first
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để tạo đấu giá');
            navigate('/login');
            return;
        }

        setCreatingAuction(true);
        try {
            const auctionData = {
                postId: post.id || post.postId,
                startPrice: values.startPrice,
                // DatePicker đã ở local timezone, format thành ISO string cho backend
                endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
            };

            console.log('Creating auction with data:', auctionData);
            const response = await createAuction(auctionData);
            console.log('Create auction response:', response);

            // Backend trả về object với status string "201"
            if (response && (response.status === '201' || response.status === 201)) {
                message.success('Tạo phiên đấu giá thành công!');
                setIsAuctionModalVisible(false);
                auctionForm.resetFields();

                // Navigate to auction detail
                const auctionId = response.data?.AuctionId || response.data?.auctionId || response.auctionId;
                if (auctionId) {
                    navigate(`/auction/${auctionId}`);
                } else {
                    // Nếu không có auctionId, về trang danh sách
                    navigate('/auction');
                }
            } else {
                message.error(response?.message || 'Tạo đấu giá thất bại');
            }
        } catch (error) {
            console.error('Error creating auction:', error);
            // Chỉ xử lý lỗi 401 thực sự, không xóa token vì lỗi khác
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
                // Không navigate ở đây, để interceptor xử lý
            } else {
                message.error(error.response?.data?.message || error.message || 'Không thể tạo phiên đấu giá');
            }
        } finally {
            setCreatingAuction(false);
        }
    };

    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [inCart, setInCart] = useState(false);


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

        if (isAddingToCart) return;

        // If we already know it's in cart, short-circuit
        if (inCart) {
            message.info('Sản phẩm đã có trong giỏ hàng');
            return;
        }

        setIsAddingToCart(true);
        const hide = message.loading({ content: 'Đang thêm vào giỏ hàng...', key: 'addCart' });
        try {
            const response = await cartAPI.addToCart(post.id || post.postId, 1);
            if (response.success) {
                if (response.alreadyInCart) {
                    message.open({ content: 'Sản phẩm đã có trong giỏ hàng', type: 'info', key: 'addCart', duration: 2 });
                } else {
                    message.open({ content: response.message || 'Đã thêm vào giỏ hàng!', type: 'success', key: 'addCart', duration: 2 });
                }
            } else {
                if (response.alreadyInCart) {
                    message.open({ content: 'Sản phẩm đã có trong giỏ hàng', type: 'info', key: 'addCart', duration: 2 });
                } else {
                    message.open({ content: response.message || 'Không thể thêm vào giỏ hàng', type: 'error', key: 'addCart', duration: 2 });
                }
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            const errMsg = error?.response?.data?.Message || error?.message || '';
            const lower = (errMsg || '').toString().toLowerCase();
            if (lower.includes('already') || lower.includes('exists') || lower.includes('đã có') || lower.includes('tồn tại')) {
                message.open({ content: 'Sản phẩm đã có trong giỏ hàng', type: 'info', key: 'addCart', duration: 2 });
            } else {
                message.open({ content: 'Không thể thêm vào giỏ hàng', type: 'error', key: 'addCart', duration: 2 });
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Check if this post is already in cart; re-run on cartUpdated events
    useEffect(() => {
        let mounted = true;
        const checkInCart = async () => {
            if (!isAuthenticated) {
                if (mounted) setInCart(false);
                return;
            }
            try {
                const res = await cartAPI.getCart();
                const cart = res?.data ?? res?.data?.Data ?? res?.data?.data ?? res?.data ?? res;
                const items = cart?.cartItems || cart?.CartItems || cart || [];
                const currentPostId = post?.id || post?.postId || id;
                const exists = Array.isArray(items) && items.some(item => {
                    const pid = item.postId ?? item.PostId ?? item.post?.id ?? item.post?.postId ?? item.postId ?? item.post?.PostId;
                    if (!pid && item.post) {
                        return String(item.post?.id || item.post?.postId) === String(currentPostId);
                    }
                    return String(pid) === String(currentPostId);
                });
                if (mounted) setInCart(Boolean(exists));
            } catch (err) {
                if (mounted) setInCart(false);
            }
        };

        checkInCart();

        const onCartUpdated = () => checkInCart();
        window.addEventListener('cartUpdated', onCartUpdated);
        return () => {
            mounted = false;
            window.removeEventListener('cartUpdated', onCartUpdated);
        };
    }, [isAuthenticated, id, post]);

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

                            {/* Seller Info */}
                            <Card title="Thông tin người bán">
                                <Descriptions size="medium" column={1} bordered>
                                    <Descriptions.Item label="Tên người bán">
                                        {post.user?.fullName || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        {post.user?.phone || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Đánh giá">
                                        {avgRating}/5 ⭐ ({reviews.length} đánh giá)
                                    </Descriptions.Item>
                                </Descriptions>

                                <div className="mt-4 text-center">
                                    <Button
                                        type="primary"
                                        ghost
                                        className="!h-10 !font-semibold mr-2 w-full"
                                        onClick={() => {
                                            const sellerId = post.user?.userId || post.user?.id || post.seller?.id || post.seller?.userId || post.userId || post.sellerId || post.ownerId || null;
                                            const sellerObj = post.user || post.seller || {
                                                userId: sellerId || post.user?.userId || post.user?.id || post.seller?.id || id,
                                                fullName: post.user?.fullName || post.seller?.name || 'Người bán'
                                            };
                                            if (sellerId) {
                                                navigate(`/seller/${sellerId}`, { state: { user: sellerObj } });
                                            } else {
                                                navigate('/seller', { state: { user: sellerObj } });
                                            }
                                        }}
                                    >
                                        Xem trang cá nhân & đánh giá
                                    </Button>

                                    {/* BUY and small actions moved here */}
                                    <div className="mt-4">
                                        <Button
                                            type={isPostOwner ? 'default' : 'primary'}
                                            onClick={handleBuyNow}
                                            disabled={isPostOwner}
                                            className="!h-10 !font-semibold mr-2 w-full"
                                        >
                                            {isPostOwner ? 'Bài đăng của bạn' : 'Mua ngay'}
                                        </Button>

                                        <div className="flex items-center justify-center mt-3 gap-2">
                                            <Button
                                                icon={<ShoppingCartOutlined />}
                                                onClick={handleAddToCart}
                                                disabled={isPostOwner}
                                                className="!h-10 !w-12 !rounded-lg"
                                            />
                                            <Button
                                                icon={liked ? <HeartFilled /> : <HeartOutlined />}
                                                onClick={handleLike}
                                                loading={isLoadingFavorite}
                                                className={liked ? 'text-red-500 border-red-500' : ''}
                                            />
                                            <Button
                                                icon={<SwapOutlined />}
                                                onClick={handleCompare}
                                            >
                                                So sánh
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Divider />

                            {/* Action Buttons */}
                            <Space direction="vertical" className="w-full" size="middle">
                                {/* Phone and message buttons removed - actions moved under seller profile */}

                                {/* Create Auction Button - Only for post owner */}
                                {isPostOwner && isAuthenticated && (
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        icon={<FireOutlined />}
                                        onClick={() => {
                                            if (hasExistingAuction && existingAuctionId) {
                                                message.info('Sản phẩm đã có phiên đấu giá. Đang chuyển hướng...');
                                                navigate(`/auction/${existingAuctionId}`);
                                            } else {
                                                console.log('Opening auction modal, isAuthenticated:', isAuthenticated);
                                                console.log('Token exists:', !!localStorage.getItem('token'));
                                                setIsAuctionModalVisible(true);
                                            }
                                        }}
                                        disabled={checkingAuction}
                                        loading={checkingAuction}
                                        className={hasExistingAuction ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'}
                                    >
                                        {checkingAuction ? 'Đang kiểm tra...' : hasExistingAuction ? 'Xem phiên đấu giá' : 'Tạo đấu giá cho sản phẩm này'}
                                    </Button>
                                )}

                                <Space className="w-full">
                                    {/* Buy and Add-to-cart buttons */}
                                    {/* Buy / small actions moved to Seller Info area per request */}
                                </Space>
                            </Space>
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
                {/* Review form moved to Orders page - creation should be done from Orders */}
            </div>

            {/* Auction Creation Modal */}
            <Modal
                title={
                    <Space>
                        <FireOutlined className="text-red-500" />
                        <span>Tạo phiên đấu giá</span>
                    </Space>
                }
                open={isAuctionModalVisible}
                onCancel={() => {
                    setIsAuctionModalVisible(false);
                    auctionForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={auctionForm}
                    layout="vertical"
                    onFinish={handleCreateAuction}
                >
                    <Form.Item
                        label="Giá khởi điểm (VNĐ)"
                        name="startPrice"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá khởi điểm' },
                            { type: 'number', min: 100000, message: 'Giá tối thiểu 100,000 VNĐ' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập giá khởi điểm"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/,/g, '')}
                            min={100000}
                            step={100000}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian kết thúc"
                        name="endTime"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian kết thúc' },
                            // ⚠️ COMMENTED FOR TESTING - Cho phép tạo đấu giá ngắn hạn
                            // {
                            //     validator: (_, value) => {
                            //         if (!value) return Promise.resolve();
                            //         const now = new Date();
                            //         const minEndTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
                            //         if (value.toDate() < minEndTime) {
                            //             return Promise.reject('Thời gian kết thúc phải ít nhất 1 giờ từ bây giờ');
                            //         }
                            //         return Promise.resolve();
                            //     }
                            // }
                        ]}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            placeholder="Chọn thời gian kết thúc"
                            disabledDate={(current) => {
                                // Cho phép chọn từ hôm nay trở đi (so sánh theo ngày, không theo giờ)
                                return current && current.startOf('day') < new Date().setHours(0, 0, 0, 0);
                            }}
                        />
                    </Form.Item>

                    <div className="bg-blue-50 p-4 rounded mb-4">
                        <Text type="secondary" className="text-xs">
                            <strong>📌 Lưu ý:</strong>
                            <ul className="mt-2 space-y-1">
                                <li>• <s>Phiên đấu giá phải kéo dài ít nhất 1 giờ</s> (TEST MODE: Có thể tạo đấu giá ngắn hạn)</li>
                                <li>• Người thắng sẽ tự động bị trừ tiền từ ví</li>
                                <li>• Bạn không thể hủy phiên đấu giá sau khi tạo</li>
                                <li>• Giá khởi điểm nên hợp lý để thu hút người mua</li>
                            </ul>
                        </Text>
                    </div>

                    <Form.Item>
                        <Space className="w-full justify-end">
                            <Button onClick={() => {
                                setIsAuctionModalVisible(false);
                                auctionForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creatingAuction}
                                icon={<FireOutlined />}
                            >
                                Tạo đấu giá
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <FloatButton.BackTop />
        </div>
    );
};

export default PostDetail;