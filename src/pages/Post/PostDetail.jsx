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
    ShareAltOutlined,
    PhoneOutlined,
    MessageOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    SafetyOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/postAPI';

const { Title, Text, Paragraph } = Typography;

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPostDetail(id);
        }
    }, [id]);

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

    const handleLike = () => {
        setLiked(!liked);
        // TODO: Call API to like/unlike
    };

    const handleContact = () => {
        // TODO: Open contact modal or redirect to chat
        message.info('Chức năng liên hệ đang được phát triển');
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
                                    <span><CalendarOutlined /> {new Date(post.createdAt).toString()}</span>
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
                                    <Button
                                        icon={<HeartOutlined />}
                                        onClick={handleLike}
                                        className={liked ? 'text-red-500' : ''}
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
                                    <div className="text-sm text-gray-500">
                                        {post.seller?.totalSales} giao dịch thành công
                                    </div>
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