import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await login(values);

            if (result.success) {
                message.success(result.message);
                navigate('/dashboard'); // Redirect sau khi đăng nhập thành công
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Title level={2} className="text-gray-900">
                        Đăng nhập
                    </Title>
                    <Text className="text-gray-600">
                        Đăng nhập vào tài khoản EV Marketplace của bạn
                    </Text>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập email của bạn"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu của bạn"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full"
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <Text className="text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Đăng ký ngay
                            </Link>
                        </Text>
                    </div>

                    <div className="text-center mt-2">
                        <Link
                            to="/forgot-password"
                            className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;