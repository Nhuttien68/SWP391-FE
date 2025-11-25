import React, { useState, useEffect } from 'react';
import {
    WalletOutlined,
    PlusOutlined,
    DownloadOutlined,
    DollarOutlined,
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
    Typography,
    Space,
    Modal,
    Form,
    Input,
    Tabs,
    Table,
    Tag,
    Empty,
    Spin,
} from 'antd';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { walletAPI } from '../../services/walletAPI';

const { Title, Text } = Typography;

const AdminWalletPage = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isCreateWalletModalVisible, setIsCreateWalletModalVisible] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        fetchWalletInfo();
        fetchTransactionHistory();
    }, [isAuthenticated, isLoading]);

    const fetchWalletInfo = async () => {
        setLoading(true);
        try {
            const walletResponse = await walletAPI.getWallet();
            if (walletResponse.success) {
                setWallet(walletResponse.data);
                const balanceResponse = await walletAPI.getBalance();
                if (balanceResponse.success) {
                    setWalletBalance(balanceResponse.data.balance || 0);
                }
            } else {
                setWallet(null);
            }
        } catch (error) {
            setWallet(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const fetchTransactionHistory = async () => {
        setTransactionsLoading(true);
        try {
            const response = await walletAPI.getTransactionHistory();
            if (response.success) {
                setTransactions(response.data || []);
            }
        } catch (error) {
            console.error('Fetch transaction history error:', error);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            const result = await walletAPI.createWallet();
            if (result.success) {
                toast.success('Tạo ví thành công!');
                setIsCreateWalletModalVisible(false);
                await fetchWalletInfo();
                await fetchTransactionHistory();
            } else {
                toast.error(result.message || 'Tạo ví thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo ví');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchWalletInfo();
        await fetchTransactionHistory();
        toast.success('Đã làm mới dữ liệu');
    };

    if (loading) {
        return <Spin size="large" className="flex justify-center items-center min-h-screen" />;
    }

    if (!wallet) {
        return (
            <Card className="shadow-lg rounded-xl">
                <Empty
                    image={<WalletOutlined style={{ fontSize: 80, color: '#1890ff' }} />}
                    description={
                        <div>
                            <Title level={4}>Chưa có ví điện tử</Title>
                            <Text>Tạo ví để bắt đầu quản lý tài chính nền tảng.</Text>
                        </div>
                    }
                >
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateWalletModalVisible(true)}
                    >
                        Tạo ví ngay
                    </Button>
                </Empty>

                <Modal
                    title="Tạo ví điện tử cho Admin"
                    open={isCreateWalletModalVisible}
                    onOk={handleCreateWallet}
                    onCancel={() => setIsCreateWalletModalVisible(false)}
                    confirmLoading={loading}
                    okText="Tạo ví"
                    cancelText="Hủy"
                >
                    <p>Bạn có chắc chắn muốn tạo ví điện tử cho tài khoản admin không?</p>
                    <p className="text-gray-500 text-sm">Ví sẽ được tạo với số dư ban đầu là 0 VNĐ.</p>
                </Modal>
            </Card>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="!mb-0">
                    <WalletOutlined className="mr-2" /> Ví điện tử nền tảng
                </Title>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                    Làm mới
                </Button>
            </div>
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
                </Row>
            </Card>

            <Card title="Lịch sử giao dịch" className="shadow-lg">
                {transactionsLoading ? (
                    <div className="text-center py-12">
                        <Spin size="large" />
                    </div>
                ) : transactions.length > 0 ? (
                    <Table
                        dataSource={transactions}
                        rowKey="walletTransactionId"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                        columns={[
                            {
                                title: 'Loại giao dịch',
                                dataIndex: 'transactionType',
                                key: 'transactionType',
                                render: (type) => {
                                    const colors = {
                                        TOPUP: 'green',
                                        WITHDRAW: 'red',
                                        DEDUCT: 'orange',
                                        POSTING: 'blue',
                                        POST_APPROVAL_FEE: 'blue',
                                        REFUND: 'purple',
                                    };
                                    return <Tag color={colors[type] || 'default'}>{type}</Tag>;
                                },
                            },
                            {
                                title: 'Số tiền',
                                dataIndex: 'amount',
                                key: 'amount',
                                render: (amount, record) => {
                                    const isIncome = ['TOPUP', 'REFUND', 'POST_APPROVAL_FEE'].includes(record.transactionType);
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
                                title: 'Ngày giao dịch',
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
        </div>
    );
};

export default AdminWalletPage;
