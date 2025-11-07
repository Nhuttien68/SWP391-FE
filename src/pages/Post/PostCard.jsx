
import { Card, Image, Badge, Button, Typography, Space, Tag, Tooltip, message } from 'antd';
import {
    CarOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    HeartOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/cartAPI';
import { useAuth } from '../../context/AuthContext';

const { Text, Title } = Typography;

const PostCard = ({ post, onViewDetail }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

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

    const getModelOrCapacity = () => {
        if (post.type === 'VEHICLE') {
            const v = post.vehicle || post.Vehicle || null;
            if (!v) return 'N/A';
            return renderPrimitive(v.model ?? v.Model ?? v, 'N/A');
        }
        const b = post.battery || post.Battery || null;
        if (!b) return 'N/A';
        return renderPrimitive(b.capacity ?? b.Capacity ?? b.model ?? b.Model ?? b, 'N/A');
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

    const handleLike = (e) => {
        e.stopPropagation();
        // TODO: Implement like functionality
        console.log('Liked post:', post.id);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }

        try {
            const response = await cartAPI.addToCart(post.id || post.postId, 1);
            if (response.success) {
                message.success('Đã thêm vào giỏ hàng!');
            } else {
                message.error(response.message);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            message.error('Không thể thêm vào giỏ hàng');
        }
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để mua hàng');
            navigate('/login');
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
                        <Tooltip title="Yêu thích">
                            <Button
                                shape="circle"
                                icon={<HeartOutlined />}
                                onClick={handleLike}
                                className="bg-white/95 hover:!bg-red-500 hover:!text-white hover:!border-red-500 transition-all"
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
                        <Tooltip title="Thêm vào giỏ">
                            <Button
                                shape="circle"
                                icon={<ShoppingCartOutlined />}
                                onClick={handleAddToCart}
                                className="bg-white/95 hover:!bg-orange-500 hover:!text-white hover:!border-orange-500 transition-all"
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

                {/* Thương hiệu và Model */}
                <div className="flex items-center gap-2">
                    <CarOutlined className="text-blue-500 text-base" />
                    <Text className="font-medium text-gray-800">{getBrand()}</Text>
                    <Text type="secondary" className="text-xs">•</Text>
                    <Text type="secondary" className="text-sm">{getModelOrCapacity()}</Text>
                </div>

                {/* Thông tin xe/pin */}
                <div className="flex flex-wrap gap-2">
                    {post.type === 'VEHICLE' && (post.vehicle || post.Vehicle) && (
                        <>
                            <Tag icon={<CalendarOutlined />} color="blue" className="!m-0">
                                {getYear()}
                            </Tag>
                            <Tag icon={<ThunderboltOutlined />} color="green" className="!m-0">
                                {getMileage()} km
                            </Tag>
                        </>
                    )}

                    {post.type === 'BATTERY' && (post.battery || post.Battery) && (
                        <>
                            <Tag color="orange" className="!m-0">
                                🔋 {getCapacity()} kWh
                            </Tag>
                            <Tag color="cyan" className="!m-0">
                                {getCondition()}
                            </Tag>
                        </>
                    )}
                </div>

                {/* Ngày đăng tin */}
                {(post.createdAt || post.CreatedAt) && (
                    <div className="flex items-center gap-1">
                        <ClockCircleOutlined className="text-gray-400 text-xs" />
                        <Text type="secondary" className="text-xs">
                            {formatDate(post.createdAt || post.CreatedAt)}
                        </Text>
                    </div>
                )}

                {/* Thống kê và người bán */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Space size={12}>
                        <Tooltip title="Lượt xem">
                            <Space size={4} className="text-gray-500">
                                <EyeOutlined />
                                <Text className="text-xs">{Number(post.views ?? post.Views ?? 0)}</Text>
                            </Space>
                        </Tooltip>
                        <Tooltip title="Lượt thích">
                            <Space size={4} className="text-gray-500">
                                <HeartOutlined />
                                <Text className="text-xs">{Number(post.likes ?? post.Likes ?? 0)}</Text>
                            </Space>
                        </Tooltip>
                    </Space>

                    <Tooltip title={getSellerName()}>
                        <Text type="secondary" className="text-xs truncate max-w-[100px]">
                            📍 {getSellerName()}
                        </Text>
                    </Tooltip>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-2 pt-2">
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
                    <Tooltip title="Thêm vào giỏ hàng">
                        <Button
                            icon={<ShoppingCartOutlined />}
                            onClick={handleAddToCart}
                            size="large"
                            className="!h-10 !w-10 !rounded-lg hover:!bg-orange-50 hover:!text-orange-600 hover:!border-orange-400 transition-all"
                        />
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;