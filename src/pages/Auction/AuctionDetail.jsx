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
} from 'antd';
import {
    FireOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    TrophyOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { getAuctionById, placeBid } from '../../services/auctionAPI';
import authAPI from '../../services/authAPI';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const AuctionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const currentUserId = authAPI.getCurrentUserId();

    useEffect(() => {
        if (id) {
            fetchAuctionDetails();
            const interval = setInterval(fetchAuctionDetails, 10000);
            return () => clearInterval(interval);
        }
    }, [id]);

    const fetchAuctionDetails = async () => {
        try {
            const response = await getAuctionById(id);

            if (response.success && response.data) {
                const auctionData = response.data.data || response.data.Data || response.data;

                const normalized = {
                    auctionId: auctionData.auctionId || auctionData.AuctionId || id,
                    postId: auctionData.postId || auctionData.PostId,
                    startPrice: parseFloat(auctionData.startPrice || auctionData.StartPrice || 0),
                    currentPrice: parseFloat(auctionData.currentPrice || auctionData.CurrentPrice || auctionData.startPrice || auctionData.StartPrice || 0),
                    endTime: auctionData.endTime || auctionData.EndTime,
                    status: auctionData.status || auctionData.Status || 'Active',
                    winnerId: auctionData.winnerId || auctionData.WinnerId,
                    post: auctionData.post || auctionData.Post || {},
                    auctionBids: (auctionData.auctionBids || auctionData.AuctionBids || []).map(bid => ({
                        bidId: bid.bidId || bid.BidId,
                        auctionId: bid.auctionId || bid.AuctionId,
                        userId: bid.userId || bid.UserId,
                        bidAmount: parseFloat(bid.bidAmount || bid.BidAmount || 0),
                        bidTime: bid.bidTime || bid.BidTime,
                        user: bid.user || bid.User || {}
                    }))
                };

                setAuction(normalized);
                setBidAmount(normalized.currentPrice + 1000000);
            } else {
                toast.error('Không tìm thấy phiên đấu giá');
                navigate('/auction');
            }
        } catch (error) {
            toast.error('Không thể tải thông tin đấu giá');
            navigate('/auction');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!currentUserId) {
            toast.error('Vui lòng đăng nhập để đặt giá');
            navigate('/login');
            return;
        }

        const postOwnerId = auction.post?.userId || auction.post?.UserId;
        if (postOwnerId && String(postOwnerId) === String(currentUserId)) {
            toast.error('Bạn không thể đặt giá vào bài đăng của chính mình!');
            return;
        }

        if (bidAmount <= auction.currentPrice) {
            toast.error(`Giá đặt phải cao hơn giá hiện tại (${formatPrice(auction.currentPrice)})`);
            return;
        }

        setSubmitting(true);
        try {
            const response = await placeBid({
                auctionId: auction.auctionId,
                bidAmount: bidAmount,
            });

            if (response.success) {
                toast.success('Đặt giá thành công!');
                await fetchAuctionDetails();
            } else {
                toast.error(response.message || 'Đặt giá thất bại');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đặt giá thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
    };

    const parseEndTime = (dateString) => {
        if (!dateString) return new Date();
        const localDateString = dateString.replace('T', ' ');
        return new Date(localDateString);
    };

    const getPostImage = (post) => {
        if (!post) return '/images/placeholder.jpg';

        const images = post.postImages || post.PostImages;
        if (images && images.length > 0) {
            return images[0].imageUrl || images[0].ImageUrl || '/images/placeholder.jpg';
        }

        return '/images/placeholder.jpg';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large">
                    <div className="p-12">Đang tải thông tin đấu giá...</div>
                </Spin>
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

    const endTime = parseEndTime(auction.endTime);
    const isActive = auction.status === 'Active' && endTime > new Date();
    const sortedBids = [...auction.auctionBids].sort((a, b) => b.bidAmount - a.bidAmount);
    const highestBid = sortedBids[0] || null;
    const isOwnPost = auction.post?.userId && String(auction.post.userId) === String(currentUserId);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <Button onClick={() => navigate('/auction')} className="mb-4">
                    ← Quay lại danh sách
                </Button>

                <div className="mb-6">
                    <Title level={2}>
                        <FireOutlined className="text-red-500 mr-3" />
                        {auction.post?.title || auction.post?.Title || 'Chi tiết đấu giá'}
                    </Title>
                    <Tag color={isActive ? 'red' : 'gray'} className="text-base px-3 py-1">
                        {isActive ? 'Đang diễn ra' : 'Đã kết thúc'}
                    </Tag>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Column */}
                    <Col xs={24} lg={14}>
                        {/* Product Image */}
                        <Card>
                            <Image
                                src={getPostImage(auction.post)}
                                alt={auction.post?.title || 'Auction'}
                                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                                fallback="/images/placeholder.jpg"
                            />

                            <Divider />

                            <Title level={4}>Thông tin sản phẩm</Title>
                            <Paragraph>
                                {auction.post?.description || auction.post?.Description || 'Không có mô tả'}
                            </Paragraph>
                        </Card>

                        {/* Bid History */}
                        <Card title={<><HistoryOutlined className="mr-2" />Lịch sử đặt giá</>} className="mt-4">
                            {auction.auctionBids.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={sortedBids}
                                    renderItem={(bid, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        icon={<UserOutlined />}
                                                        style={{ backgroundColor: index === 0 ? '#52c41a' : '#1890ff' }}
                                                    />
                                                }
                                                title={
                                                    <Space>
                                                        <Text strong>
                                                            {bid.user?.fullName || bid.user?.FullName || bid.user?.email || 'Người dùng'}
                                                        </Text>
                                                        {index === 0 && (
                                                            <Tag color="green" icon={<TrophyOutlined />}>
                                                                Đang dẫn đầu
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                }
                                                description={formatDateTime(bid.bidTime)}
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

                    {/* Right Column */}
                    <Col xs={24} lg={10}>
                        {/* Countdown */}
                        <Card className="mb-4">
                            {isActive ? (
                                <Statistic.Countdown
                                    title={
                                        <Title level={4}>
                                            <ClockCircleOutlined className="mr-2" />
                                            Thời gian còn lại
                                        </Title>
                                    }
                                    value={endTime.getTime()}
                                    format="D ngày H giờ m phút s giây"
                                    valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                                />
                            ) : (
                                <div className="text-center">
                                    <Title level={4} type="secondary">
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
                                <Divider style={{ margin: 0 }} />
                                <div>
                                    <Text type="secondary">Giá hiện tại</Text>
                                    <div className="text-3xl font-bold text-red-500">
                                        {formatPrice(auction.currentPrice)}
                                    </div>
                                </div>
                                {highestBid && (
                                    <>
                                        <Divider style={{ margin: 0 }} />
                                        <div>
                                            <Text type="secondary">
                                                <TrophyOutlined className="mr-2" />
                                                Người đang dẫn đầu
                                            </Text>
                                            <div className="mt-2">
                                                <Tag color="green" className="text-base px-3 py-1">
                                                    {highestBid.user?.fullName || highestBid.user?.FullName || 'Người dùng'}
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
                                {isOwnPost ? (
                                    <div className="text-center py-4">
                                        <Text type="secondary">
                                            Bạn không thể đặt giá vào bài đăng của chính mình
                                        </Text>
                                    </div>
                                ) : (
                                    <Space direction="vertical" className="w-full" size="large">
                                        <div>
                                            <Text type="secondary" className="block mb-2">
                                                Số tiền đặt giá (VNĐ)
                                            </Text>
                                            <InputNumber
                                                value={bidAmount}
                                                onChange={setBidAmount}
                                                min={auction.currentPrice + 1000}
                                                step={100000}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                style={{ width: '100%' }}
                                                size="large"
                                            />
                                            <Text type="secondary" className="block mt-2">
                                                Tối thiểu: {formatPrice(auction.currentPrice + 1000)}
                                            </Text>
                                        </div>

                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            icon={<FireOutlined />}
                                            onClick={handlePlaceBid}
                                            loading={submitting}
                                            disabled={!currentUserId}
                                        >
                                            {!currentUserId ? 'Vui lòng đăng nhập' : 'Đặt giá ngay'}
                                        </Button>

                                        {!currentUserId && (
                                            <Button
                                                size="large"
                                                block
                                                onClick={() => navigate('/login')}
                                            >
                                                Đăng nhập để đặt giá
                                            </Button>
                                        )}
                                    </Space>
                                )}
                            </Card>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AuctionDetail;
