import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    InputNumber,
    Empty,
    message,
    Spin,
    Typography,
    Space,
    Popconfirm,
    Divider,
    Image,
    Tag,
} from 'antd';
import {
    DeleteOutlined,
    ShoppingCartOutlined,
    MinusOutlined,
    PlusOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/cartAPI';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const CartPage = () => {
    const [loading, setLoading] = useState(false);
    const [cartData, setCartData] = useState(null);
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để xem giỏ hàng');
            navigate('/login');
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await cartAPI.getCart();
            if (response.success) {
                setCartData(response.data?.data || response.data);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            console.error('Fetch cart error:', error);
            message.error('Không thể tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(true);
        try {
            const response = await cartAPI.updateCartItem(cartItemId, newQuantity);
            if (response.success) {
                message.success('Cập nhật số lượng thành công');
                fetchCart();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            message.error('Không thể cập nhật số lượng');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        setUpdating(true);
        try {
            const response = await cartAPI.removeFromCart(cartItemId);
            if (response.success) {
                message.success('Đã xóa sản phẩm khỏi giỏ hàng');
                fetchCart();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            console.error('Remove item error:', error);
            message.error('Không thể xóa sản phẩm');
        } finally {
            setUpdating(false);
        }
    };

    const handleClearCart = async () => {
        setUpdating(true);
        try {
            const response = await cartAPI.clearCart();
            if (response.success) {
                message.success('Đã xóa toàn bộ giỏ hàng');
                fetchCart();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            console.error('Clear cart error:', error);
            message.error('Không thể xóa giỏ hàng');
        } finally {
            setUpdating(false);
        }
    };

    const handleCheckout = () => {
        if (!cartData?.cartItems || cartData.cartItems.length === 0) {
            message.warning('Giỏ hàng trống');
            return;
        }
        navigate('/checkout', { state: { cart: cartData } });
    };

    const calculateTotal = () => {
        if (!cartData?.cartItems) return 0;
        return cartData.cartItems.reduce((sum, item) => {
            const price = item.post?.price || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Đang tải giỏ hàng..." />
            </div>
        );
    }

    const cartItems = cartData?.cartItems || [];
    const isEmpty = cartItems.length === 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <Title level={2}>
                        <ShoppingCartOutlined className="mr-3" />
                        Giỏ Hàng Của Bạn
                    </Title>
                    <Text type="secondary">
                        {isEmpty ? 'Giỏ hàng trống' : `${cartItems.length} sản phẩm`}
                    </Text>
                </div>

                {isEmpty ? (
                    <Card>
                        <Empty
                            description="Giỏ hàng của bạn đang trống"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button
                                type="primary"
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/')}
                            >
                                Tiếp Tục Mua Sắm
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <Row gutter={[24, 24]}>
                        {/* Cart Items */}
                        <Col xs={24} lg={16}>
                            <Card
                                title={`Sản phẩm trong giỏ (${cartItems.length})`}
                                extra={
                                    <Popconfirm
                                        title="Xóa toàn bộ giỏ hàng?"
                                        description="Bạn có chắc muốn xóa tất cả sản phẩm?"
                                        onConfirm={handleClearCart}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button danger type="text" icon={<DeleteOutlined />}>
                                            Xóa tất cả
                                        </Button>
                                    </Popconfirm>
                                }
                            >
                                <Space direction="vertical" className="w-full" size="middle">
                                    {cartItems.map((item) => {
                                        const post = item.post;
                                        const vehicle = post?.vehicle;
                                        const battery = post?.battery;
                                        const images = post?.postImages || [];
                                        const firstImage = images[0]?.imageUrl || 'https://via.placeholder.com/150';
                                        const price = post?.price || 0;
                                        const quantity = item.quantity || 1;

                                        return (
                                            <Card key={item.cartItemId} className="shadow-sm">
                                                <Row gutter={[16, 16]} align="middle">
                                                    {/* Image */}
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

                                                    {/* Info */}
                                                    <Col xs={24} sm={10}>
                                                        <Space direction="vertical" size="small">
                                                            <Title level={5} className="!mb-0">
                                                                {post?.title || 'Không có tiêu đề'}
                                                            </Title>
                                                            <Text type="secondary">
                                                                {vehicle?.brandName || battery?.brandName || 'N/A'}
                                                            </Text>
                                                            {vehicle && (
                                                                <Tag color="blue">Xe điện</Tag>
                                                            )}
                                                            {battery && (
                                                                <Tag color="green">Pin xe điện</Tag>
                                                            )}
                                                            <Text strong className="text-lg text-blue-600">
                                                                {formatCurrency(price)}
                                                            </Text>
                                                        </Space>
                                                    </Col>

                                                    {/* Quantity & Actions */}
                                                    <Col xs={24} sm={8}>
                                                        <Space direction="vertical" className="w-full">
                                                            <Space>
                                                                <Button
                                                                    icon={<MinusOutlined />}
                                                                    size="small"
                                                                    onClick={() => handleUpdateQuantity(item.cartItemId, quantity - 1)}
                                                                    disabled={quantity <= 1 || updating}
                                                                />
                                                                <InputNumber
                                                                    min={1}
                                                                    value={quantity}
                                                                    onChange={(val) => handleUpdateQuantity(item.cartItemId, val)}
                                                                    disabled={updating}
                                                                    className="w-16"
                                                                />
                                                                <Button
                                                                    icon={<PlusOutlined />}
                                                                    size="small"
                                                                    onClick={() => handleUpdateQuantity(item.cartItemId, quantity + 1)}
                                                                    disabled={updating}
                                                                />
                                                            </Space>
                                                            <Text strong className="text-base">
                                                                Tổng: {formatCurrency(price * quantity)}
                                                            </Text>
                                                            <Popconfirm
                                                                title="Xóa sản phẩm?"
                                                                description="Bạn có chắc muốn xóa sản phẩm này?"
                                                                onConfirm={() => handleRemoveItem(item.cartItemId)}
                                                                okText="Xóa"
                                                                cancelText="Hủy"
                                                            >
                                                                <Button
                                                                    danger
                                                                    type="link"
                                                                    icon={<DeleteOutlined />}
                                                                    disabled={updating}
                                                                >
                                                                    Xóa
                                                                </Button>
                                                            </Popconfirm>
                                                        </Space>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        );
                                    })}
                                </Space>
                            </Card>
                        </Col>

                        {/* Summary */}
                        <Col xs={24} lg={8}>
                            <Card title="Tổng Đơn Hàng" className="sticky top-4">
                                <Space direction="vertical" className="w-full" size="middle">
                                    <div className="flex justify-between">
                                        <Text>Tạm tính:</Text>
                                        <Text strong>{formatCurrency(calculateTotal())}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Phí vận chuyển:</Text>
                                        <Text type="secondary">Miễn phí</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between">
                                        <Title level={4} className="!mb-0">Tổng cộng:</Title>
                                        <Title level={4} className="!mb-0 text-red-600">
                                            {formatCurrency(calculateTotal())}
                                        </Title>
                                    </div>
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        icon={<ShoppingOutlined />}
                                        onClick={handleCheckout}
                                        className="!h-12 !text-base font-semibold"
                                    >
                                        Tiến Hành Thanh Toán
                                    </Button>
                                    <Button
                                        block
                                        onClick={() => navigate('/')}
                                    >
                                        Tiếp Tục Mua Sắm
                                    </Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                )}
            </div>
        </div>
    );
};

export default CartPage;
