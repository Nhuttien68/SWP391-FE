import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";

const { Title } = Typography;

const Otp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const { verifyOTP, resendOTP, createWallet, login } = useAuth();

    useEffect(() => {
        // Lấy email từ localStorage (đã lưu ở trang đăng ký)
        const registeredEmail = localStorage.getItem('registerEmail');
        if (!registeredEmail) {
            toast.error('Không tìm thấy thông tin email. Vui lòng đăng ký lại.');
            navigate('/signup');
            return;
        }
        setEmail(registeredEmail);


    }, [navigate]);

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

    const startCountdown = () => {
        setCountdown(30);
        setCanResend(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await verifyOTP(email, values.otp);

            if (result.success) {
                toast.success(result.message);


                const password = localStorage.getItem('registerPassword');
                if (password) {
                    try {
                        const loginResult = await login({ email, password });
                        if (loginResult.success) {
                            try {
                                const walletResult = await createWallet();
                                if (walletResult.success) {
                                    toast.success("Tài khoản và ví của bạn đã được tạo thành công!");
                                } else {
                                    toast.warning("Tài khoản được tạo thành công nhưng không thể tạo ví. Bạn có thể tạo ví sau trong trang profile.");
                                }
                            } catch (walletError) {
                                console.error("Lỗi tạo ví:", walletError);
                                toast.warning("Tài khoản được tạo thành công nhưng không thể tạo ví. Bạn có thể tạo ví sau trong trang profile.");
                            }

                            // Xóa thông tin tạm thời
                            localStorage.removeItem('registerEmail');
                            localStorage.removeItem('registerPassword');

                            // Chuyển hướng đến trang chủ sau khi hoàn thành
                            setTimeout(() => {
                                navigate("/");
                            }, 2000);
                        } else {
                            // Nếu không thể đăng nhập tự động, chuyển về trang login
                            localStorage.removeItem('registerEmail');
                            localStorage.removeItem('registerPassword');
                            setTimeout(() => {
                                navigate("/login");
                            }, 1000);
                        }
                    } catch (loginError) {
                        console.error("Lỗi đăng nhập tự động:", loginError);
                        localStorage.removeItem('registerEmail');
                        localStorage.removeItem('registerPassword');
                        setTimeout(() => {
                            navigate("/login");
                        }, 1000);
                    }
                } else {
                    // Không có mật khẩu đã lưu, chuyển về trang login
                    localStorage.removeItem('registerEmail');
                    setTimeout(() => {
                        navigate("/login");
                    }, 1000);
                }
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi xác thực OTP!");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) {
            toast.warning(`Vui lòng đợi ${countdown} giây trước khi gửi lại OTP!`);
            return;
        }

        setLoading(true);
        try {
            const result = await resendOTP(email);

            if (result.success) {
                toast.success(result.message);
                // Bắt đầu đếm ngược sau khi gửi thành công
                startCountdown();
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Không thể gửi lại OTP!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <Card title="Nhập mã OTP" className="w-96">
                {email && (
                    <div className="mb-4 text-center">
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

                    <div className="text-center">
                        <Typography.Text type="secondary">
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
                                    Gửi lại sau {countdown}s
                                </span>
                            )}
                        </Typography.Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Otp;
