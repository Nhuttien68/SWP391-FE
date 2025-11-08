
import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, Row, Col, Typography, Dropdown } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSearchParams } from 'react-router-dom';
import WalletManagement from './WalletManagement.jsx';
import PostCard from '../Post/PostCard.jsx';
import { postAPI } from '../../services/postAPI';
import { Empty, Pagination } from 'antd';

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
            case 'posts': return 'Bài đăng của tôi';
            case 'wallet': return 'Quản lý ví điện tử';
            case 'history': return 'Lịch sử giao dịch';
            case 'settings': return 'Cài đặt tài khoản';
            default: return 'Tài khoản của tôi';
        }
    };

    // State for My Posts view
    const [myPosts, setMyPosts] = React.useState([]);
    const [loadingPosts, setLoadingPosts] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 12;

    useEffect(() => {
        if (currentView === 'posts') {
            loadMyPosts();
        }
    }, [currentView]);

    const loadMyPosts = async () => {
        setLoadingPosts(true);
        try {
            const res = await postAPI.getMyPosts({ page: 1, pageSize: 200 });
            const postsData = res?.data?.data || res?.data || [];
            const normalized = postsData.map((p) => ({ ...p, id: p.id ?? p.postId ?? p.postID }));
            setMyPosts(normalized);
        } catch (err) {
            console.error('Error loading my posts', err);
        } finally {
            setLoadingPosts(false);
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

            case 'posts':
                return (
                    <div>
                        <Card>
                            <div className="mb-4 flex justify-between items-center">
                                <Title level={4} className="!mb-0">Bài đăng của tôi</Title>
                            </div>
                            {myPosts.length === 0 ? (
                                <Empty description="Bạn chưa có bài đăng nào" />
                            ) : (
                                <>
                                    <Row gutter={[16, 16]}>
                                        {myPosts.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize).map(post => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
                                                <PostCard post={post} />
                                            </Col>
                                        ))}
                                    </Row>
                                    <div className="text-center mt-6">
                                        <Pagination
                                            current={currentPage}
                                            total={myPosts.length}
                                            pageSize={pageSize}
                                            onChange={(p) => setCurrentPage(p)}
                                        />
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
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