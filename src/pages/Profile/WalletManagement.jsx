import React, { useState, useEffect } from 'react';
import {
    WalletOutlined,
    PlusOutlined,
    SendOutlined,
    DownloadOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ReloadOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Card,
    Row,
    Col,
    Statistic,
    Button,
    Table,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    Typography,
    Space,
    Divider,
    Alert
} from 'antd';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const WalletManagement = () => {
    const { user, verifyOTP, resendOTP, createWallet } = useAuth();
    const [walletBalance, setWalletBalance] = useState(2500000); // Mock data
    const [loading, setLoading] = useState(false);
    const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [isAccountActive, setIsAccountActive] = useState(true);
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const [depositForm] = Form.useForm();
    const [withdrawForm] = Form.useForm();
    const [transferForm] = Form.useForm();
    const [otpForm] = Form.useForm();

    // Mock transaction history
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            type: 'deposit',
            amount: 500000,
            description: 'Nạp tiền vào ví',
            date: '2024-01-15 14:30:00',
            status: 'completed'
        },
        {
            id: 2,
            type: 'withdraw',
            amount: -200000,
            description: 'Rút tiền về ngân hàng',
            date: '2024-01-14 10:15:00',
            status: 'completed'
        },
        {
            id: 3,
            type: 'transfer',
            amount: -100000,
            description: 'Chuyển tiền cho user123',
            date: '2024-01-13 16:45:00',
            status: 'pending'
        },
        {
            id: 4,
            type: 'auction_win',
            amount: -800000,
            description: 'Thanh toán đấu giá xe ABC',
            date: '2024-01-12 09:20:00',
            status: 'completed'
        },
        {
            id: 5,
            type: 'auction_refund',
            amount: 300000,
            description: 'Hoàn tiền đấu giá XYZ',
            date: '2024-01-11 11:30:00',
            status: 'completed'
        }
    ]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // useEffect để kiểm tra trạng thái active của user
    useEffect(() => {
        if (user) {
            // Kiểm tra trạng thái isActive từ thông tin user đã đăng nhập
            setIsAccountActive(user.isActive === true);
        }
    }, [user]);

    // useEffect để quản lý đếm ngược
    useEffect(() => {
        let interval = null;
        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown(countdown => countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [countdown]);

    // Hàm bắt đầu đếm ngược
    const startCountdown = () => {
        setCountdown(300);
        setCanResend(false);
    };

    // Hàm xử lý xác thực OTP
    const handleVerifyOTP = async (values) => {
        setLoading(true);
        try {
            const result = await verifyOTP(user.email, values.otp);

            if (result.success) {
                toast.success("Xác thực tài khoản thành công!");

                // Cập nhật user state để phản ánh trạng thái active
                const updatedUser = { ...user, isActive: true };
                localStorage.setItem('user', JSON.stringify({
                    id: updatedUser.id,
                    fullName: updatedUser.fullName,
                    email: updatedUser.email,
                    isActive: true
                }));

                // Tự động tạo ví sau khi xác thực thành công
                try {
                    const walletResult = await createWallet();
                    if (walletResult.success) {
                        toast.success("Ví của bạn đã được tạo thành công!");
                        setIsAccountActive(true);
                        setIsOtpModalVisible(false);
                        // Reload page để cập nhật giao diện
                        window.location.reload();
                    } else {
                        toast.warning("Tài khoản đã được kích hoạt nhưng không thể tạo ví. Vui lòng thử lại.");
                        setIsAccountActive(true);
                        setIsOtpModalVisible(false);
                        // Reload page để cập nhật giao diện
                        window.location.reload();
                    }
                } catch (walletError) {
                    console.error("Lỗi tạo ví:", walletError);
                    toast.warning("Tài khoản đã được kích hoạt nhưng không thể tạo ví. Vui lòng thử lại.");
                    setIsAccountActive(true);
                    setIsOtpModalVisible(false);
                    // Reload page để cập nhật giao diện
                    window.location.reload();
                }
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi xác thực OTP!");
        } finally {
            setLoading(false);
        }
    };

    // Hàm gửi lại OTP
    const handleResendOTP = async () => {
        if (!canResend) {
            toast.warning(`Vui lòng đợi ${countdown} giây trước khi gửi lại OTP!`);
            return;
        }

        setLoading(true);
        try {
            const result = await resendOTP(user.email);

            if (result.success) {
                toast.success(result.message);
                startCountdown();
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Không thể gửi lại OTP!");
        } finally {
            setLoading(false);
        }
    };

    // Hàm mở modal OTP - CHỈ MỞ MODAL, KHÔNG GỬI OTP
    const showOtpModal = () => {
        setIsOtpModalVisible(true);
        // Không gửi OTP tự động, người dùng phải bấm "Gửi lại mã" nếu cần
    };

    const getTransactionTypeColor = (type) => {
        const colors = {
            deposit: 'green',
            withdraw: 'red',
            transfer: 'blue',
            auction_win: 'orange',
            auction_refund: 'cyan'
        };
        return colors[type] || 'default';
    };

    const getTransactionTypeName = (type) => {
        const names = {
            deposit: 'Nạp tiền',
            withdraw: 'Rút tiền',
            transfer: 'Chuyển tiền',
            auction_win: 'Đấu giá',
            auction_refund: 'Hoàn tiền'
        };
        return names[type] || type;
    };

    const handleDeposit = async (values) => {
        setLoading(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newTransaction = {
                id: transactions.length + 1,
                type: 'deposit',
                amount: values.amount,
                description: `Nạp tiền qua ${values.method}`,
                date: new Date().toLocaleString('vi-VN'),
                status: 'completed'
            };

            setTransactions([newTransaction, ...transactions]);
            setWalletBalance(prev => prev + values.amount);
            setIsDepositModalVisible(false);
            depositForm.resetFields();
            toast.success('Nạp tiền thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi nạp tiền!');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (values) => {
        setLoading(true);
        try {
            if (values.amount > walletBalance) {
                toast.error('Số dư không đủ!');
                setLoading(false);
                return;
            }

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newTransaction = {
                id: transactions.length + 1,
                type: 'withdraw',
                amount: -values.amount,
                description: `Rút tiền về ${values.bankAccount}`,
                date: new Date().toLocaleString('vi-VN'),
                status: 'pending'
            };

            setTransactions([newTransaction, ...transactions]);
            setWalletBalance(prev => prev - values.amount);
            setIsWithdrawModalVisible(false);
            withdrawForm.resetFields();
            toast.success('Yêu cầu rút tiền đã được gửi!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi rút tiền!');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (values) => {
        setLoading(true);
        try {
            if (values.amount > walletBalance) {
                toast.error('Số dư không đủ!');
                setLoading(false);
                return;
            }

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newTransaction = {
                id: transactions.length + 1,
                type: 'transfer',
                amount: -values.amount,
                description: `Chuyển tiền cho ${values.receiver}`,
                date: new Date().toLocaleString('vi-VN'),
                status: 'completed'
            };

            setTransactions([newTransaction, ...transactions]);
            setWalletBalance(prev => prev - values.amount);
            setIsTransferModalVisible(false);
            transferForm.resetFields();
            toast.success('Chuyển tiền thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi chuyển tiền!');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Loại giao dịch',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={getTransactionTypeColor(type)}>
                    {getTransactionTypeName(type)}
                </Tag>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span className={amount > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {amount > 0 ? '+' : ''}{formatCurrency(amount)}
                </span>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Thời gian',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'orange'}>
                    {status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                </Tag>
            )
        }
    ];

    return (
        <div className="p-6 min-h-[80vh] bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Title level={2} className="flex items-center gap-2">
                        <WalletOutlined className="text-blue-500" />
                        Quản lý ví điện tử
                    </Title>
                </div>

                {/* Kiểm tra trạng thái active */}
                {!isAccountActive ? (
                    <div className="text-center py-16">
                        <WarningOutlined className="text-6xl text-orange-500 mb-4" />
                        <Title level={3} className="text-gray-700 mb-4">
                            Tài khoản chưa được kích hoạt
                        </Title>
                        <Text className="text-gray-500 mb-6 block">
                            Bạn cần xác thực tài khoản để sử dụng tính năng ví điện tử
                        </Text>
                        <Alert
                            message="Lưu ý"
                            description="Bạn cần xác thực tài khoản để sử dụng tính năng ví điện tử. Click nút bên dưới để nhận mã OTP qua email."
                            type="info"
                            showIcon
                            className="mb-6 max-w-md mx-auto"
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={showOtpModal}
                            icon={<SendOutlined />}
                        >
                            Xác thực tài khoản ngay
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Wallet Overview */}
                        <Row gutter={[24, 24]} className="mb-6">
                            <Col xs={24} sm={8}>
                                <Card className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                                    <Statistic
                                        title={<span className="text-white text-opacity-90">Số dư hiện tại</span>}
                                        value={walletBalance}
                                        formatter={(value) => formatCurrency(value)}
                                        valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                                        prefix={<DollarOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Tổng nạp trong tháng"
                                        value={1500000}
                                        formatter={(value) => formatCurrency(value)}
                                        valueStyle={{ color: '#52c41a' }}
                                        prefix={<ArrowUpOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Tổng chi trong tháng"
                                        value={800000}
                                        formatter={(value) => formatCurrency(value)}
                                        valueStyle={{ color: '#ff4d4f' }}
                                        prefix={<ArrowDownOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Action Buttons */}
                        <Card className="mb-6">
                            <Space size="large" className="w-full justify-center">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    onClick={() => setIsDepositModalVisible(true)}
                                    className="bg-green-500 hover:bg-green-600 border-green-500"
                                >
                                    Nạp tiền
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    size="large"
                                    onClick={() => setIsWithdrawModalVisible(true)}
                                    className="bg-red-500 hover:bg-red-600 border-red-500"
                                >
                                    Rút tiền
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    size="large"
                                    onClick={() => setIsTransferModalVisible(true)}
                                    className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                                >
                                    Chuyển tiền
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    size="large"
                                    onClick={() => toast.info('Đã làm mới dữ liệu')}
                                >
                                    Làm mới
                                </Button>
                            </Space>
                        </Card>

                        {/* Transaction History */}
                        <Card title="Lịch sử giao dịch" className="shadow-lg">
                            <Table
                                columns={columns}
                                dataSource={transactions}
                                rowKey="id"
                                pagination={{ pageSize: 10, showSizeChanger: true }}
                                className="custom-table"
                            />
                        </Card>

                        {/* Deposit Modal */}
                        <Modal
                            title="Nạp tiền vào ví"
                            open={isDepositModalVisible}
                            onCancel={() => setIsDepositModalVisible(false)}
                            footer={null}
                            width={500}
                        >
                            <Form
                                form={depositForm}
                                layout="vertical"
                                onFinish={handleDeposit}
                            >
                                <Form.Item
                                    name="method"
                                    label="Phương thức nạp tiền"
                                    rules={[{ required: true, message: 'Vui lòng chọn phương thức!' }]}
                                >
                                    <Select placeholder="Chọn phương thức">
                                        <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
                                        <Option value="momo">Ví MoMo</Option>
                                        <Option value="zalopay">ZaloPay</Option>
                                        <Option value="vnpay">VNPay</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="amount"
                                    label="Số tiền"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số tiền!' },
                                        { type: 'number', min: 10000, message: 'Số tiền tối thiểu 10,000 VND' }
                                    ]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="Nhập số tiền"
                                        suffix="VND"
                                        className="text-lg"
                                    />
                                </Form.Item>
                                <Form.Item className="mb-0 text-right">
                                    <Space>
                                        <Button onClick={() => setIsDepositModalVisible(false)}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Nạp tiền
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* Withdraw Modal */}
                        <Modal
                            title="Rút tiền từ ví"
                            open={isWithdrawModalVisible}
                            onCancel={() => setIsWithdrawModalVisible(false)}
                            footer={null}
                            width={500}
                        >
                            <Form
                                form={withdrawForm}
                                layout="vertical"
                                onFinish={handleWithdraw}
                            >
                                <Form.Item
                                    name="bankAccount"
                                    label="Tài khoản ngân hàng"
                                    rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
                                >
                                    <Input placeholder="Nhập số tài khoản ngân hàng" />
                                </Form.Item>
                                <Form.Item
                                    name="amount"
                                    label="Số tiền"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số tiền!' },
                                        { type: 'number', min: 50000, message: 'Số tiền tối thiểu 50,000 VND' }
                                    ]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="Nhập số tiền"
                                        suffix="VND"
                                        className="text-lg"
                                    />
                                </Form.Item>
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <Text type="warning">
                                        Số dư hiện tại: <strong>{formatCurrency(walletBalance)}</strong>
                                    </Text>
                                </div>
                                <Form.Item className="mb-0 text-right">
                                    <Space>
                                        <Button onClick={() => setIsWithdrawModalVisible(false)}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Rút tiền
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* Transfer Modal */}
                        <Modal
                            title="Chuyển tiền"
                            open={isTransferModalVisible}
                            onCancel={() => setIsTransferModalVisible(false)}
                            footer={null}
                            width={500}
                        >
                            <Form
                                form={transferForm}
                                layout="vertical"
                                onFinish={handleTransfer}
                            >
                                <Form.Item
                                    name="receiver"
                                    label="Người nhận"
                                    rules={[{ required: true, message: 'Vui lòng nhập thông tin người nhận!' }]}
                                >
                                    <Input placeholder="Nhập email hoặc số điện thoại" />
                                </Form.Item>
                                <Form.Item
                                    name="amount"
                                    label="Số tiền"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số tiền!' },
                                        { type: 'number', min: 1000, message: 'Số tiền tối thiểu 1,000 VND' }
                                    ]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="Nhập số tiền"
                                        suffix="VND"
                                        className="text-lg"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="note"
                                    label="Ghi chú"
                                >
                                    <Input.TextArea placeholder="Ghi chú (không bắt buộc)" rows={3} />
                                </Form.Item>
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <Text type="secondary">
                                        Số dư hiện tại: <strong>{formatCurrency(walletBalance)}</strong>
                                    </Text>
                                </div>
                                <Form.Item className="mb-0 text-right">
                                    <Space>
                                        <Button onClick={() => setIsTransferModalVisible(false)}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Chuyển tiền
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Modal>

                    </>
                )}

                {/* Modal xác thực OTP */}
                <Modal
                    title="Xác thực tài khoản"
                    open={isOtpModalVisible}
                    onCancel={() => setIsOtpModalVisible(false)}
                    footer={null}
                    centered
                >
                    <div className="text-center mb-4">
                        <WarningOutlined className="text-4xl text-orange-500 mb-2" />
                        <Text type="secondary" className="block mb-2">
                            Nhập mã OTP đã được gửi đến email: <strong>{user?.email}</strong>
                        </Text>
                        <Alert
                            message="Mã OTP đã được gửi đến email của bạn để xác thực tài khoản"
                            type="info"
                            showIcon
                            className="text-left"
                        />
                    </div>

                    <Form
                        form={otpForm}
                        layout="vertical"
                        onFinish={handleVerifyOTP}
                    >
                        <Form.Item
                            name="otp"
                            label="Mã OTP"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { len: 6, message: 'Mã OTP phải có 6 chữ số!' }
                            ]}
                        >
                            <Input
                                placeholder="Nhập mã OTP (6 chữ số)"
                                maxLength={6}
                                size="large"
                                className="text-center text-lg tracking-widest"
                            />
                        </Form.Item>

                        <Form.Item className="mb-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                            >
                                Xác thực và tạo ví
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            <Text type="secondary">
                                Không nhận được mã?{' '}
                                {canResend ? (
                                    <Button
                                        type="link"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="p-0"
                                    >
                                        Gửi lại OTP
                                    </Button>
                                ) : (
                                    <span className="text-gray-500">
                                        Gửi lại sau {countdown}s
                                    </span>
                                )}
                            </Text>
                        </div>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default WalletManagement;
