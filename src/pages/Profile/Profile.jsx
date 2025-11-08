
import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, Row, Col, Typography, Dropdown } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSearchParams } from 'react-router-dom';
import WalletManagement from './WalletManagement.jsx';
import OrdersPage from './OrdersPage.jsx';
import FavoritesPage from './FavoritesPage.jsx';

const { Title } = Typography;

const Profile = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [currentView, setCurrentView] = useState('profile');

    // Đọc view từ URL params
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) {
            setCurrentView(viewParam);
        }
    }, [searchParams]);

    const getCurrentViewTitle = () => {
        switch (currentView) {
            case 'profile': return 'Thông tin cá nhân';
            case 'purchases': return 'Thông tin đơn hàng';
            case 'favorites': return 'Sản phẩm yêu thích';
            case 'wallet': return 'Quản lý ví điện tử';
            case 'history': return 'Lịch sử giao dịch';
            case 'settings': return 'Cài đặt tài khoản';
            default: return 'Tài khoản của tôi';
        }
    };

    const profileInfoContent = (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
                <Card>
                    <div className="text-center">

                        <Title level={4} className="mt-4">
                            {user?.fullName || 'Người dùng'}
                        </Title>
                        <Button type="primary" icon={<EditOutlined />}>
                            Chỉnh sửa ảnh
                        </Button>
                    </div>
                </Card>
            </Col>

            <Col xs={24} md={16}>
                <Card title="Thông tin chi tiết">
                    <Descriptions column={1}>
                        <Descriptions.Item label="Họ và tên">
                            {user?.fullName || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {user?.email || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {user?.phone || "Chưa cập nhật"}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="mt-6">
                        <Button type="primary" icon={<EditOutlined />} className="mr-2">
                            Chỉnh sửa thông tin
                        </Button>
                        <Button>
                            Đổi mật khẩu
                        </Button>
                    </div>
                </Card>
            </Col>
        </Row>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'purchases':
                return <OrdersPage />;
            
            case 'favorites':
                return <FavoritesPage />;
                
            case 'wallet':
                return <WalletManagement />;

            case 'profile':
                return (
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Card>
                                <div className="text-center">
                                    <Avatar size={120} icon={<UserOutlined />} />
                                    <Title level={4} className="mt-4">
                                        {user?.fullName || 'Người dùng'}
                                    </Title>
                                    <Button type="primary" icon={<EditOutlined />}>
                                        Chỉnh sửa ảnh
                                    </Button>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={16}>
                            <Card title="Thông tin chi tiết">
                                <Descriptions column={1}>
                                    <Descriptions.Item label="Họ và tên">
                                        {user?.fullName || 'Chưa cập nhật'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {user?.email || 'Chưa cập nhật'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        {user?.phone || "Chưa cập nhật"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ">
                                        Chưa cập nhật
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh">
                                        Chưa cập nhật
                                    </Descriptions.Item>
                                </Descriptions>

                                <div className="mt-6">
                                    <Button type="primary" icon={<EditOutlined />} className="mr-2">
                                        Chỉnh sửa thông tin
                                    </Button>
                                    <Button>
                                        Đổi mật khẩu
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                );

            case 'history':
                return (
                    <Card>
                        <div className="text-center py-8">
                            <Title level={4}>Lịch sử giao dịch đấu giá</Title>
                            <p>Tính năng này đang được phát triển...</p>
                        </div>
                    </Card>
                );

            case 'settings':
                return (
                    <Card>
                        <div className="text-center py-8">
                            <Title level={4}>Cài đặt tài khoản</Title>
                            <p>Tính năng này đang được phát triển...</p>
                        </div>
                    </Card>
                );

            default:
                return (
                    <Card>
                        <div className="text-center py-8">
                            <Title level={4}>Trang không tìm thấy</Title>
                            <p>Vui lòng chọn menu từ avatar ở header</p>
                        </div>
                    </Card>
                );
        }
    };

    return (
        <div className="p-6 min-h-[80vh] bg-gray-100">
            <div className="max-w-7xl mx-auto">


                <div className="bg-white rounded-lg shadow-sm p-4">
                    {renderCurrentView()}
                </div>
            </div>
        </div>
    );
};

export default Profile;