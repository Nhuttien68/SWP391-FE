import React from 'react';
import { Card, Typography, Button, Space, Avatar } from 'antd';
import { useAuth } from '../context/AuthContext';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <Text>Vui lòng đăng nhập để truy cập trang này</Text>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <div className="text-center mb-8">
                        <Avatar size={80} icon={<UserOutlined />} className="mb-4" />
                        <Title level={2}>Chào mừng, {user?.fullName}!</Title>
                        <Text className="text-gray-600">
                            Bạn đã đăng nhập thành công vào EV Marketplace
                        </Text>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card type="inner" title="Thông tin tài khoản">
                            <Space direction="vertical" className="w-full">
                                <div>
                                    <Text strong>Họ tên:</Text>
                                    <br />
                                    <Text>{user?.fullName}</Text>
                                </div>
                                <div>
                                    <Text strong>Email:</Text>
                                    <br />
                                    <Text>{user?.email}</Text>
                                </div>
                                <div>
                                    <Text strong>ID:</Text>
                                    <br />
                                    <Text code>{user?.id}</Text>
                                </div>
                            </Space>
                        </Card>

                        <Card type="inner" title="Hành động">
                            <Space direction="vertical" className="w-full">
                                <Button type="primary" block>
                                    Xem sản phẩm
                                </Button>
                                <Button block>
                                    Cập nhật hồ sơ
                                </Button>
                                <Button block>
                                    Đổi mật khẩu
                                </Button>
                                <Button
                                    danger
                                    block
                                    icon={<LogoutOutlined />}
                                    onClick={logout}
                                >
                                    Đăng xuất
                                </Button>
                            </Space>
                        </Card>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;