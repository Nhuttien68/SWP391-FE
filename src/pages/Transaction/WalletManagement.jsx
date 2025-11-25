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
import { withdrawalAPI } from '../../services/withdrawalAPI';

const { Title, Text } = Typography;

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
    const [isWithdrawalRequestsModalVisible, setIsWithdrawalRequestsModalVisible] = useState(false);

    const [depositForm] = Form.useForm();
    const [withdrawForm] = Form.useForm();

    // Withdrawal requests data
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [withdrawalRequestsLoading, setWithdrawalRequestsLoading] = useState(false);

    // Transactions data
    const [walletTransactions, setWalletTransactions] = useState([]);
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
            fetchWalletTransactions();
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

    const fetchWalletTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const response = await walletAPI.getTransactionHistory();
            if (response.success) {
                setWalletTransactions(response.data || []);
            }
        } catch (error) {
            console.error('Fetch wallet transactions error:', error);
            toast.error('Không thể tải lịch sử giao dịch ví');
        } finally {
            setTransactionsLoading(false);
        }
    };

    const fetchWithdrawalRequests = async () => {
        setWithdrawalRequestsLoading(true);
        try {
            const response = await withdrawalAPI.getMyWithdrawalRequests();
            if (response.success) {
                setWithdrawalRequests(response.data || []);
            }
        } catch (error) {
            console.error('Fetch withdrawal requests error:', error);
            toast.error('Không thể tải danh sách yêu cầu rút tiền');
        } finally {
            setWithdrawalRequestsLoading(false);
        }
    };

    const handleOpenWithdrawalRequests = () => {
        setIsWithdrawalRequestsModalVisible(true);
        fetchWithdrawalRequests();
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
            const withdrawAmount = Number(values.amount);

            // Validate số tiền tối thiểu
            if (withdrawAmount < 100000) {
                toast.error('Số tiền rút tối thiểu là 100,000 VNĐ');
                setLoading(false);
                return;
            }

            // Validate số dư
            if (withdrawAmount > walletBalance) {
                toast.error('Số dư không đủ!');
                setLoading(false);
                return;
            }

            // Tạo yêu cầu rút tiền có phê duyệt
            const response = await withdrawalAPI.createWithdrawalRequest({
                amount: values.amount,
                bankName: values.bankName,
                bankAccountNumber: values.bankAccountNumber,
                bankAccountName: values.bankAccountName,
                note: values.note || ''
            });

            if (response.success) {
                toast.success('Đã gửi yêu cầu rút tiền! Vui lòng chờ admin phê duyệt.');
                setIsWithdrawModalVisible(false);
                withdrawForm.resetFields();
                await fetchWalletInfo();
                await fetchWalletTransactions();
            } else {
                toast.error(response.message || 'Tạo yêu cầu rút tiền thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo yêu cầu rút tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchWalletInfo();
        await fetchWalletTransactions();
        toast.success('Đã làm mới dữ liệu');
    };

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
                            <Button
                                icon={<WalletOutlined />}
                                onClick={handleOpenWithdrawalRequests}
                                size="large"
                                className="!bg-white !text-gray-700"
                            >
                                Xem yêu cầu rút tiền
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Transaction History */}
            <Card title="Lịch sử giao dịch ví" className="shadow-lg">
                {transactionsLoading ? (
                    <div className="text-center py-12">
                        <Spin size="large" />
                    </div>
                ) : walletTransactions.length > 0 ? (
                    <Table
                        dataSource={walletTransactions}
                        rowKey="walletTransactionId"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                        columns={[
                            {
                                title: 'Loại GD',
                                dataIndex: 'transactionType',
                                key: 'transactionType',
                                render: (type) => {
                                    const typeLabels = {
                                        TOPUP: 'Nạp tiền',
                                        WITHDRAW: 'Rút tiền',
                                        DEDUCT: 'Trừ tiền',
                                        POSTING_FEE: 'Phí đăng tin',
                                        REFUND: 'Hoàn tiền',
                                    };
                                    const colors = {
                                        TOPUP: 'green',
                                        WITHDRAW: 'red',
                                        DEDUCT: 'orange',
                                        POSTING_FEE: 'blue',
                                        REFUND: 'purple',
                                    };
                                    return <Tag color={colors[type] || 'default'}>{typeLabels[type] || type}</Tag>;
                                },
                            },
                            {
                                title: 'Số tiền',
                                dataIndex: 'amount',
                                key: 'amount',
                                render: (amount, record) => {
                                    const isIncome = ['TOPUP', 'REFUND'].includes(record.transactionType);
                                    return (
                                        <Text strong className={isIncome ? 'text-green-600' : 'text-red-600'}>
                                            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                                        </Text>
                                    );
                                },
                            },
                            {
                                title: 'Số dư trước',
                                dataIndex: 'balanceBefore',
                                key: 'balanceBefore',
                                render: (bal) => formatCurrency(bal),
                            },
                            {
                                title: 'Số dư sau',
                                dataIndex: 'balanceAfter',
                                key: 'balanceAfter',
                                render: (bal) => <Text strong>{formatCurrency(bal)}</Text>,
                            },
                            {
                                title: 'Phương thức',
                                dataIndex: 'paymentMethod',
                                key: 'paymentMethod',
                                render: (method) => method || 'N/A',
                            },
                            {
                                title: 'Mô tả',
                                dataIndex: 'description',
                                key: 'description',
                                render: (desc) => desc || 'N/A',
                            },
                            {
                                title: 'Ngày GD',
                                dataIndex: 'createdAt',
                                key: 'createdAt',
                                render: (date) => new Date(date).toLocaleString('vi-VN'),
                            },
                        ]}
                    />
                ) : (
                    <Empty description="Chưa có giao dịch nào" />
                )}
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
                title="Yêu cầu rút tiền"
                open={isWithdrawModalVisible}
                onCancel={() => {
                    setIsWithdrawModalVisible(false);
                    withdrawForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form form={withdrawForm} onFinish={handleWithdraw} layout="vertical">
                    <Form.Item
                        label="Số tiền cần rút"
                        name="amount"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền!' },
                            { pattern: /^[0-9]+$/, message: 'Số tiền phải là số!' },
                            {
                                validator: (_, value) => {
                                    if (value && Number(value) < 100000) {
                                        return Promise.reject('Số tiền rút tối thiểu là 100,000 VNĐ');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            placeholder="Tối thiểu 100,000 VNĐ"
                            size="large"
                        />
                    </Form.Item>
                    <div className="mb-4 text-sm text-gray-600">
                        Số dư khả dụng: <Text strong>{formatCurrency(walletBalance)}</Text>
                    </div>
                    <Form.Item
                        label="Tên ngân hàng"
                        name="bankName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng!' }]}
                    >
                        <Input placeholder="VD: Vietcombank, Techcombank, ..." size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Số tài khoản"
                        name="bankAccountNumber"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tài khoản!' },
                            { pattern: /^[0-9]+$/, message: 'Số tài khoản phải là số!' }
                        ]}
                    >
                        <Input placeholder="Nhập số tài khoản ngân hàng" size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Tên chủ tài khoản"
                        name="bankAccountName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
                    >
                        <Input placeholder="Nhập tên chủ tài khoản (viết hoa không dấu)" size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Ghi chú (tùy chọn)"
                        name="note"
                    >
                        <Input.TextArea rows={3} placeholder="Ghi chú thêm về yêu cầu rút tiền..." />
                    </Form.Item>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <Text className="text-sm text-yellow-800">
                            ⚠️ Yêu cầu rút tiền cần được hệ thống phê duyệt. Tiền sẽ được chuyển vào tài khoản ngân hàng của bạn sau khi được duyệt.
                        </Text>
                    </div>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" danger>
                            Gửi yêu cầu rút tiền
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Withdrawal Requests Modal */}
            <Modal
                title="Yêu cầu rút tiền của tôi "
                open={isWithdrawalRequestsModalVisible}
                onCancel={() => setIsWithdrawalRequestsModalVisible(false)}
                footer={null}
                width={900}
            >
                {withdrawalRequestsLoading ? (
                    <div className="text-center py-12">
                        <Spin size="large" />
                    </div>
                ) : withdrawalRequests.length > 0 ? (
                    <Table
                        dataSource={withdrawalRequests}
                        rowKey="withdrawalId"
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 800 }}
                        columns={[
                            {
                                title: 'Mã yêu cầu',
                                dataIndex: 'withdrawalId',
                                key: 'withdrawalId',
                                width: 80,
                                render: (id) => `#${id}`,
                            },
                            {
                                title: 'Số tiền',
                                dataIndex: 'amount',
                                key: 'amount',
                                render: (amount) => (
                                    <Text strong className="text-red-600">
                                        {formatCurrency(amount)}
                                    </Text>
                                ),
                            },
                            {
                                title: 'Ngân hàng',
                                key: 'bank',
                                render: (_, record) => (
                                    <div>
                                        <div><Text strong>{record.bankName}</Text></div>
                                        <div className="text-xs text-gray-500">{record.bankAccountNumber}</div>
                                        <div className="text-xs text-gray-500">{record.bankAccountName}</div>
                                    </div>
                                ),
                            },
                            {
                                title: 'Trạng thái',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => {
                                    const statusConfig = {
                                        PENDING: { color: 'orange', text: 'Chờ duyệt' },
                                        APPROVED: { color: 'green', text: 'Đã duyệt' },
                                        REJECTED: { color: 'red', text: 'Từ chối' },
                                    };
                                    const config = statusConfig[status] || { color: 'default', text: status };
                                    return <Tag color={config.color}>{config.text}</Tag>;
                                },
                            },
                            {
                                title: 'Ghi chú',
                                dataIndex: 'note',
                                key: 'note',
                                render: (note) => note ? note : <Text type="secondary" className="italic">Trống</Text>,
                            },
                            {
                                title: 'Ngày tạo',
                                dataIndex: 'requestedAt',
                                key: 'requestedAt',
                                render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
                            },
                        ]}
                    />
                ) : (
                    <Empty description="Chưa có yêu cầu rút tiền nào" />
                )}
            </Modal>
        </div>
    );
};

export default WalletManagement;
