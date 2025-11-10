import React, { useState, useEffect } from 'react';
import {
    WalletOutlined,
    PlusOutlined,
    DownloadOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ReloadOutlined,
    WarningOutlined,
    ShoppingCartOutlined,
    TagOutlined,
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
    Typography,
    Space,
    Tabs,
    Empty,
    Spin,
} from 'antd';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../../services/walletAPI';
import { paymentAPI } from '../../services/paymentAPI';
import { transactionAPI } from '../../services/transactionAPI';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const WalletManagement = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, user } = useAuth();

    const [isAccountActive, setIsAccountActive] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    // Modal states
    const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isCreateWalletModalVisible, setIsCreateWalletModalVisible] = useState(false);

    const [depositForm] = Form.useForm();
    const [withdrawForm] = Form.useForm();

    // Transactions data
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [statistics, setStatistics] = useState({
        totalIn: 0,
        totalOut: 0,
        monthlyIn: 0,
        monthlyOut: 0,
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    // Load wallet info
    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsAccountActive(user?.status === 'ACTIVE');

        if (user?.status === 'ACTIVE') {
            fetchWalletInfo();
            fetchTransactions();
        }
    }, [isAuthenticated, isLoading, user, navigate]);

    const fetchWalletInfo = async () => {
        try {
            const walletResponse = await walletAPI.getWallet();
            if (walletResponse.success) {
                setWallet(walletResponse.data);

                const balanceResponse = await walletAPI.getBalance();
                if (balanceResponse.success) {
                    setWalletBalance(balanceResponse.data.balance || 0);
                }
            } else if (walletResponse.status === '404') {
                console.log('User chưa có ví');
                setWallet(null);
            }
        } catch (error) {
            console.error('Fetch wallet error:', error);
        }
    };

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const [purchasesRes, salesRes] = await Promise.all([
                transactionAPI.getMyPurchases(),
                transactionAPI.getMySales(),
            ]);

            if (purchasesRes.success) {
                const purchasesData = purchasesRes.data?.data || purchasesRes.data || [];
                setPurchases(purchasesData);
            }

            if (salesRes.success) {
                const salesData = salesRes.data?.data || salesRes.data || [];
                setSales(salesData);
            }

            // Calculate statistics
            calculateStatistics(
                purchasesRes.data?.data || [],
                salesRes.data?.data || []
            );
        } catch (error) {
            console.error('Fetch transactions error:', error);
            toast.error('Không thể tải lịch sử giao dịch');
        } finally {
            setTransactionsLoading(false);
        }
    };

    const calculateStatistics = (purchasesList, salesList) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let totalOut = 0;
        let totalIn = 0;
        let monthlyOut = 0;
        let monthlyIn = 0;

        // Tính tiền chi (mua hàng)
        purchasesList.forEach((transaction) => {
            const amount = transaction.totalAmount || 0;
            totalOut += amount;

            const transactionDate = new Date(transaction.createdAt);
            if (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            ) {
                monthlyOut += amount;
            }
        });

        // Tính tiền thu (bán hàng)
        salesList.forEach((transaction) => {
            const amount = transaction.totalAmount || 0;
            totalIn += amount;

            const transactionDate = new Date(transaction.createdAt);
            if (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear
            ) {
                monthlyIn += amount;
            }
        });

        setStatistics({
            totalIn,
            totalOut,
            monthlyIn,
            monthlyOut,
        });
    };

    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            const result = await walletAPI.createWallet();
            if (result.success) {
                toast.success('Tạo ví thành công!');
                setIsCreateWalletModalVisible(false);
                await fetchWalletInfo();
            } else {
                toast.error(result.message || 'Tạo ví thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo ví');
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (values) => {
        setLoading(true);
        try {
            const { amount } = values;
            const numAmount = Number(amount);

            if (!numAmount || numAmount < 10000) {
                toast.error('Số tiền nạp tối thiểu là 10,000 VNĐ');
                setLoading(false);
                return;
            }

            const result = await paymentAPI.createPayment(numAmount, 'Nạp tiền vào ví');

            if (result.success && result.data) {
                const paymentUrl = result.data.paymentUrl || result.data;

                if (paymentUrl && typeof paymentUrl === 'string') {
                    toast.success('Đang chuyển đến trang thanh toán...');
                    setIsDepositModalVisible(false);
                    depositForm.resetFields();

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
            toast.error('Có lỗi xảy ra khi tạo thanh toán!');
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
                toast.success('Rút tiền thành công!');
                setIsWithdrawModalVisible(false);
                withdrawForm.resetFields();
                await fetchWalletInfo();
                await fetchTransactions();
            } else {
                toast.error(response.message || 'Rút tiền thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi rút tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchWalletInfo();
        await fetchTransactions();
        toast.success('Đã làm mới dữ liệu');
    };

    // Transaction columns
    const purchaseColumns = [
        {
            title: 'Mã GD',
            dataIndex: 'transactionId',
            key: 'transactionId',
            render: (id) => `#${id?.substring(0, 8)}...`,
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'post',
            key: 'post',
            render: (post) => post?.title || 'N/A',
        },
        {
            title: 'Người bán',
            dataIndex: 'seller',
            key: 'seller',
            render: (seller) => seller?.fullName || 'N/A',
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => (
                <Text strong className="text-red-600">
                    {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => {
                const colors = {
                    WALLET: 'blue',
                    VNPAY: 'purple',
                    BANK_TRANSFER: 'green',
                    COD: 'orange',
                };
                return <Tag color={colors[method] || 'default'}>{method}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    COMPLETED: 'success',
                    PENDING: 'processing',
                    CANCELLED: 'error',
                    REFUNDED: 'warning',
                };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            },
        },
        {
            title: 'Ngày GD',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
    ];

    const salesColumns = [
        {
            title: 'Mã GD',
            dataIndex: 'transactionId',
            key: 'transactionId',
            render: (id) => `#${id?.substring(0, 8)}...`,
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'post',
            key: 'post',
            render: (post) => post?.title || 'N/A',
        },
        {
            title: 'Người mua',
            dataIndex: 'buyer',
            key: 'buyer',
            render: (buyer) => buyer?.fullName || 'N/A',
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => (
                <Text strong className="text-green-600">
                    {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => {
                const colors = {
                    WALLET: 'blue',
                    VNPAY: 'purple',
                    BANK_TRANSFER: 'green',
                    COD: 'orange',
                };
                return <Tag color={colors[method] || 'default'}>{method}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    COMPLETED: 'success',
                    PENDING: 'processing',
                    CANCELLED: 'error',
                    REFUNDED: 'warning',
                };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            },
        },
        {
            title: 'Ngày GD',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
    ];

    if (!isAccountActive) {
        return (
            <Card className="shadow-lg rounded-xl">
                <Empty
                    image={<WarningOutlined style={{ fontSize: 80, color: '#faad14' }} />}
                    description={
                        <div>
                            <Title level={4}>Tài khoản chưa được kích hoạt</Title>
                            <Text>Vui lòng xác thực email để sử dụng chức năng ví điện tử.</Text>
                        </div>
                    }
                />
            </Card>
        );
    }

    if (!wallet) {
        return (
            <Card className="shadow-lg rounded-xl">
                <Empty
                    image={<WalletOutlined style={{ fontSize: 80, color: '#1890ff' }} />}
                    description={
                        <div>
                            <Title level={4}>Chưa có ví điện tử</Title>
                            <Text>Tạo ví để bắt đầu sử dụng các dịch vụ thanh toán.</Text>
                        </div>
                    }
                >
                    <Button type="primary" size="large" onClick={() => setIsCreateWalletModalVisible(true)}>
                        Tạo ví ngay
                    </Button>
                </Empty>

                <Modal
                    title="Tạo ví điện tử"
                    open={isCreateWalletModalVisible}
                    onOk={handleCreateWallet}
                    onCancel={() => setIsCreateWalletModalVisible(false)}
                    confirmLoading={loading}
                >
                    <p>Bạn có chắc chắn muốn tạo ví điện tử không?</p>
                </Modal>
            </Card>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="!mb-0">
                    <WalletOutlined className="mr-2" /> Quản lý ví điện tử
                </Title>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                    Làm mới
                </Button>
            </div>

            {/* Balance Card */}
            <Card className="mb-6 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 border-0">
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={12}>
                        <div className="text-white">
                            <Text className="text-white opacity-90 text-base">Số dư hiện tại</Text>
                            <Title level={2} className="!text-white !mt-2 !mb-0">
                                {formatCurrency(walletBalance)}
                            </Title>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsDepositModalVisible(true)}
                                size="large"
                                className="!bg-green-500 hover:!bg-green-600 border-0"
                            >
                                Nạp tiền
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => setIsWithdrawModalVisible(true)}
                                size="large"
                                className="!bg-white !text-gray-700"
                            >
                                Rút tiền
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng nạp trong tháng"
                            value={statistics.monthlyIn}
                            prefix={<ArrowUpOutlined className="text-green-500" />}
                            suffix="₫"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi trong tháng"
                            value={statistics.monthlyOut}
                            prefix={<ArrowDownOutlined className="text-red-500" />}
                            suffix="₫"
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đơn mua"
                            value={purchases.length}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đơn bán"
                            value={sales.length}
                            prefix={<TagOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Transaction History */}
            <Card title="Lịch sử giao dịch" className="shadow-lg">
                <Tabs defaultActiveKey="purchases">
                    <TabPane tab={`Đơn mua (${purchases.length})`} key="purchases">
                        {transactionsLoading ? (
                            <div className="text-center py-12">
                                <Spin size="large" />
                            </div>
                        ) : purchases.length > 0 ? (
                            <Table
                                dataSource={purchases}
                                columns={purchaseColumns}
                                rowKey="transactionId"
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: 1000 }}
                            />
                        ) : (
                            <Empty description="Chưa có giao dịch mua nào" />
                        )}
                    </TabPane>
                    <TabPane tab={`Đơn bán (${sales.length})`} key="sales">
                        {transactionsLoading ? (
                            <div className="text-center py-12">
                                <Spin size="large" />
                            </div>
                        ) : sales.length > 0 ? (
                            <Table
                                dataSource={sales}
                                columns={salesColumns}
                                rowKey="transactionId"
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: 1000 }}
                            />
                        ) : (
                            <Empty description="Chưa có giao dịch bán nào" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            {/* Deposit Modal */}
            <Modal
                title="Nạp tiền vào ví"
                open={isDepositModalVisible}
                onCancel={() => {
                    setIsDepositModalVisible(false);
                    depositForm.resetFields();
                }}
                footer={null}
            >
                <Form form={depositForm} onFinish={handleDeposit} layout="vertical">
                    <Form.Item
                        label="Số tiền cần nạp"
                        name="amount"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền!' },
                            { pattern: /^[0-9]+$/, message: 'Số tiền phải là số!' },
                        ]}
                    >
                        <Input
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            placeholder="Nhập số tiền (tối thiểu 10,000)"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            Nạp tiền qua VNPay
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                title="Rút tiền từ ví"
                open={isWithdrawModalVisible}
                onCancel={() => {
                    setIsWithdrawModalVisible(false);
                    withdrawForm.resetFields();
                }}
                footer={null}
            >
                <Form form={withdrawForm} onFinish={handleWithdraw} layout="vertical">
                    <Form.Item
                        label="Số tiền cần rút"
                        name="amount"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền!' },
                            { pattern: /^[0-9]+$/, message: 'Số tiền phải là số!' },
                        ]}
                    >
                        <Input
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            placeholder={`Số dư: ${formatCurrency(walletBalance)}`}
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" danger>
                            Rút tiền
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WalletManagement;
