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
    Input,
} from 'antd';
import {
    ShoppingOutlined,
    ShopOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    TrophyOutlined,
    EditOutlined,
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
    const [auctionWins, setAuctionWins] = useState([]);
    const [activeTab, setActiveTab] = useState('purchases');
    const [receiverModalVisible, setReceiverModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [receiverForm, setReceiverForm] = useState({
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        note: ''
    });
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
                    setPurchases(response.data?.data || response.data || []);
                } else {
                    message.error(response.message);
                }
            } else if (activeTab === 'sales') {
                const response = await transactionAPI.getMySales();
                if (response.success) {
                    setSales(response.data?.data || response.data || []);
                } else {
                    message.error(response.message);
                }
            } else if (activeTab === 'auctionWins') {
                const response = await transactionAPI.getMyPurchases();
                if (response.success) {
                    const allPurchases = response.data?.data || response.data || [];
                    // Lọc các transaction từ đấu giá (paymentMethod === 'Wallet' và có source từ auction)
                    const wins = allPurchases.filter(tx =>
                        tx.paymentMethod === 'Wallet' || tx.PaymentMethod === 'Wallet'
                    );
                    setAuctionWins(wins);
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

    const showReceiverModal = (transaction) => {
        setSelectedTransaction(transaction);
        setReceiverForm({
            receiverName: transaction.receiverName || user?.fullName || '',
            receiverPhone: transaction.receiverPhone || user?.phoneNumber || '',
            receiverAddress: transaction.receiverAddress || '',
            note: transaction.note || ''
        });
        setReceiverModalVisible(true);
    };

    const handleUpdateReceiver = async () => {
        if (!selectedTransaction) return;

        if (!receiverForm.receiverName || !receiverForm.receiverPhone || !receiverForm.receiverAddress) {
            message.error('Vui lòng điền đầy đủ thông tin người nhận');
            return;
        }

        try {
            const response = await transactionAPI.updateDeliveryInfo(
                selectedTransaction.transactionId,
                receiverForm
            );

            if (response.success) {
                message.success('Cập nhật thông tin người nhận thành công');
                setReceiverModalVisible(false);
                fetchOrders();
            } else {
                message.error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Update receiver error:', error);
            message.error('Không thể cập nhật thông tin người nhận');
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
            Wallet: 'Ví EV Marketplace',
            BANKING: 'Chuyển khoản ngân hàng',
            COD: 'Thanh toán khi nhận hàng',
        };
        return methodMap[method] || method;
    };

    const AuctionWinCard = ({ order }) => {
        const resolvePostImage = (o) => {
            const candidates = [
                o.postImageUrl,
                o.PostImageUrl,
                o.imageUrl,
                o.ImageUrl,
                o.post?.postImages?.[0]?.imageUrl,
                o.post?.PostImages?.[0]?.ImageUrl,
                o.post?.postImages?.[0]?.ImageUrl,
            ];
            for (const url of candidates) {
                if (url) return url;
            }
            return 'https://via.placeholder.com/150';
        };

        const hasReceiverInfo = order.receiverName && order.receiverPhone && order.receiverAddress;

        return (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={6}>
                        <Image
                            src={resolvePostImage(order)}
                            alt={order.postTitle || order.PostTitle || 'Sản phẩm'}
                            style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: '8px' }}
                            fallback="https://via.placeholder.com/150"
                        />
                    </Col>
                    <Col xs={24} sm={18}>
                        <Space direction="vertical" className="w-full" size="middle">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrophyOutlined className="text-yellow-500 text-lg" />
                                    <Text strong className="text-lg">
                                        {order.postTitle || order.PostTitle || 'Đấu giá'}
                                    </Text>
                                </div>
                                <Text type="secondary" className="text-sm">
                                    Mã đơn: {order.transactionId?.substring(0, 8) || 'N/A'}
                                </Text>
                            </div>

                            <Divider className="my-2" />

                            <Row gutter={[16, 8]}>
                                <Col xs={24} sm={12}>
                                    <Text type="secondary" className="text-sm">Số tiền đã trả:</Text>
                                    <br />
                                    <Text strong className="text-lg text-red-600">
                                        {formatCurrency(order.amount || 0)}
                                    </Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Text type="secondary" className="text-sm">Trạng thái:</Text>
                                    <br />
                                    {getStatusTag(order.status)}
                                </Col>
                                {(order.commissionRate || order.CommissionRate) && (
                                    <>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" className="text-sm">Phí hoa hồng ({order.commissionRate || order.CommissionRate}%):</Text>
                                            <br />
                                            <Text className="text-orange-600">
                                                {formatCurrency(order.commissionAmount || order.CommissionAmount || 0)}
                                            </Text>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" className="text-sm">Người bán nhận:</Text>
                                            <br />
                                            <Text strong className="text-green-600">
                                                {formatCurrency((order.amount || 0) - (order.commissionAmount || order.CommissionAmount || 0))}
                                            </Text>
                                        </Col>
                                    </>
                                )}
                                {hasReceiverInfo && (
                                    <>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" className="text-sm">Người nhận:</Text>
                                            <br />
                                            <Text>{order.receiverName}</Text>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Text type="secondary" className="text-sm">SĐT:</Text>
                                            <br />
                                            <Text>{order.receiverPhone}</Text>
                                        </Col>
                                        <Col xs={24}>
                                            <Text type="secondary" className="text-sm">Địa chỉ:</Text>
                                            <br />
                                            <Text>{order.receiverAddress}</Text>
                                        </Col>
                                    </>
                                )}
                            </Row>

                            <Divider className="my-2" />

                            <Space>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => showOrderDetail(order)}
                                >
                                    Chi tiết
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => showReceiverModal(order)}
                                >
                                    {hasReceiverInfo ? 'Cập nhật thông tin nhận hàng' : 'Thêm thông tin nhận hàng'}
                                </Button>
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>
        );
    };

    const OrderCard = ({ order, isPurchase }) => {
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
                            className="rounded-lg object-cover"
                            width="100%"
                            height={120}
                            preview={false}
                        />
                    </Col>
                    <Col xs={24} sm={18}>
                        <Space direction="vertical" className="w-full" size="small">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Title level={5} className="!mb-1">
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
                                {isPurchase && ['COMPLETED', 'PAID'].includes(String(order.status || '').toUpperCase()) && (
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
                        {(selectedOrder.commissionRate || selectedOrder.CommissionRate) && (
                            <>
                                <br />
                                <Divider style={{ margin: '12px 0' }} />
                                <Space direction="vertical" size="small" className="w-full">
                                    <div>
                                        <Text type="secondary">Phí hoa hồng ({selectedOrder.commissionRate || selectedOrder.CommissionRate}%):</Text>
                                        {' '}
                                        <Text className="text-orange-600">
                                            {formatCurrency(selectedOrder.commissionAmount || selectedOrder.CommissionAmount || 0)}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Người bán nhận:</Text>
                                        {' '}
                                        <Text strong className="text-green-600">
                                            {formatCurrency((selectedOrder.amount || 0) - (selectedOrder.commissionAmount || selectedOrder.CommissionAmount || 0))}
                                        </Text>
                                    </div>
                                </Space>
                            </>
                        )}
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
                                        <Spin size="large" />
                                        <div className="mt-4 text-gray-500">Đang tải đơn hàng...</div>
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
                                        <Spin size="large" />
                                        <div className="mt-4 text-gray-500">Đang tải đơn hàng...</div>
                                    </div>
                                ) : sales.length === 0 ? (
                                    <Empty description="Chưa có đơn bán nào" />
                                ) : (
                                    sales.map((order) => (
                                        <OrderCard key={order.transactionId} order={order} isPurchase={false} />
                                    ))
                                )
                            },
                            {
                                key: 'auctionWins',
                                label: (
                                    <span>
                                        <TrophyOutlined />
                                        Đấu giá đã thắng ({auctionWins.length})
                                    </span>
                                ),
                                children: loading ? (
                                    <div className="text-center py-20">
                                        <Spin size="large" />
                                        <div className="mt-4 text-gray-500">Đang tải đơn hàng...</div>
                                    </div>
                                ) : auctionWins.length === 0 ? (
                                    <Empty description="Chưa có đơn thắng đấu giá nào" />
                                ) : (
                                    auctionWins.map((order) => (
                                        <AuctionWinCard key={order.transactionId} order={order} />
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

                {/* Modal cập nhật thông tin người nhận */}
                <Modal
                    title="Cập nhật thông tin người nhận"
                    open={receiverModalVisible}
                    onOk={handleUpdateReceiver}
                    onCancel={() => setReceiverModalVisible(false)}
                    okText="Cập nhật"
                    cancelText="Hủy"
                    width={600}
                >
                    <Space direction="vertical" className="w-full" size="large">
                        <div>
                            <Text strong>Tên người nhận <Text type="danger">*</Text></Text>
                            <Input
                                size="large"
                                placeholder="Nhập tên người nhận"
                                value={receiverForm.receiverName}
                                onChange={(e) => setReceiverForm({ ...receiverForm, receiverName: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text strong>Số điện thoại <Text type="danger">*</Text></Text>
                            <Input
                                size="large"
                                placeholder="Nhập số điện thoại"
                                value={receiverForm.receiverPhone}
                                onChange={(e) => setReceiverForm({ ...receiverForm, receiverPhone: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text strong>Địa chỉ nhận hàng <Text type="danger">*</Text></Text>
                            <Input.TextArea
                                rows={3}
                                placeholder="Nhập địa chỉ nhận hàng"
                                value={receiverForm.receiverAddress}
                                onChange={(e) => setReceiverForm({ ...receiverForm, receiverAddress: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text strong>Ghi chú</Text>
                            <Input.TextArea
                                rows={2}
                                placeholder="Ghi chú thêm (tùy chọn)"
                                value={receiverForm.note}
                                onChange={(e) => setReceiverForm({ ...receiverForm, note: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                    </Space>
                </Modal>
            </div>
        </div>
    );
};

export default OrdersPage;
