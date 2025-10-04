import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Step } = Steps;

const Register = () => {
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const { register, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    // Xử lý đăng ký
    const onRegisterFinish = async (values) => {
        setLoading(true);
        try {
            const result = await register(values);

            if (result.success) {
                message.success(result.message);
                setRegisteredEmail(values.email);
                setCurrentStep(1); // Chuyển sang bước xác thực OTP
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xác thực OTP
    const onOTPFinish = async (values) => {
        setLoading(true);
        try {
            const result = await verifyOTP(registeredEmail, values.otp);

            if (result.success) {
                message.success(result.message);
                navigate('/login'); // Chuyển về trang đăng nhập
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi xác thực OTP');
        } finally {
            setLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const result = await resendOTP(registeredEmail);

            if (result.success) {
                message.success(result.message);
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Không thể gửi lại OTP');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Đăng ký',
            description: 'Thông tin tài khoản'
        },
        {
            title: 'Xác thực',
            description: 'Nhập mã OTP'
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Title level={2} className="text-gray-900">
                        Đăng ký tài khoản
                    </Title>
                    <Text className="text-gray-600">
                        Tạo tài khoản EV Marketplace mới
                    </Text>
                </div>

                <Steps current={currentStep} className="mb-8">
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} description={item.description} />
                    ))}
                </Steps>

                {currentStep === 0 && (
                    <Form
                        form={form}
                        name="register"
                        onFinish={onRegisterFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="fullName"
                            label="Họ và tên"
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ và tên!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Nhập họ và tên của bạn"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Nhập email của bạn"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại (tùy chọn)"
                        >
                            <Input
                                prefix={<PhoneOutlined />}
                                placeholder="Nhập số điện thoại"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu của bạn"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
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
                                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            <Text className="text-gray-600">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </Text>
                        </div>
                    </Form>
                )}

                {currentStep === 1 && (
                    <div>
                        <div className="text-center mb-6">
                            <Text className="text-gray-600">
                                Mã OTP đã được gửi đến email: <strong>{registeredEmail}</strong>
                            </Text>
                        </div>

                        <Form
                            form={otpForm}
                            name="otp"
                            onFinish={onOTPFinish}
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="otp"
                                label="Mã OTP"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã OTP!' }
                                ]}
                            >
                                <Input
                                    placeholder="Nhập mã OTP từ email"
                                    disabled={loading}
                                    maxLength={6}
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
                                    {loading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
                                </Button>
                            </Form.Item>

                            <div className="text-center">
                                <Text className="text-gray-600 text-sm">
                                    Không nhận được mã?{' '}
                                    <Button
                                        type="link"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="p-0 text-blue-600"
                                    >
                                        Gửi lại OTP
                                    </Button>
                                </Text>
                            </div>
                        </Form>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Register;