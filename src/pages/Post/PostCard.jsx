import React from 'react';
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
                            post.images?.[0] ||
                            post.Images?.[0]?.ImageUrl ||
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
                            (post.status || post.Status) === 'available' ||
                            (post.status || post.Status) === 'Active' ?
                            'Có sẵn' : 'Đã bán'
                        }
                        style={{
                            backgroundColor:
                                (post.status || post.Status) === 'available' ||
                                (post.status || post.Status) === 'Active' ?
                                '#52c41a' : '#ff4d4f',
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
                            {post.title || post.Title || 'Xe điện'}
                        </Text>
                        <div className="mt-2">
                            <Text type="danger" className="text-lg font-bold">
                                {formatPrice(post.price || post.Price || 0)}
                            </Text>
                        </div>
                    </div>
                }
                description={
                    <div className="space-y-2">
                        <Text className="text-sm text-gray-600 line-clamp-2">
                            {post.description || post.Description || 'Xe điện chất lượng cao'}
                        </Text>
                        <div className="flex justify-between text-sm">
                            <span>🏢 {post.vehicle?.brandName || post.battery?.brandName || 'N/A'}</span>
                            {post.vehicle ?? (
                                <span>🚗 {post.vehicle?.model || 'N/A'}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-sm">
                            {post.vehicle ?? (
                                <>
                                    <span>🗓️ {post.vehicle?.year || 'N/A'}</span>
                                    <span>🛣️ {post.vehicle?.mileage || 'N/A'}km</span>
                                </>
                            )}
                            {post.battery ?? (
                                <>
                                    <span>⚡ {post.battery?.capacity || 'N/A'}kW</span>
                                    <span>❤️‍🩹 {post.battery?.condition || 'N/A'}</span>
                                </>
                            )}
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                            <span><EyeOutlined /> {post.views || post.Views || 0}</span>
                            <span><HeartOutlined /> {post.likes || post.Likes || 0}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex items-center justify-between">
                            <Text className="text-xs">
                                {post.seller?.name || post.Seller?.Name || post.sellerName || 'Người bán'}
                            </Text>
                            <Rate 
                                disabled 
                                defaultValue={post.seller?.rating || post.Seller?.Rating || 4.5} 
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