import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const { Title } = Typography;

const Otp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const { verifyOTP, resendOTP } = useAuth();

    useEffect(() => {
        // Lấy email từ localStorage (đã lưu ở trang đăng ký)
        const registeredEmail = localStorage.getItem('registerEmail');
        if (!registeredEmail) {
            message.error('Không tìm thấy thông tin email. Vui lòng đăng ký lại.');
            navigate('/signup');
            return;
        }
        setEmail(registeredEmail);
    }, [navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await verifyOTP(email, values.otp);

            if (result.success) {
                message.success(result.message);
                localStorage.removeItem('registerEmail'); // Xóa email đã lưu
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            } else {
                message.error(result.message);
            }
        } catch (err) {
            message.error("Có lỗi xảy ra khi xác thực OTP!");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const result = await resendOTP(email);

            if (result.success) {
                message.success(result.message);
            } else {
                message.error(result.message);
            }
        } catch (err) {
            message.error("Không thể gửi lại OTP!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f0f2f5",
            }}
        >
            <Card title="Nhập mã OTP" style={{ width: 400 }}>
                {email && (
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        <Typography.Text type="secondary">
                            Mã OTP đã được gửi đến: <strong>{email}</strong>
                        </Typography.Text>
                    </div>
                )}

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Mã OTP"
                        name="otp"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã OTP!" },
                            { len: 6, message: "Mã OTP phải gồm 6 số!" },
                        ]}
                    >
                        <Input
                            placeholder="Nhập mã OTP"
                            maxLength={6}
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? "Đang xác thực..." : "Xác nhận"}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Typography.Text type="secondary">
                            Không nhận được mã?{' '}
                            <Button
                                type="link"
                                onClick={handleResendOTP}
                                disabled={loading}
                                style={{ padding: 0 }}
                            >
                                Gửi lại OTP
                            </Button>
                        </Typography.Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Otp;
