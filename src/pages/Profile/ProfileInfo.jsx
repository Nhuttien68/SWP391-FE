
import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, Row, Col, Typography, Empty, Modal, Form, Input, Steps, message, Pagination, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSearchParams } from 'react-router-dom';
import WalletManagement from '../Transaction/WalletManagement.jsx';
import OrdersPage from '../Transaction/OrdersPage.jsx';
import FavoritesPage from '../Post/FavoritesPage.jsx';
import postAPI from '../../services/postAPI.js';
import PostCard from '../Post/PostCard.jsx';

const { Title } = Typography;

const Profile = () => {
    const { user, forgotPassword, changePassword } = useAuth();
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

    // State for My Posts view
    const [myPosts, setMyPosts] = React.useState([]);
    const [loadingPosts, setLoadingPosts] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 12;

    // Change password modal / steps
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [form] = Form.useForm();

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
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={16}>
                            <Card title="Thông tin của bạn">
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
                                    <Button type="primary" onClick={() => { setIsModalVisible(true); setStep(0); setModalError(null); form.resetFields(); }}>
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

            <Modal
                title="Đổi mật khẩu"
                visible={isModalVisible}
                onCancel={() => { setIsModalVisible(false); setStep(0); form.resetFields(); }}
                footer={null}
            >
                {modalError && (
                    <Alert className="mb-4" type="error" message={modalError} showIcon />
                )}
                <Steps current={step} size="small" className="mb-4">
                    <Steps.Step title="Nhập mã OTP" />
                    <Steps.Step title="Đặt mật khẩu mới" />
                </Steps>

                {step === 0 && (
                    <div>
                        <p>Email đang dùng: <strong>{user?.email || 'Chưa có email'}</strong></p>
                        <div className="text-right">
                            <Button
                                type="primary"
                                loading={sendingOtp}
                                onClick={async () => {
                                        if (!user?.email) {
                                            setModalError('Không có email để gửi OTP');
                                            return;
                                        }
                                        try {
                                            setSendingOtp(true);
                                            const res = await forgotPassword(user.email);
                                            if (res && res.success) {
                                                message.success('Mã OTP đã được gửi tới email của bạn');
                                                setModalError(null);
                                                setStep(1);
                                            } else {
                                                console.error('forgotPassword response', res);
                                                setModalError(res?.message || 'Gửi mã thất bại, thử lại sau');
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            setModalError('Gửi mã thất bại, thử lại sau');
                                        } finally {
                                            setSendingOtp(false);
                                        }
                                    }}
                            >
                                Yêu cầu gửi mã OTP
                            </Button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={async (values) => {
                            const { otp, newPassword } = values;
                            if (!otp) {
                                setModalError('Vui lòng nhập mã OTP');
                                return;
                            }
                            if (!newPassword || newPassword.length < 8) {
                                setModalError('Mật khẩu phải có ít nhất 8 ký tự');
                                return;
                            }
                            try {
                                setLoading(true);
                                const res = await changePassword({ email: user.email, otp, newPassWord: newPassword });
                                if (res && res.success) {
                                    message.success('Đổi mật khẩu thành công');
                                    setModalError(null);
                                    setIsModalVisible(false);
                                    setStep(0);
                                    form.resetFields();
                                } else {
                                    setModalError(res?.message || 'Đổi mật khẩu thất bại');
                                }
                            } catch (err) {
                                console.error('changePassword error thrown', err);
                                // axios error -> try to extract useful info
                                const status = err?.response?.status;
                                const data = err?.response?.data;
                                const apiMessage = data?.Message || data?.message;
                                if (status === 404) {
                                    setModalError(apiMessage || 'Mã OTP không hợp lệ (404)');
                                } else if (apiMessage) {
                                    setModalError(apiMessage);
                                } else {
                                    setModalError('Đổi mật khẩu thất bại: ' + (err?.message || 'Lỗi'));
                                }
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        <Form.Item name="otp" label="Mã OTP" rules={[{ required: true, message: 'Vui lòng nhập mã OTP' }]}>
                            <Input placeholder="Nhập mã OTP" />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }]}
                            hasFeedback
                        >
                            <Input.Password placeholder="Mật khẩu mới (ít nhất 8 ký tự)" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            dependencies={["newPassword"]}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                    }
                                })
                            ]}
                        >
                            <Input.Password placeholder="Xác nhận mật khẩu" />
                        </Form.Item>

                        <div className="text-right">
                            <Button onClick={() => { setStep(0); }} style={{ marginRight: 8 }}>
                                Quay lại
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Xác nhận
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default Profile;