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
    Alert,
    Empty
} from 'antd';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../../services/walletAPI';
import { paymentAPI } from '../../services/paymentAPI';

const { Title, Text } = Typography;
const { Option } = Select;

const WalletManagement = () => {
    const navigate = useNavigate();

    const { isAuthenticated, isLoading, user } = useAuth();
    const [isAccountActive, setIsAccountActive] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [isCreateWalletModalVisible, setIsCreateWalletModalVisible] = useState(false);
    const [depositForm] = Form.useForm();
    const [withdrawForm] = Form.useForm();
    const [transferForm] = Form.useForm();

    const [transactions, setTransactions] = useState([]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // useEffect để kiểm tra trạng thái active của user và lấy thông tin ví
    useEffect(() => {
        if (isLoading) return; // Chờ load xong

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsAccountActive(user?.status === 'ACTIVE');

        // Nếu tài khoản đã active, lấy thông tin ví và số dư
        if (user?.status === 'ACTIVE') {
            const fetchWalletInfo = async () => {
                try {
                    // Lấy thông tin ví
                    const walletResponse = await walletAPI.getWallet();
                    if (walletResponse.success) {
                        setWallet(walletResponse.data);

                        // Chỉ lấy số dư nếu có ví
                        const balanceResponse = await walletAPI.getBalance();
                        if (balanceResponse.success) {
                            setWalletBalance(balanceResponse.data.balance);
                        }
                    } else if (walletResponse.status === '404') {
                        // Chưa có ví, không làm gì cả (không hiển thị error)
                        console.log('User chưa có ví');
                        setWallet(null);
                    } else {
                        // Lỗi khác
                        console.error('Get wallet error:', walletResponse.message);
                    }
                } catch (error) {
                    console.error('Fetch wallet error:', error);
                    // Không hiển thị toast error để tránh spam khi chưa có ví
                }
            };

            fetchWalletInfo();
        }
    }, [isAuthenticated, isLoading, user, navigate]);

    // Hàm tạo ví
    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            const result = await walletAPI.createWallet();

            if (result.success) {
                toast.success('Tạo ví thành công!');
                setWallet(result.data);
                setIsCreateWalletModalVisible(false);

                // Lấy lại số dư sau khi tạo ví
                const balanceResponse = await walletAPI.getBalance();
                if (balanceResponse.success) {
                    setWalletBalance(balanceResponse.data.balance);
                }
            } else {
                toast.error(result.message || 'Không thể tạo ví');
            }
        } catch (error) {
            console.error('Create wallet error:', error);
            toast.error('Có lỗi xảy ra khi tạo ví');
        } finally {
            setLoading(false);
        }
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
            const { amount } = values;

            // Validate amount
            const numAmount = Number(amount);
            if (!numAmount || numAmount < 10000) {
                toast.error('Số tiền nạp tối thiểu là 10,000 VNĐ');
                setLoading(false);
                return;
            }

            // Gọi API tạo payment URL
            const result = await paymentAPI.createPayment(numAmount, 'Nạp tiền vào ví');

            if (result.success && result.data) {
                // result.data có thể là object { paymentUrl: "..." } hoặc trực tiếp là URL string
                const paymentUrl = result.data.paymentUrl || result.data;

                if (paymentUrl && typeof paymentUrl === 'string') {
                    // Redirect đến trang thanh toán VNPay
                    toast.success('Đang chuyển đến trang thanh toán...');
                    setIsDepositModalVisible(false);
                    depositForm.resetFields();

                    // Delay một chút để toast hiển thị
                    setTimeout(() => {
                        window.location.href = paymentUrl;
                    }, 500);
                } else {
                    toast.error('URL thanh toán không hợp lệ');
                }
            } else {
                toast.error(result.message || 'Không thể tạo thanh toán');
            }
        } catch (error) {
            console.error('Deposit error:', error);
            toast.error(error.response?.data?.Message || error.message || 'Có lỗi xảy ra khi tạo thanh toán!');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (values) => {
        setLoading(true);
        try {
            if (values.amount > walletBalance) {
                toast.error('Số dư không đủ!');
                return;
            }

            const response = await walletAPI.withdraw(values.amount);
            if (response.success) {
                // Cập nhật số dư mới
                const balanceResponse = await walletAPI.getBalance();
                if (balanceResponse.success) {
                    setWalletBalance(balanceResponse.data.balance);
                }

                // Thêm giao dịch mới vào lịch sử
                const newTransaction = {
                    id: transactions.length + 1,
                    type: 'withdraw',
                    amount: -values.amount,
                    description: `Rút tiền về ${values.bankAccount}`,
                    date: new Date().toLocaleString('vi-VN'),
                    status: 'pending'
                };

                setTransactions([newTransaction, ...transactions]);
                setIsWithdrawModalVisible(false);
                withdrawForm.resetFields();
                toast.success('Yêu cầu rút tiền đã được gửi!');
            } else {
                toast.error(response.message || 'Không thể rút tiền');
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            toast.error('Có lỗi xảy ra khi rút tiền!');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (values) => {
        setLoading(true);
        try {
            // TODO: Implement transfer API when available
            toast.warning('Tính năng chuyển tiền đang được phát triển');
            setIsTransferModalVisible(false);
            transferForm.resetFields();
        } catch (error) {
            console.error('Transfer error:', error);
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

                {/* Kiểm tra xem đã có ví chưa */}
                {!wallet ? (
                    <div className="text-center py-16">
                        <WalletOutlined className="text-6xl text-blue-500 mb-4" />
                        <Title level={3} className="text-gray-700 mb-4">
                            Chưa có ví điện tử
                        </Title>
                        <Text className="text-gray-500 mb-6 block">
                            Bạn cần tạo ví để sử dụng các tính năng thanh toán và giao dịch
                        </Text>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => setIsCreateWalletModalVisible(true)}
                            icon={<PlusOutlined />}
                            loading={loading}
                        >
                            Tạo ví ngay
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
                                        value={0}
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
                                        value={0}
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
                            {transactions.length > 0 ? (
                                <Table
                                    columns={columns}
                                    dataSource={transactions}
                                    rowKey="id"
                                    pagination={{ pageSize: 10, showSizeChanger: true }}
                                    className="custom-table"
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <Empty description="Chưa có giao dịch nào" />
                                </div>
                            )}
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
                                <Alert
                                    message="Phương thức thanh toán: VNPay"
                                    description="Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch."
                                    type="info"
                                    showIcon
                                    className="mb-4"
                                />
                                <Form.Item
                                    name="amount"
                                    label="Số tiền cần nạp"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số tiền!' },
                                        {
                                            validator: (_, value) => {
                                                const numValue = Number(value);
                                                if (!value) {
                                                    return Promise.reject('Vui lòng nhập số tiền!');
                                                }
                                                if (isNaN(numValue) || numValue < 10000) {
                                                    return Promise.reject('Số tiền tối thiểu 10,000 VNĐ');
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="Nhập số tiền (tối thiểu 10,000 VNĐ)"
                                        suffix="VNĐ"
                                        className="text-lg"
                                    />
                                </Form.Item>
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <Text type="secondary" className="text-sm">
                                        💡 <strong>Lưu ý:</strong> Bạn sẽ thanh toán qua cổng VNPay. Số tiền sẽ được cộng vào ví sau khi thanh toán thành công.
                                    </Text>
                                </div>
                                <Form.Item className="mb-0 text-right">
                                    <Space>
                                        <Button onClick={() => setIsDepositModalVisible(false)}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Tiếp tục thanh toán
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

                {/* Modal Tạo Ví */}
                <Modal
                    title="Tạo ví điện tử"
                    open={isCreateWalletModalVisible}
                    onCancel={() => setIsCreateWalletModalVisible(false)}
                    footer={null}
                    centered
                >
                    <div className="text-center mb-6">
                        <WalletOutlined className="text-6xl text-blue-500 mb-4" />
                        <Title level={4} className="mb-2">Xác nhận tạo ví</Title>
                        <Text type="secondary">
                            Bạn có chắc chắn muốn tạo ví điện tử? Ví sẽ được tạo với số dư ban đầu là 0 VNĐ.
                        </Text>
                    </div>

                    <Alert
                        message="Lưu ý"
                        description="Mỗi tài khoản chỉ được tạo một ví duy nhất. Vui lòng bảo mật thông tin tài khoản của bạn."
                        type="info"
                        showIcon
                        className="mb-6"
                    />

                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsCreateWalletModalVisible(false)}
                            block
                            size="large"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleCreateWallet}
                            block
                            size="large"
                            loading={loading}
                        >
                            Xác nhận tạo ví
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default WalletManagement;
