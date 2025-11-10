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

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const OrdersPage = () => {
    const [loading, setLoading] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('purchases');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const { user } = useAuth();

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
            } else {
                const response = await transactionAPI.getMySales();
                if (response.success) {
                    setSales(response.data?.data || response.data || []);
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
        // Backend transaction DTO returns flat fields (postTitle, postImageUrl, amount, etc.)
        const firstImage = order.postImageUrl || 'https://via.placeholder.com/100';

        return (
            <Card className="mb-4 shadow-sm hover:shadow-md transition">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={6}>
                        <Image
                            src={firstImage}
                            alt={post?.title}
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
                                        {isPurchase
                                            ? order.sellerName || 'N/A'
                                            : order.buyerName || 'N/A'}
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
                        <Text type="secondary">{selectedOrder.postDescription || selectedOrder.note || 'Không có mô tả'}</Text>
                        <br />
                        <Text strong className="text-lg text-red-600">
                            {formatCurrency(selectedOrder.amount || 0)}
                        </Text>
                    </Card>

                    <Card size="small" title="Thông tin người nhận">
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <Text type="secondary">Tên:</Text>
                                <br />
                                <Text strong>{selectedOrder.receiverName || selectedOrder.buyerName}</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">SĐT:</Text>
                                <br />
                                <Text strong>{selectedOrder.receiverPhone}</Text>
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Địa chỉ:</Text>
                                <br />
                                <Text strong>{selectedOrder.receiverAddress}</Text>
                            </Col>
                        </Row>
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
                    Quản Lý Đơn Hàng
                </Title>

                <Card>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane
                            tab={
                                <span>
                                    <ShoppingOutlined />
                                    Đơn Mua ({purchases.length})
                                </span>
                            }
                            key="purchases"
                        >
                            {loading ? (
                                <div className="text-center py-20">
                                    <Spin size="large" tip="Đang tải đơn hàng..." />
                                </div>
                            ) : purchases.length === 0 ? (
                                <Empty description="Chưa có đơn mua nào" />
                            ) : (
                                purchases.map((order) => (
                                    <OrderCard key={order.transactionId} order={order} isPurchase={true} />
                                ))
                            )}
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <ShopOutlined />
                                    Đơn Bán ({sales.length})
                                </span>
                            }
                            key="sales"
                        >
                            {loading ? (
                                <div className="text-center py-20">
                                    <Spin size="large" tip="Đang tải đơn hàng..." />
                                </div>
                            ) : sales.length === 0 ? (
                                <Empty description="Chưa có đơn bán nào" />
                            ) : (
                                sales.map((order) => (
                                    <OrderCard key={order.transactionId} order={order} isPurchase={false} />
                                ))
                            )}
                        </TabPane>
                    </Tabs>
                </Card>

                <OrderDetailModal />
            </div>
        </div>
    );
};

export default OrdersPage;
