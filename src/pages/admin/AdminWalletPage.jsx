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

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        fetchWalletInfo();
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
                            <Text>Admin chưa có ví. Vui lòng liên hệ kỹ thuật để tạo ví.</Text>
                        </div>
                    }
                />
            </Card>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="!mb-0">
                    <WalletOutlined className="mr-2" /> Ví điện tử của nền tảng
                </Title>
                <Button icon={<ReloadOutlined />} onClick={fetchWalletInfo}>
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

        </div>
    );
};

export default AdminWalletPage;
