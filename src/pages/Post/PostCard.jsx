
import { Card, Image, Badge, Button, Typography, Space, Tag, Tooltip, message } from 'antd';
import {
    CarOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    HeartOutlined,
    HeartFilled,
    ShoppingCartOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    SwapOutlined,
    UserSwitchOutlined,
    HighlightOutlined,
    BlockOutlined,
    BoxPlotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cartAPI } from '../../services/cartAPI';
import { favoriteAPI } from '../../services/favoriteAPI';
import { useAuth } from '../../context/AuthContext';

const { Text, Title } = Typography;

const PostCard = ({ post, onViewDetail }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

    // Kiểm tra xem post này đã được yêu thích chưa
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!isAuthenticated) {
                setIsFavorited(false);
                setFavoriteId(null);
                return;
            }

            try {
                const response = await favoriteAPI.getAllFavorites();
                if (response.success && response.data) {
                    const favorites = Array.isArray(response.data) ? response.data : [];
                    const currentPostId = post.id || post.postId;

                    // Tìm favorite có postId trùng với post hiện tại
                    const favorite = favorites.find(fav => {
                        const favPostId = fav.post?.postId || fav.postId;
                        return favPostId === currentPostId;
                    });

                    if (favorite) {
                        setIsFavorited(true);
                        setFavoriteId(favorite.favoriteId || favorite.id);
                    } else {
                        setIsFavorited(false);
                        setFavoriteId(null);
                    }
                }
            } catch (error) {
                console.error('Check favorite status error:', error);
            }
        };

        checkFavoriteStatus();
    }, [isAuthenticated, post.id, post.postId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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
                    year: 'numeric'
                });
            }
        } catch (error) {
            return '';
        }
    };

    // Helper to safely render values that might be objects coming from different API shapes
    const renderPrimitive = (val, fallback = 'N/A') => {
        // Always return a string to avoid React "object as child" errors
        if (val === null || val === undefined) return String(fallback);
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
        // If it's an object try common fields that are likely primitives
        if (typeof val === 'object') {
            const candidate = val.brandName ?? val.model ?? val.Name ?? val.name ?? val.capacity ?? val.capacity ?? null;
            if (candidate !== null && candidate !== undefined) return String(candidate);
            try {
                return JSON.stringify(val);
            } catch (e) {
                return String(fallback);
            }
        }
        return String(val);
    };

    // Determine if current authenticated user is the owner of this post
    const getOwnerIdFromPost = (p) => {
        if (!p) return null;
        return (
            p.user?.id || p.userId || p.ownerId || p.sellerId || p.user?.userId || p.postedBy || p.createdBy || p.authorId || p.author?.id || p.Id || p.id
        );
    };

    const getCurrentUserId = (u) => {
        if (!u) return null;
        return (u.id || u.userId || u.userID || u._id || u.data?.id || u.user?.id || u.Id);
    };

    const ownerId = getOwnerIdFromPost(post);
    const currentUserId = getCurrentUserId(user);
    const isPostOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));

    const getPriceValue = () => Number(post.price ?? post.Price ?? 0);

    const getBrand = () => {
        if (post.type === 'VEHICLE') {
            const v = post.vehicle || post.Vehicle || null;
            if (!v) return renderPrimitive(post.brand ?? post.Brand ?? 'N/A', 'N/A');
            return renderPrimitive(v.brandName ?? v.BrandName ?? v.model ?? v.Model ?? v, 'N/A');
        }
        const b = post.battery || post.Battery || null;
        if (!b) return renderPrimitive(post.brand ?? post.Brand ?? 'N/A', 'N/A');
        return renderPrimitive(b.brandName ?? b.BrandName ?? b.model ?? b.Model ?? b.capacity ?? b.Capacity ?? b, 'N/A');
    };

    const getModel = () => {
        const v = post.vehicle || post.Vehicle || null;
        if (!v) return 'N/A';
        return renderPrimitive(v.model ?? v.Model ?? v, 'N/A');
    };

    const getYear = () => {
        const v = post.vehicle || post.Vehicle || null;
        if (!v) return 'N/A';
        const y = (typeof v.year === 'number' || typeof v.year === 'string') ? v.year : renderPrimitive(v.year, 'N/A');
        return String(y);
    };

    const getMileage = () => {
        const v = post.vehicle || post.Vehicle || null;
        if (!v) return 'N/A';
        const m = v.mileage ?? v.Mileage ?? v.km ?? v.Km;
        if (typeof m === 'number') return m.toLocaleString();
        if (typeof m === 'string') return m;
        return renderPrimitive(m, 'N/A');
    };

    const getCapacity = () => {
        const b = post.battery || post.Battery || null;
        if (!b) return 'N/A';
        return renderPrimitive(b.capacity ?? b.Capacity ?? b, 'N/A');
    }

    const getCondition = () => {
        const b = post.battery || post.Battery || null;
        if (!b) return 'N/A';
        return renderPrimitive(b.condition ?? b.Condition ?? b, 'N/A');
    }

    const getSellerName = () => renderPrimitive(post.user?.fullName ?? 'Người bán');

    const handleViewDetail = () => {
        if (onViewDetail) {
            onViewDetail(post.id);
        } else {
            // Navigate to detail page
            navigate(`/post/${post.id}`);
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thêm vào yêu thích');
            navigate('/login');
            return;
        }

        if (isLoadingFavorite) return;

        setIsLoadingFavorite(true);

        try {
            if (isFavorited && favoriteId) {
                // Xóa khỏi yêu thích
                const response = await favoriteAPI.removeFavorite(favoriteId);
                if (response.success) {
                    setIsFavorited(false);
                    setFavoriteId(null);
                    message.success('Đã xóa khỏi yêu thích');
                } else {
                    message.error(response.message || 'Không thể xóa khỏi yêu thích');
                }
            } else {
                // Thêm vào yêu thích
                const currentPostId = post.id || post.postId;
                const response = await favoriteAPI.addFavorite(currentPostId);
                if (response.success) {
                    setIsFavorited(true);
                    // Lấy favoriteId từ response để có thể xóa sau
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

    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [inCart, setInCart] = useState(false);

    const handleAddToCart = async (e) => {
        e.stopPropagation();

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

        // If we already know it's in cart, short-circuit and inform the user
        if (inCart) {
            message.info('Sản phẩm đã có trong giỏ hàng');
            return;
        }

        setIsAddingToCart(true);
        // show a short loading toast so user sees feedback immediately
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
                // If API returned success:false (rare), show message
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

    // Load current cart and detect whether this post is already in cart
    useEffect(() => {
        let mounted = true;
        const checkInCart = async () => {
            if (!isAuthenticated) {
                if (mounted) setInCart(false);
                return;
            }
            try {
                const res = await cartAPI.getCart();
                // cartAPI.getCart returns { success, data }
                const cart = res?.data ?? res?.data?.Data ?? res?.data?.data ?? res?.data ?? res;
                const items = cart?.cartItems || cart?.CartItems || cart || [];
                const currentPostId = post.id || post.postId;
                const exists = Array.isArray(items) && items.some(item => {
                    const pid = item.postId ?? item.PostId ?? item.post?.id ?? item.post?.postId ?? item.postId ?? item.post?.PostId;
                    // Some backends return nested post object
                    if (!pid && item.post) {
                        return String(item.post?.id || item.post?.postId) === String(currentPostId);
                    }
                    return String(pid) === String(currentPostId);
                });
                if (mounted) setInCart(Boolean(exists));
            } catch (err) {
                // don't block UX on cart fetch errors
                if (mounted) setInCart(false);
            }
        };

        checkInCart();

        const onCartUpdated = (ev) => {
            // Re-check when cart updates elsewhere
            checkInCart();
        };

        window.addEventListener('cartUpdated', onCartUpdated);
        return () => {
            mounted = false;
            window.removeEventListener('cartUpdated', onCartUpdated);
        };
    }, [isAuthenticated, post.id, post.postId]);

    const handleBuyNow = (e) => {
        e.stopPropagation();

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

    const getFirstImage = () => {
        if (post.postImages && post.postImages.length > 0) {
            return post.postImages[0].imageUrl || post.postImages[0].ImageUrl;
        }
        if (post.PostImages && post.PostImages.length > 0) {
            return post.PostImages[0].imageUrl || post.PostImages[0].ImageUrl;
        }
        if (post.imageUrls && post.imageUrls.length > 0) {
            return post.imageUrls[0];
        }
        return 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400';
    };

    return (
        <Card
            hoverable
            className="h-full overflow-hidden group transition-all duration-300 hover:shadow-2xl border-0"
            styles={{ body: { padding: '16px' } }}
            onClick={handleViewDetail}
            cover={
                <div className="relative overflow-hidden bg-gray-100">
                    <Image
                        src={getFirstImage()}
                        alt={post.title || post.Title || 'Xe điện'}
                        height={220}
                        className="object-cover w-full transition-transform duration-500 group-hover:scale-110"
                        preview={false}
                        fallback="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400"
                    />

                    {/* Badge trạng thái góc trên phải */}
                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            count={(post.status || post.Status) === 'SOLD' ? 'Đã bán' : 'Còn hàng'}
                            style={{
                                backgroundColor: (post.status || post.Status) === 'SOLD' ? '#ff4d4f' : '#52c41a',
                                fontWeight: '600',
                                fontSize: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                borderRadius: '6px',
                                padding: '2px 8px'
                            }}
                        />
                    </div>

                    {/* Overlay gradient khi hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Quick action buttons khi hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Tooltip title={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}>
                            <Button
                                shape="circle"
                                icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
                                onClick={handleLike}
                                loading={isLoadingFavorite}
                                className={`transition-all ${isFavorited
                                    ? 'bg-red-500 !text-white !border-red-500 hover:!bg-red-600'
                                    : 'bg-white/95 hover:!bg-red-500 hover:!text-white hover:!border-red-500'
                                    }`}
                            />
                        </Tooltip>
                        <Tooltip title="Xem chi tiết">
                            <Button
                                shape="circle"
                                icon={<EyeOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail();
                                }}
                                className="bg-white/95 hover:!bg-blue-500 hover:!text-white hover:!border-blue-500 transition-all"
                            />
                        </Tooltip>
                        <div className="flex-1" />
                        <Tooltip title="So sánh sản phẩm">
                            <Button
                                shape="circle"
                                icon={<SwapOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/compare?post1=${post.id || post.postId}`);
                                }}
                                className="bg-white/95 hover:!bg-purple-500 hover:!text-white hover:!border-purple-500 transition-all"
                            />
                        </Tooltip>
                    </div>
                </div>
            }
        >
            {/* Nội dung card */}
            <div className="space-y-3">
                {/* Tiêu đề */}
                <Title
                    level={5}
                    className="!mb-0 line-clamp-2 !text-base !font-semibold hover:text-blue-600 transition-colors cursor-pointer min-h-[48px]"
                >
                    {renderPrimitive(post.title ?? post.Title, 'Xe điện')}
                </Title>

                {/* Giá tiền */}
                <div className="flex items-baseline gap-2">
                    <Text className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                        {formatPrice(getPriceValue())}
                    </Text>
                </div>

                {/* Seller name (moved below title) */}
                <div className="flex items-center gap-2">
                    <UserSwitchOutlined className="text-blue-500 text-base" />
                    <Text className="font-medium text-gray-800">{getSellerName()}</Text>
                </div>

                {/* Thương hiệu và Model */}
                <div className="flex items-center gap-2">
                    <BlockOutlined className="text-blue-500 text-base" />
                    <Text className="font-medium text-gray-800">{getBrand()}</Text>
                    {post.type === 'VEHICLE' && (
                        <>
                            <Text type="secondary" className="text-xs">•</Text>
                            <CarOutlined className="text-blue-500 text-base" />
                            <Text type="secondary" className="font-medium text-gray-800">{getModel()}</Text>
                        </>
                    )}
                </div>

                {/* Thông tin xe/pin */}
                <div className="flex flex-wrap gap-2">
                    {post.type === 'VEHICLE' && (post.vehicle || post.Vehicle) && (
                        <>
                            <Tag icon={<ThunderboltOutlined />} color="green" className="!m-0">
                                {getMileage()} km
                            </Tag>
                            <Tag icon={<CalendarOutlined />} color="blue" className="!m-0">
                                {getYear()}
                            </Tag>
                        </>
                    )}

                    {post.type === 'BATTERY' && (post.battery || post.Battery) && (
                        <>
                            <Tag color="orange" className="!m-0">
                                <BoxPlotOutlined /> {getCapacity()} kWh
                            </Tag>
                            <Tag color="cyan" className="!m-0">
                                {getCondition()}
                            </Tag>
                        </>
                    )}
                </div>

                {/* Ngày đăng tin */}
                {(post.createdAt || post.CreatedAt) && (
                    <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                        <ClockCircleOutlined className="text-gray-400 text-xs" />
                        <Text type="secondary" className="text-xs">
                            {formatDate(post.createdAt || post.CreatedAt)}
                        </Text>
                    </div>
                )}

                {/* Thời gian còn lại và gói đăng tin */}
                {post.expireAt && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                            <ClockCircleOutlined className="text-orange-500 text-xs" />
                            <Text className="text-xs font-medium text-orange-600">
                                {(() => {
                                    const now = new Date();
                                    const expireDate = new Date(post.expireAt);
                                    const diff = expireDate - now;
                                    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

                                    if (daysLeft < 0) return 'Đã hết hạn';
                                    if (daysLeft === 0) {
                                        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                                        return hoursLeft > 0 ? `Còn ${hoursLeft} giờ` : 'Sắp hết hạn';
                                    }
                                    return daysLeft === 1 ? 'Còn 1 ngày' : `Còn ${daysLeft} ngày`;
                                })()}
                            </Text>
                        </div>
                        {post.postDetail && (
                            <Tooltip title={`Gói: ${post.postDetail.packageName} - ${post.postDetail.durationInDays} ngày`}>
                                <Tag color="blue" className="!m-0 !text-xs">
                                    {post.postDetail.packageName}
                                </Tag>
                            </Tooltip>
                        )}
                    </div>
                )}

                {/* Nút hành động */}
                <div className="flex gap-2 pt-2">
                    {isPostOwner ? (
                        <Button
                            type="default"
                            block
                            size="large"
                            disabled
                            className="!font-semibold !h-10 !rounded-lg shadow-md transition-all"
                        >
                            Bài đăng của bạn
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            danger
                            icon={<ShoppingOutlined />}
                            onClick={handleBuyNow}
                            block
                            size="large"
                            className="!font-semibold !h-10 !rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            Mua ngay
                        </Button>
                    )}
                    <Tooltip title="So sánh sản phẩm">
                        <Button
                            icon={<SwapOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/compare?post1=${post.id || post.postId}`);
                            }}
                            size="large"
                            className="!h-10 !w-10 !rounded-lg hover:!bg-purple-50 hover:!text-purple-600 hover:!border-purple-400 transition-all"
                        />
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;