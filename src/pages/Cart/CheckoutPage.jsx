import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Form,
    Input,
    Radio,
    message,
    Typography,
    Space,
    Divider,
    Steps,
    Result,
    Modal,
} from 'antd';
import {
    ShoppingOutlined,
    CreditCardOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    WalletOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { transactionAPI } from '../../services/transactionAPI';
import { walletAPI } from '../../services/walletAPI';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('WALLET');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [pendingFormValues, setPendingFormValues] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Lấy dữ liệu giỏ hàng hoặc đơn lẻ
    const cart = location.state?.cart;
    const singlePost = location.state?.post;

    // Tính tổng tiền
    const calculateTotal = () => {
        if (cart) {
            return cart.cartItems?.reduce((sum, item) => {
                const price = item.post?.price || 0;
                const quantity = item.quantity || 1;
                return sum + (price * quantity);
            }, 0) || 0;
        } else if (singlePost) {
            return singlePost.price || 0;
        }
        return 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Load wallet balance
    React.useEffect(() => {
        const fetchWalletBalance = async () => {
            try {
                const response = await walletAPI.getBalance();
                if (response.success) {
                    setWalletBalance(response.data.balance || 0);
                }
            } catch (error) {
                console.error('Fetch wallet balance error:', error);
            }
        };

        if (user) {
            fetchWalletBalance();
        }
    }, [user]);

    // Hàm xử lý thanh toán thực tế
    const processPayment = async (values) => {
        setLoading(true);
        try {
            let response;

            if (cart) {
                response = await transactionAPI.createCartTransaction({
                    cartId: cart.cartId,
                    paymentMethod: paymentMethod,
                    receiverName: values.receiverName,
                    receiverPhone: values.receiverPhone,
                    receiverAddress: values.receiverAddress,
                    note: values.note || '',
                });
            } else if (singlePost) {
                response = await transactionAPI.createTransaction({
                    postId: singlePost.postId || singlePost.id,
                    paymentMethod: paymentMethod,
                    receiverName: values.receiverName,
                    receiverPhone: values.receiverPhone,
                    receiverAddress: values.receiverAddress,
                    note: values.note || '',
                });
            }

            if (response.success) {
                message.success(response.message);
                setOrderSuccess(true);
                setOrderId(response.data?.transactionId || response.data?.data?.transactionId);
                setCurrentStep(2);
            } else {
                Modal.error({
                    title: 'Thanh toán thất bại',
                    content: response.message || 'Đã có lỗi xảy ra trong quá trình thanh toán.',
                    okText: 'Đã hiểu',
                });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            Modal.error({
                title: 'Thanh toán thất bại',
                content: error.response?.data?.message || error.message || 'Đặt hàng thất bại. Vui lòng thử lại!',
                okText: 'Đã hiểu',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        // Nếu chọn WALLET, hiện modal xác nhận
        if (paymentMethod === 'WALLET') {
            setPendingFormValues(values);
            setIsConfirmModalVisible(true);
        } else {
            // Các phương thức khác thanh toán trực tiếp
            await processPayment(values);
        }
    };

    const handleConfirmPayment = async () => {
        setIsConfirmModalVisible(false);
        await processPayment(pendingFormValues);
    };

    const handleCancelPayment = () => {
        setIsConfirmModalVisible(false);
        setPendingFormValues(null);
    };

    const steps = [
        {
            title: 'Thông tin',
            icon: <EnvironmentOutlined />,
        },
        {
            title: 'Thanh toán',
            icon: <CreditCardOutlined />,
        },
        {
            title: 'Hoàn tất',
            icon: <CheckCircleOutlined />,
        },
    ];

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Result
                        status="success"
                        title="Đặt Hàng Thành Công!"
                        subTitle={`Mã đơn hàng: ${orderId || 'N/A'}. Chúng tôi sẽ liên hệ với bạn sớm nhất.`}
                        extra={[
                                    <Button type="primary" key="orders" onClick={() => navigate('/orders')}>
                                        Xem Đơn Hàng
                                    </Button>,
                                    <Button key="home" onClick={() => navigate('/')}>
                                        Về Trang Chủ
                                    </Button>,
                                ]}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <Title level={2}>
                        <ShoppingOutlined className="mr-3" />
                        Thanh Toán
                    </Title>
                </div>

                {/* Steps */}
                <Card className="mb-6">
                    <Steps current={currentStep} items={steps} />
                </Card>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        receiverName: user?.fullName || user?.userName || '',
                        receiverPhone: user?.phoneNumber || '',
                    }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Form Section */}
                        <Col xs={24} lg={14}>
                            {/* Shipping Info */}
                            <Card title="Thông Tin Nhận Hàng" className="mb-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Họ và Tên"
                                            name="receiverName"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập họ tên' },
                                                { max: 100, message: 'Tối đa 100 ký tự' },
                                            ]}
                                        >
                                            <Input size="large" placeholder="Nguyễn Văn A" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Số Điện Thoại"
                                            name="receiverPhone"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
                                            ]}
                                        >
                                            <Input size="large" placeholder="0987654321" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    label="Địa Chỉ Nhận Hàng"
                                    name="receiverAddress"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập địa chỉ' },
                                        { max: 255, message: 'Tối đa 255 ký tự' },
                                    ]}
                                >
                                    <Input size="large" placeholder="Số nhà, đường, phường, quận, thành phố" />
                                </Form.Item>
                                <Form.Item label="Ghi Chú" name="note">
                                    <TextArea
                                        rows={3}
                                        placeholder="Ghi chú cho người bán (tùy chọn)"
                                        maxLength={500}
                                    />
                                </Form.Item>
                            </Card>

                            {/* Payment Method */}
                            <Card title="Phương Thức Thanh Toán">
                                <Radio.Group
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full"
                                >
                                    <Space direction="vertical" className="w-full" size="middle">
                                        <Card
                                            hoverable
                                            className={paymentMethod === 'WALLET' ? 'border-blue-500 border-2' : ''}
                                        >
                                            <Radio value="WALLET">
                                                <Space>
                                                    <WalletOutlined className="text-xl text-blue-600" />
                                                    <div>
                                                        <Text strong>Ví EV Marketplace</Text>
                                                        <br />
                                                        <Text type="secondary" className="text-sm">
                                                            Thanh toán nhanh chóng bằng số dư ví
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>
                                        <Card
                                            hoverable
                                            className={paymentMethod === 'VNPAY' ? 'border-blue-500 border-2' : ''}
                                        >
                                            <Radio value="VNPAY">
                                                <Space>
                                                    <CreditCardOutlined className="text-xl text-purple-600" />
                                                    <div>
                                                        <Text strong>VNPay</Text>
                                                        <br />
                                                        <Text type="secondary" className="text-sm">
                                                            Thanh toán qua VNPay, an toàn và tiện lợi
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>
                                        <Card
                                            hoverable
                                            className={paymentMethod === 'BANK_TRANSFER' ? 'border-blue-500 border-2' : ''}
                                        >
                                            <Radio value="BANK_TRANSFER">
                                                <Space>
                                                    <CreditCardOutlined className="text-xl text-green-600" />
                                                    <div>
                                                        <Text strong>Chuyển Khoản Ngân Hàng</Text>
                                                        <br />
                                                        <Text type="secondary" className="text-sm">
                                                            Chuyển khoản trực tiếp qua ngân hàng
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>
                                        <Card
                                            hoverable
                                            className={paymentMethod === 'COD' ? 'border-blue-500 border-2' : ''}
                                        >
                                            <Radio value="COD">
                                                <Space>
                                                    <ShoppingOutlined className="text-xl text-orange-600" />
                                                    <div>
                                                        <Text strong>Thanh Toán Khi Nhận Hàng (COD)</Text>
                                                        <br />
                                                        <Text type="secondary" className="text-sm">
                                                            Thanh toán trực tiếp cho người bán
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Radio>
                                        </Card>
                                    </Space>
                                </Radio.Group>
                            </Card>
                        </Col>

                        {/* Order Summary */}
                        <Col xs={24} lg={10}>
                            <Card title="Tóm Tắt Đơn Hàng" className="sticky top-4">
                                <Space direction="vertical" className="w-full" size="middle">
                                    {/* Items */}
                                    {cart ? (
                                        cart.cartItems?.map((item) => {
                                            const post = item.post;
                                            const price = post?.price || 0;
                                            const quantity = item.quantity || 1;
                                            return (
                                                <div key={item.cartItemId}>
                                                    <div className="flex justify-between">
                                                        <Text>
                                                            {post?.title || 'Sản phẩm'}
                                                            <Text type="secondary"> x{quantity}</Text>
                                                        </Text>
                                                        <Text strong>{formatCurrency(price * quantity)}</Text>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : singlePost ? (
                                        <div className="flex justify-between">
                                            <Text>{singlePost.title || 'Sản phẩm'}</Text>
                                            <Text strong>{formatCurrency(singlePost.price)}</Text>
                                        </div>
                                    ) : null}

                                    <Divider className="my-2" />

                                    <div className="flex justify-between">
                                        <Text>Tạm tính:</Text>
                                        <Text strong>{formatCurrency(calculateTotal())}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Phí vận chuyển:</Text>
                                        <Text type="secondary">Miễn phí</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Phí giao dịch:</Text>
                                        <Text type="secondary">0đ</Text>
                                    </div>

                                    <Divider className="my-2" />

                                    <div className="flex justify-between">
                                        <Title level={4} className="!mb-0">
                                            Tổng cộng:
                                        </Title>
                                        <Title level={4} className="!mb-0 text-red-600">
                                            {formatCurrency(calculateTotal())}
                                        </Title>
                                    </div>

                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<CheckCircleOutlined />}
                                        className="!h-12 !text-base font-semibold"
                                    >
                                        Đặt Hàng
                                    </Button>

                                    <Button block onClick={() => navigate(-1)} className="mt-3">
                                        Quay Lại
                                    </Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Form>

                {/* Modal xác nhận thanh toán WALLET */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                            <span>Xác nhận thanh toán</span>
                        </div>
                    }
                    open={isConfirmModalVisible}
                    onOk={handleConfirmPayment}
                    onCancel={handleCancelPayment}
                    okText="Xác nhận thanh toán"
                    cancelText="Hủy"
                    okButtonProps={{
                        disabled: walletBalance < calculateTotal(),
                        loading: loading,
                    }}
                    centered
                    width={500}
                >
                    <div>
                        <p>Bạn có chắc chắn muốn thanh toán đơn hàng này?</p>
                        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Số dư ví hiện tại:</span>
                                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{formatCurrency(walletBalance)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Số tiền cần thanh toán:</span>
                                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>{formatCurrency(calculateTotal())}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #d9d9d9', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Số dư còn lại:</span>
                                <span style={{ fontWeight: 'bold', color: walletBalance - calculateTotal() >= 0 ? '#1890ff' : '#ff4d4f' }}>
                                    {formatCurrency(walletBalance - calculateTotal())}
                                </span>
                            </div>
                        </div>
                        {walletBalance < calculateTotal() && (
                            <div style={{ marginTop: '12px', color: '#ff4d4f', fontWeight: 500 }}>
                                ⚠️ Số dư không đủ. Cần thêm {formatCurrency(calculateTotal() - walletBalance)} nữa.
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default CheckoutPage;
