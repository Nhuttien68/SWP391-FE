
import { Card, Image, Badge, Button, Typography, Rate, Divider } from 'antd';
import {
    CarOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { Meta } = Card;

const PostCard = ({ post, onViewDetail }) => {
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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

    return (
        <Card
            hoverable
            className="h-full shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleViewDetail}
            cover={
                <div className="relative">
                    <Image
                        src={
                            post.imageUrls?.[0] ||
                            post.ImageUrl ||
                            'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400'
                        }
                        alt={post.title || post.Title || 'Xe điện'}
                        height={200}
                        className="object-cover w-full"
                        preview={false}
                        fallback="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400"
                    />
                    <Badge
                        count={
                            (post.status || post.Status) === 'SOLD' ? 'Đã bán' : 'Có sẵn' 
                        }
                        style={{
                            backgroundColor: (post.status || post.Status) === 'SOLD' ? '#ff4d4f' : '#52c41a',
                            position: 'absolute',
                            top: 8,
                            right: 8
                        }}
                    />
                </div>
            }
            actions={[
                <EyeOutlined key="view" />,
                <HeartOutlined
                    key="like"
                    onClick={handleLike}
                    className="hover:text-red-500"
                />,
                <Button
                    key="detail"
                    type="primary"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail();
                    }}
                >
                    Xem chi tiết
                </Button>
            ]}
        >
            <Meta
                title={
                    <div>
                        <Text strong className="text-base line-clamp-2">
                            {renderPrimitive(post.title ?? post.Title, 'Xe điện')}
                        </Text>
                        <div className="mt-2">
                            <Text type="danger" className="text-lg font-bold">
                                {formatPrice(getPriceValue())}
                            </Text>
                        </div>
                    </div>
                }
                description={
                    <div className="space-y-2">
                        <Text className="text-sm text-gray-600 line-clamp-2">
                            {renderPrimitive(post.description ?? post.Description, 'Xe điện chất lượng cao')}
                        </Text>
                        <Text className="text-sm text-blue-600">
                            {getBrand()} - {getModelOrCapacity()}
                        </Text>
                        {post.type === 'VEHICLE' && (post.vehicle || post.Vehicle) && (
                            <div className="flex justify-between text-sm">
                                <span><CarOutlined /> {getYear()}</span>
                                <span><ThunderboltOutlined /> {getMileage()} km</span>
                            </div>
                        )}
                        {post.type === 'BATTERY' && (post.battery || post.Battery) && (
                            <div className="flex justify-between text-sm">
                                <span>🔋 {getCapacity()} kWh</span>
                                <span>📍 {getCondition()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs text-gray-500">
                            <span><EyeOutlined /> {Number(post.views ?? post.Views ?? 0)}</span>
                            <span><HeartOutlined /> {Number(post.likes ?? post.Likes ?? 0)}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex items-center justify-between">
                            <Text className="text-xs">
                                {getSellerName()}
                            </Text>
                            <Rate
                                disabled
                                defaultValue={Number(post.seller?.rating ?? post.Seller?.Rating ?? 4.5)}
                                size="small"
                            />
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default PostCard;