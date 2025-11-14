import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Tabs,
    Empty,
    Spin,
    message,
    Typography,
    Tag,
    Button,
    Space,
    Image,
    Divider,
    Popconfirm,
    Modal,
} from 'antd';
import {
    ShoppingOutlined,
    ShopOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { transactionAPI } from '../../services/transactionAPI';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from '../../components/ReviewForm';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const OrdersPage = () => {
    const [loading, setLoading] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('purchases');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewSellerId, setReviewSellerId] = useState(null);
    const [reviewPostId, setReviewPostId] = useState(null);
    const [reviewTransactionId, setReviewTransactionId] = useState(null);
    const [reviewedTransactions, setReviewedTransactions] = useState(new Set());
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            if (activeTab === 'purchases') {
                const response = await transactionAPI.getMyPurchases();
                if (response.success) {
                    const orders = response.data?.data || response.data || [];
                    console.log('[OrdersPage] Fetched purchases:', orders);
                    setPurchases(orders);
                } else {
                    message.error(response.message);
                }
            } else {
                const response = await transactionAPI.getMySales();
                if (response.success) {
                    const orders = response.data?.data || response.data || [];
                    console.log('[OrdersPage] Fetched sales:', orders);
                    setSales(orders);
                } else {
                    message.error(response.message);
                }
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const response = await transactionAPI.cancelTransaction(orderId);
            if (response.success) {
                message.success('Đã hủy đơn hàng thành công');
                fetchOrders();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            message.error('Không thể hủy đơn hàng');
        }
    };

    const showOrderDetail = (order) => {
        setSelectedOrder(order);
        setDetailVisible(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getStatusTag = (status) => {
        const statusMap = {
            PENDING: { color: 'gold', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
            PROCESSING: { color: 'blue', text: 'Đang xử lý', icon: <ClockCircleOutlined /> },
            COMPLETED: { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
            CANCELLED: { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
            FAILED: { color: 'red', text: 'Thất bại', icon: <CloseCircleOutlined /> },
        };

        const statusInfo = statusMap[status] || { color: 'default', text: status, icon: null };
        return (
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
                {statusInfo.text}
            </Tag>
        );
    };

    const getPaymentMethodText = (method) => {
        const methodMap = {
            WALLET: 'Ví EV Marketplace',
            BANKING: 'Chuyển khoản ngân hàng',
            COD: 'Thanh toán khi nhận hàng',
        };
        return methodMap[method] || method;
    };

    const OrderCard = ({ order, isPurchase }) => {
        // Helper to extract postId from postImageUrl if postId is not provided
        const getPostId = (o) => {
            // Try direct fields first
            if (o.postId || o.PostId) {
                console.log('[OrdersPage] Found postId directly:', o.postId || o.PostId);
                return o.postId || o.PostId;
            }
            if (o.post?.postId || o.post?.id) {
                console.log('[OrdersPage] Found postId in post object:', o.post.postId || o.post.id);
                return o.post.postId || o.post.id;
            }
            
            // Cannot reliably extract postId from Firebase URL
            // Backend needs to include PostId in transaction response
            console.error('[OrdersPage] PostId not found in transaction response. Backend needs to add PostId field.');
            console.log('[OrdersPage] Order object:', o);
            return null;
        };
        
        // Resolve image and seller name defensively because backend DTOs vary.
        const resolvePostImage = (o) => {
            const candidates = [
                o.postImageUrl,
                o.PostImageUrl,
                o.imageUrl,
                o.ImageUrl,
                o.image,
                o.post?.imageUrl,
                o.post?.image,
                o.post?.postImages?.[0]?.imageUrl,
                o.post?.postImages?.[0]?.ImageUrl,
                o.postImages?.[0]?.imageUrl,
                o.postImages?.[0]?.ImageUrl,
                o.post?.images?.[0]?.url,
                o.post?.images?.[0]?.src,
            ];
            return candidates.find((c) => !!c) || 'https://via.placeholder.com/150';
        };

        const resolveSellerName = (o) => {
            const s = o.seller || o.sellerInfo || o.sellerUser || o.user || o.buyer || null;
            return (
                o.sellerName ||
                o.SellerName ||
                o.seller?.fullName ||
                o.seller?.name ||
                o.seller?.username ||
                o.seller?.displayName ||
                o.seller?.user?.fullName ||
                o.seller?.user?.name ||
                s?.fullName ||
                s?.name ||
                s?.username ||
                'N/A'
            );
        };

        const firstImage = resolvePostImage(order);
        const sellerDisplay = resolveSellerName(order);

        return (
            <Card className="mb-4 shadow-sm hover:shadow-md transition">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={6}>
                        <Image
                            src={firstImage}
                            alt={order.postTitle || 'product image'}
                            className="rounded-lg object-cover cursor-pointer"
                            width="100%"
                            height={120}
                            preview={false}
                            onClick={() => {
                                const postId = getPostId(order);
                                if (postId) {
                                    navigate(`/post/${postId}`);
                                } else {
                                    message.error('Backend chưa trả về PostId. Vui lòng liên hệ admin để sửa API.');
                                }
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={18}>
                        <Space direction="vertical" className="w-full" size="small">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Title 
                                        level={5} 
                                        className="!mb-1 cursor-pointer hover:text-blue-600"
                                        onClick={() => {
                                            const postId = getPostId(order);
                                            if (postId) {
                                                navigate(`/post/${postId}`);
                                            } else {
                                                message.error('Backend chưa trả về PostId. Vui lòng liên hệ admin để sửa API.');
                                            }
                                        }}
                                    >
                                        {order.postTitle || 'Không có tiêu đề'}
                                    </Title>
                                    <Text type="secondary" className="text-sm">
                                        Mã đơn: {order.transactionId?.substring(0, 8)}...
                                    </Text>
                                </div>
                                {getStatusTag(order.status)}
                            </div>

                            <Divider className="my-2" />

                            <Row gutter={[16, 8]}>
                                <Col xs={24} sm={12}>
                                    <Text type="secondary" className="text-sm">
                                        {isPurchase ? 'Người bán:' : 'Người mua:'}
                                    </Text>
                                    <br />
                                    <Text strong>
                                        {isPurchase ? sellerDisplay : (order.buyerName || 'N/A')}
                                    </Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text type="secondary" className="text-sm">
                                        Phương thức thanh toán:
                                    </Text>
                                    <br />
                                    <Text>{getPaymentMethodText(order.paymentMethod)}</Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text type="secondary" className="text-sm">
                                        Tổng tiền:
                                    </Text>
                                    <br />
                                    <Text strong className="text-lg text-red-600">
                                        {formatCurrency(order.amount || 0)}
                                    </Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text type="secondary" className="text-sm">
                                        Ngày đặt:
                                    </Text>
                                    <br />
                                    <Text>
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </Text>
                                </Col>
                            </Row>

                            <Divider className="my-2" />

                            <Space>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => showOrderDetail(order)}
                                >
                                    Chi tiết
                                </Button>
                                {isPurchase && String(order.status || '').toUpperCase() === 'COMPLETED' && (
                                    <>
                                        {reviewedTransactions.has(order.transactionId) ? (
                                            <Button disabled>
                                                Đã đánh giá
                                            </Button>
                                        ) : (
                                            <Button type="primary" onClick={() => {
                                                const sellerId = order.sellerId || order.seller?.userId || order.seller?.id || order.sellerId;
                                                const postId = order.postId || order.post?.postId || order.postId;
                                                const txId = order.transactionId || order.TransactionId || order.transactionId;
                                                setReviewSellerId(sellerId);
                                                setReviewPostId(postId);
                                                setReviewTransactionId(txId);
                                                setReviewModalOpen(true);
                                            }}>
                                                Gửi đánh giá
                                            </Button>
                                        )}
                                    </>
                                )}
                                {isPurchase && order.status === 'PENDING' && (
                                    <Popconfirm
                                        title="Hủy đơn hàng?"
                                        description="Bạn có chắc muốn hủy đơn hàng này?"
                                        onConfirm={() => handleCancelOrder(order.transactionId)}
                                        okText="Hủy đơn"
                                        cancelText="Không"
                                    >
                                        <Button danger>Hủy đơn hàng</Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>
        );
    };

    const OrderDetailModal = () => {
        if (!selectedOrder) return null;

        const post = selectedOrder.post;

        return (
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder.transactionId?.substring(0, 8)}`}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                <Space direction="vertical" className="w-full" size="middle">
                    <Card size="small" title="Thông tin sản phẩm">
                        <Text strong>{selectedOrder.postTitle || 'N/A'}</Text>
                        <br />
                        <Text type="secondary">{selectedOrder.transactionId}</Text>
                        <br />
                        <Text strong className="text-lg text-red-600">
                            {formatCurrency(selectedOrder.amount || 0)}
                        </Text>
                    </Card>



                    <Card size="small" title="Thông tin giao dịch">
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <Text type="secondary">Trạng thái:</Text>
                                <br />
                                {getStatusTag(selectedOrder.status)}
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Thanh toán:</Text>
                                <br />
                                <Text>{getPaymentMethodText(selectedOrder.paymentMethod)}</Text>
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Ghi chú:</Text>
                                <br />
                                <Text>{selectedOrder.note || 'Không có ghi chú'}</Text>
                            </Col>
                        </Row>
                    </Card>
                </Space>
            </Modal>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Title level={2} className="mb-6">
                    Đơn Hàng Đã Mua
                </Title>

                <Card>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'purchases',
                                label: (
                                    <span>
                                        <ShoppingOutlined />
                                        Đơn Đã Mua ({purchases.length})
                                    </span>
                                ),
                                children: loading ? (
                                    <div className="text-center py-20">
                                        <Spin size="large" tip="Đang tải đơn hàng..." />
                                    </div>
                                ) : purchases.length === 0 ? (
                                    <Empty description="Chưa có đơn mua nào" />
                                ) : (
                                    purchases.map((order) => (
                                        <OrderCard key={order.transactionId} order={order} isPurchase={true} />
                                    ))
                                )
                            },
                            {
                                key: 'sales',
                                label: (
                                    <span>
                                        <ShopOutlined />
                                        Đơn Bán ({sales.length})
                                    </span>
                                ),
                                children: loading ? (
                                    <div className="text-center py-20">
                                        <Spin size="large" tip="Đang tải đơn hàng..." />
                                    </div>
                                ) : sales.length === 0 ? (
                                    <Empty description="Chưa có đơn bán nào" />
                                ) : (
                                    sales.map((order) => (
                                        <OrderCard key={order.transactionId} order={order} isPurchase={false} />
                                    ))
                                )
                            }
                        ]}
                    />
                </Card>

                <OrderDetailModal />
                <ReviewForm
                    open={reviewModalOpen}
                    sellerId={reviewSellerId}
                    postId={reviewPostId}
                    transactionIdFromOrder={reviewTransactionId}
                    onClose={() => setReviewModalOpen(false)}
                    onSubmitted={async (info) => {
                        console.log('[OrdersPage] onSubmitted received', info);

                        // Đánh dấu transaction này đã được review
                        if (info?.transactionId || reviewTransactionId) {
                            const txId = info?.transactionId || reviewTransactionId;
                            setReviewedTransactions(prev => new Set([...prev, txId]));
                        }

                        // refresh orders and close modal after submitting review
                        fetchOrders();
                        console.log('[OrdersPage] fetchOrders called');
                        setReviewModalOpen(false);
                        setReviewTransactionId(null);

                        // If parent was given a postId, navigate to the post detail page.
                        // If postId is missing, try to resolve it from the transaction id returned by the child.
                        try {
                            let pid = info?.postId;
                            if (!pid && info?.transactionId) {
                                console.log('[OrdersPage] postId missing, attempting to fetch transaction to resolve postId', info.transactionId);
                                try {
                                    const txResp = await transactionAPI.getTransactionById(info.transactionId);
                                    // transactionAPI returns { success, data }
                                    const tx = txResp?.data || txResp?.data?.data || txResp;
                                    pid = tx?.postId || tx?.PostId || tx?.post?.postId || tx?.post?.id || tx?.post?._id || tx?.postId;
                                    console.log('[OrdersPage] resolved postId from transaction:', pid);
                                } catch (err) {
                                    console.error('[OrdersPage] error fetching transaction to resolve postId', err);
                                }
                            }

                            console.log('[OrdersPage] navigating to post', pid);
                            if (pid) {
                                navigate(`/post/${pid}`);
                                console.log('[OrdersPage] navigate called');
                            }
                        } catch (e) { console.error('[OrdersPage] navigation error', e); }
                    }}
                />
            </div>
        </div>
    );
};

export default OrdersPage;
