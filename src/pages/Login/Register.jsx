import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

const Register = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Xử lý đăng ký
    const onRegisterFinish = async (values) => {
        setLoading(true);
        try {
            const result = await register(values);

            if (result.success) {
                toast.success('Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.');
                // Chuyển đến trang xác thực OTP
                navigate('/verify-otp', { state: { email: values.email } });
            } else {
                toast.error(result.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Register error:', error);
            toast.error('Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl py-4 px-7">
                <Title level={3} className="text-center mb-2 text-[22px]">
                    Đăng Ký
                </Title>

                <Form
                    form={form}
                    name="register"
                    onFinish={onRegisterFinish}
                    layout="vertical"
                    size="middle"
                    className="space-y-1"
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        className="mb-3"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập họ và tên của bạn"
                            className="text-base py-3"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        className="mb-3"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Nhập email của bạn"
                            className="text-base py-3"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại (tùy chọn)"
                        className="mb-3"
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="Nhập số điện thoại"
                            className="text-base py-3"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        className="mb-3"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu của bạn"
                            className="text-base py-3"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        className="mb-3"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu"
                            className="text-base py-3"
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item className="mb-2">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            className="text-lg py-3 h-12"
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </Button>
                    </Form.Item>

                    {/* Sign in link */}
                    <div className="text-center mt-2">
                        <p className="text-gray-600 text-sm">
                            Đã có tài khoản?
                            <Link
                                to="/login"
                                className="text-blue-400 hover:text-blue-800 font-medium ml-1 transition-colors"
                            >
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;