import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    InputNumber,
    List,
    Avatar,
    Tag,
    Statistic,
    Divider,
    Space,
    Spin,
    Empty,
    Image,
    Modal,
    Form,
    Input,
    message,
} from 'antd';
import {
    FireOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    TrophyOutlined,
    HistoryOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { getAuctionById, placeBid } from '../../services/auctionAPI';
import authAPI from '../../services/authAPI';
import { toast } from 'react-toastify';

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const AuctionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const currentUserId = authAPI.getCurrentUserId();

    useEffect(() => {
        fetchAuctionDetails();
        // Auto refresh mỗi 10 giây
        const interval = setInterval(fetchAuctionDetails, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchAuctionDetails = async () => {
        try {
            const response = await getAuctionById(id);
            if (response.status === '200' && response.data) {
                setAuction(response.data);
                // Set giá đặt mặc định cao hơn giá hiện tại
                setBidAmount(response.data.currentPrice + 1000000);
            }
        } catch (error) {
            console.error('Error fetching auction:', error);
            toast.error('Không thể tải thông tin đấu giá');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!auction) return;

        // Kiểm tra không được đặt giá vào bài của chính mình
        const postOwnerId = auction.post?.userId || auction.post?.user?.userId;
        if (postOwnerId && String(postOwnerId) === String(currentUserId)) {
            toast.error('Bạn không thể đặt giá vào bài đăng của chính mình!');
            return;
        }

        if (bidAmount <= auction.currentPrice) {
            toast.error('Giá đặt phải cao hơn giá hiện tại!');
            return;
        }

        setSubmitting(true);
        try {
            const response = await placeBid({
                auctionId: auction.auctionId,
                bidAmount: bidAmount,
            });

            if (response.status === '200') {
                toast.success('Đặt giá thành công!');
                fetchAuctionDetails(); // Refresh data
            } else {
                toast.error(response.message || 'Đặt giá thất bại');
            }
        } catch (error) {
            console.error('Error placing bid:', error);
            if (error.response?.status === 401) {
                toast.error('Vui lòng đăng nhập để tham gia đấu giá');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'Đặt giá thất bại');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getPostImage = (post) => {
        if (!post) return '/images/placeholder.jpg';
        if (post.imageUrls && post.imageUrls.length > 0) return post.imageUrls[0];
        if (post.postImages && post.postImages.length > 0) {
            return post.postImages[0].imageUrl || post.postImages[0];
        }
        return '/images/placeholder.jpg';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Đang tải thông tin đấu giá..." />
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Empty description="Không tìm thấy phiên đấu giá" />
            </div>
        );
    }

    const isActive = auction.status === 'Active' && new Date(auction.endTime) > new Date();
    const highestBid = auction.auctionBids && auction.auctionBids.length > 0
        ? [...auction.auctionBids].sort((a, b) => b.bidAmount - a.bidAmount)[0]
        : null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <Button onClick={() => navigate('/auction')} className="mb-4">
                        ← Quay lại danh sách
                    </Button>
                    <Title level={2}>
                        <FireOutlined className="text-red-500 mr-3" />
                        {auction.post?.title || 'Chi tiết đấu giá'}
                    </Title>
                    <Tag color={isActive ? 'red' : 'gray'} className="text-base px-3 py-1">
                        {isActive ? 'Đang diễn ra' : 'Đã kết thúc'}
                    </Tag>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Column - Product Info */}
                    <Col xs={24} lg={14}>
                        <Card>
                            <Image
                                src={getPostImage(auction.post)}
                                alt={auction.post?.title}
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                                fallback="/images/placeholder.jpg"
                            />

                            <Divider />

                            <Title level={4}>Thông tin sản phẩm</Title>
                            <Space direction="vertical" className="w-full">
                                {auction.post?.description && (
                                    <Paragraph>{auction.post.description}</Paragraph>
                                )}
                                {auction.post?.location && (
                                    <Text>
                                        <EnvironmentOutlined className="mr-2" />
                                        Địa điểm: {auction.post.location}
                                    </Text>
                                )}
                                {auction.post?.createdAt && (
                                    <Text type="secondary">
                                        <CalendarOutlined className="mr-2" />
                                        Đăng ngày: {formatDateTime(auction.post.createdAt)}
                                    </Text>
                                )}
                            </Space>
                        </Card>

                        {/* Bid History */}
                        <Card title={<><HistoryOutlined className="mr-2" />Lịch sử đặt giá</>} className="mt-4">
                            {auction.auctionBids && auction.auctionBids.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={[...auction.auctionBids].sort((a, b) =>
                                        new Date(b.bidTime) - new Date(a.bidTime)
                                    )}
                                    renderItem={(bid, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        icon={<UserOutlined />}
                                                        style={{
                                                            backgroundColor: index === 0 ? '#52c41a' : '#1890ff'
                                                        }}
                                                    />
                                                }
                                                title={
                                                    <Space>
                                                        <Text strong>
                                                            {bid.user?.fullName || bid.user?.email || 'Người dùng'}
                                                        </Text>
                                                        {index === 0 && (
                                                            <Tag color="green" icon={<TrophyOutlined />}>
                                                                Đang dẫn đầu
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                }
                                                description={
                                                    <Text type="secondary">
                                                        {formatDateTime(bid.bidTime)}
                                                    </Text>
                                                }
                                            />
                                            <Text strong className="text-lg text-red-500">
                                                {formatPrice(bid.bidAmount)}
                                            </Text>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="Chưa có ai đặt giá" />
                            )}
                        </Card>
                    </Col>

                    {/* Right Column - Auction Info & Bidding */}
                    <Col xs={24} lg={10}>
                        {/* Countdown */}
                        <Card className="mb-4">
                            {isActive ? (
                                <Countdown
                                    title={
                                        <Title level={4}>
                                            <ClockCircleOutlined className="mr-2" />
                                            Thời gian còn lại
                                        </Title>
                                    }
                                    value={new Date(auction.endTime).getTime()}
                                    format="D ngày H giờ m phút s giây"
                                    valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                                />
                            ) : (
                                <div className="text-center">
                                    <Title level={4} type="secondary">
                                        <ClockCircleOutlined className="mr-2" />
                                        Đấu giá đã kết thúc
                                    </Title>
                                    <Text type="secondary">
                                        Kết thúc lúc: {formatDateTime(auction.endTime)}
                                    </Text>
                                </div>
                            )}
                        </Card>

                        {/* Price Info */}
                        <Card className="mb-4">
                            <Space direction="vertical" className="w-full" size="large">
                                <div>
                                    <Text type="secondary">Giá khởi điểm</Text>
                                    <div className="text-2xl font-bold">
                                        {formatPrice(auction.startPrice)}
                                    </div>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />
                                <div>
                                    <Text type="secondary">Giá hiện tại</Text>
                                    <div className="text-3xl font-bold text-red-500">
                                        {formatPrice(auction.currentPrice)}
                                    </div>
                                </div>
                                {highestBid && (
                                    <>
                                        <Divider style={{ margin: '8px 0' }} />
                                        <div>
                                            <Text type="secondary">
                                                <TrophyOutlined className="mr-2" />
                                                Người đang dẫn đầu
                                            </Text>
                                            <div className="mt-2">
                                                <Tag color="green" className="text-base px-3 py-1">
                                                    {highestBid.user?.fullName || 'Người dùng'}
                                                </Tag>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Space>
                        </Card>

                        {/* Bidding Form */}
                        {isActive && (
                            <Card title={<><DollarOutlined className="mr-2" />Đặt giá của bạn</>}>
                                {(() => {
                                    const postOwnerId = auction.post?.userId || auction.post?.user?.userId;
                                    const isOwnAuction = postOwnerId && String(postOwnerId) === String(currentUserId);

                                    if (isOwnAuction) {
                                        return (
                                            <div className="text-center py-8">
                                                <Text type="warning" className="text-base">
                                                    ⚠️ Bạn không thể đặt giá vào phiên đấu giá của chính mình
                                                </Text>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Space direction="vertical" className="w-full" size="large">
                                            <div>
                                                <Text type="secondary" className="block mb-2">
                                                    Nhập giá đặt (VNĐ)
                                                </Text>
                                                <InputNumber
                                                    size="large"
                                                    style={{ width: '100%' }}
                                                    min={auction.currentPrice + 100000}
                                                    step={100000}
                                                    value={bidAmount}
                                                    onChange={setBidAmount}
                                                    formatter={(value) =>
                                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                    parser={(value) => value.replace(/,/g, '')}
                                                />
                                                <Text type="secondary" className="text-xs">
                                                    Giá tối thiểu: {formatPrice(auction.currentPrice + 100000)}
                                                </Text>
                                            </div>

                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                loading={submitting}
                                                onClick={handlePlaceBid}
                                                icon={<FireOutlined />}
                                            >
                                                Đặt giá ngay
                                            </Button>

                                            <div className="bg-blue-50 p-3 rounded">
                                                <Text type="secondary" className="text-xs">
                                                    💡 <strong>Lưu ý:</strong> Số tiền sẽ được trừ từ ví của bạn nếu thắng đấu giá
                                                </Text>
                                            </div>
                                        </Space>
                                    );
                                })()}
                            </Card>
                        )}

                        {/* Ended Auction Result */}
                        {!isActive && highestBid && (
                            <Card>
                                <div className="text-center">
                                    <TrophyOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                                    <Title level={4} className="mt-3">
                                        Người thắng đấu giá
                                    </Title>
                                    <Text strong className="text-lg">
                                        {highestBid.user?.fullName || 'Người dùng'}
                                    </Text>
                                    <div className="mt-3">
                                        <Text type="secondary">Giá thắng</Text>
                                        <div className="text-2xl font-bold text-red-500">
                                            {formatPrice(highestBid.bidAmount)}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AuctionDetail;
