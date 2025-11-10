import React from 'react';
import { Row, Col, Card, Avatar, Button, Descriptions, Typography } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx';

const { Title, Text } = Typography;

const ProfileInfo = () => {
    const { user } = useAuth();

    return (
        <div className="p-6 min-h-[80vh] bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Card>
                                <div className="text-center">
                                    <Avatar size={120} icon={<UserOutlined />} src={user?.avatar} />
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
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
