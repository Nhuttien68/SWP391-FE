import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const { Title, Text, Paragraph } = Typography;

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP, resendOTP } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(true);

    // Lấy email từ navigation state
    const email = location.state?.email;

    // Redirect về register nếu không có email
    useEffect(() => {
        if (!email) {
            toast.error('Vui lòng đăng ký trước khi xác thực OTP');
            navigate('/register');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        let interval = null;
        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown(countdown => countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [countdown]);

    // Hàm xác thực OTP
    const handleVerifyOTP = async (values) => {
        setLoading(true);
        try {
            const result = await verifyOTP(email, values.otp);

            if (result.success) {
                toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');

                // Chuyển về trang login sau 2 giây
                setTimeout(() => {
                    navigate('/login', { state: { email } });
                }, 2000);
            } else {
                toast.error(result.message || 'Mã OTP không hợp lệ');
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            toast.error('Có lỗi xảy ra khi xác thực OTP!');
        } finally {
            setLoading(false);
        }
    };

    // Hàm gửi lại OTP
    const handleResendOTP = async () => {
        if (!canResend) {
            toast.warning(`Vui lòng đợi ${countdown} giây trước khi gửi lại OTP!`);
            return;
        }

        setLoading(true);
        try {
            const result = await resendOTP(email);

            if (result.success) {
                toast.success('Mã OTP mới đã được gửi đến email của bạn');
                setCountdown(300); // 5 phút
                setCanResend(false);
            } else {
                toast.error(result.message || 'Không thể gửi lại OTP');
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            toast.error('Không thể gửi lại OTP!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <SafetyCertificateOutlined className="text-4xl text-blue-600" />
                    </div>
                    <Title level={2} className="mb-2">Xác thực tài khoản</Title>
                    <Paragraph type="secondary">
                        Nhập mã OTP đã được gửi đến email
                    </Paragraph>
                    <Text strong className="text-blue-600">{email}</Text>
                </div>

                <Alert
                    message="Kiểm tra email của bạn"
                    description="Mã OTP có hiệu lực trong 5 phút. Vui lòng kiểm tra cả thư mục spam nếu không thấy email."
                    type="info"
                    showIcon
                    icon={<MailOutlined />}
                    className="mb-6"
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleVerifyOTP}
                    autoComplete="off"
                >
                    <Form.Item
                        name="otp"
                        label="Mã OTP"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã OTP!' },
                            { len: 6, message: 'Mã OTP phải có 6 chữ số!' },
                            { pattern: /^[0-9]+$/, message: 'Mã OTP chỉ chứa số!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập mã OTP (6 chữ số)"
                            maxLength={6}
                            size="large"
                            className="text-center text-2xl tracking-widest font-semibold"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                        >
                            Xác thực
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <Space direction="vertical" size="small">
                            <Text type="secondary">
                                Không nhận được mã?{' '}
                                {canResend ? (
                                    <Button
                                        type="link"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="p-0"
                                    >
                                        Gửi lại OTP
                                    </Button>
                                ) : (
                                    <span className="text-gray-500">
                                        Gửi lại sau {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                                    </span>
                                )}
                            </Text>
                            <Button
                                type="link"
                                onClick={() => navigate('/login')}
                                disabled={loading}
                            >
                                Quay lại đăng nhập
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default VerifyOTP;
