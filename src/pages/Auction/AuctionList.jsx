import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Button,
    Statistic,
    Empty,
    Spin,
    Image,
    Badge,
    Space,
} from 'antd';
import {
    FireOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { getActiveAuctions } from '../../services/auctionAPI';
import { toast } from 'react-toastify';

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActiveAuctions();
    }, []);

    const fetchActiveAuctions = async () => {
        setLoading(true);
        try {
            const response = await getActiveAuctions();
            console.log('Active auctions response:', response);

            // Xử lý response từ API
            const auctionsData = response?.data || response || [];

            // Đảm bảo auctionsData là array
            const auctionsList = Array.isArray(auctionsData) ? auctionsData : [];

            setAuctions(auctionsList);
        } catch (error) {
            console.error('Error fetching auctions:', error);
            toast.error('Không thể tải danh sách đấu giá');
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    const getPostImage = (post) => {
        if (!post) return '/images/placeholder.jpg';

        // Thử các trường khác nhau để lấy hình ảnh
        if (post.imageUrls && post.imageUrls.length > 0) {
            return post.imageUrls[0];
        }
        if (post.postImages && post.postImages.length > 0) {
            return post.postImages[0].imageUrl || post.postImages[0];
        }
        if (post.PostImages && post.PostImages.length > 0) {
            return post.PostImages[0].ImageUrl || post.PostImages[0];
        }

        return '/images/placeholder.jpg';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getTimeRemaining = (endTime) => {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        return end - now;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Đang tải danh sách đấu giá..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <Title level={2}>
                        <FireOutlined className="text-red-500 mr-3" />
                        Đấu Giá Trực Tuyến
                    </Title>
                    <Paragraph className="text-gray-600">
                        Tham gia đấu giá các sản phẩm xe điện và phụ tùng với giá cạnh tranh
                    </Paragraph>
                    <Badge
                        count={auctions.length}
                        showZero
                        style={{ backgroundColor: '#52c41a' }}
                        className="text-lg"
                    >
                        <Tag color="blue" className="text-base px-4 py-1">
                            Phiên đang hoạt động
                        </Tag>
                    </Badge>
                </div>

                {/* Auction List */}
                {auctions.length === 0 ? (
                    <Empty
                        description="Chưa có phiên đấu giá nào đang hoạt động"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Row gutter={[24, 24]}>
                        {auctions.map((auction) => {
                            const timeRemaining = getTimeRemaining(auction.endTime);
                            const hasEnded = timeRemaining <= 0;

                            return (
                                <Col xs={24} sm={12} lg={8} key={auction.auctionId}>
                                    <Badge.Ribbon
                                        text={hasEnded ? 'Đã kết thúc' : 'Đang diễn ra'}
                                        color={hasEnded ? 'gray' : 'red'}
                                    >
                                        <Card
                                            hoverable={!hasEnded}
                                            cover={
                                                <div className="relative">
                                                    <Image
                                                        src={getPostImage(auction.post)}
                                                        alt={auction.post?.title || 'Auction Item'}
                                                        height={200}
                                                        style={{ objectFit: 'cover' }}
                                                        preview={false}
                                                        fallback="/images/placeholder.jpg"
                                                    />
                                                    <div className="absolute top-2 left-2">
                                                        <Tag color="blue" icon={<FireOutlined />}>
                                                            Đấu giá
                                                        </Tag>
                                                    </div>
                                                </div>
                                            }
                                            className={hasEnded ? 'opacity-75' : ''}
                                        >
                                            {/* Title */}
                                            <Title level={5} ellipsis={{ rows: 2 }} className="mb-3">
                                                {auction.post?.title || 'Sản phẩm đấu giá'}
                                            </Title>

                                            {/* Price Info */}
                                            <Space direction="vertical" className="w-full mb-3">
                                                <div className="flex justify-between items-center">
                                                    <Text type="secondary">Giá khởi điểm:</Text>
                                                    <Text strong>{formatPrice(auction.startPrice)}</Text>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <Text type="secondary">Giá hiện tại:</Text>
                                                    <Text strong className="text-red-500 text-lg">
                                                        {formatPrice(auction.currentPrice)}
                                                    </Text>
                                                </div>
                                            </Space>

                                            {/* Countdown or End Time */}
                                            {!hasEnded ? (
                                                <Card size="small" className="bg-blue-50 mb-3">
                                                    <Countdown
                                                        title={
                                                            <span>
                                                                <ClockCircleOutlined className="mr-2" />
                                                                Thời gian còn lại
                                                            </span>
                                                        }
                                                        value={new Date(auction.endTime).getTime()}
                                                        format="D ngày H giờ m phút s giây"
                                                        valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                                                    />
                                                </Card>
                                            ) : (
                                                <Card size="small" className="bg-gray-50 mb-3">
                                                    <Text type="secondary">
                                                        <ClockCircleOutlined className="mr-2" />
                                                        Đã kết thúc
                                                    </Text>
                                                </Card>
                                            )}

                                            {/* Bid Count */}
                                            <div className="flex justify-between items-center mb-3">
                                                <Text type="secondary">
                                                    <UserOutlined className="mr-1" />
                                                    Số lượt đặt giá:
                                                </Text>
                                                <Tag color="green">
                                                    {auction.auctionBids?.length || 0} lượt
                                                </Tag>
                                            </div>

                                            {/* Action Button */}
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                icon={<EyeOutlined />}
                                                onClick={() => navigate(`/auction/${auction.auctionId}`)}
                                            >
                                                {hasEnded ? 'Xem kết quả' : 'Tham gia đấu giá'}
                                            </Button>
                                        </Card>
                                    </Badge.Ribbon>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default AuctionList;
