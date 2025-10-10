import { Form, Input, Button, Typography, Modal } from "antd";
import { UserOutlined, LockOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const { Title } = Typography;

const Login = () => {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Kiểm tra xem có phải từ trang đăng ký không
    const isFromRegister = searchParams.get('registered') === 'true';
    const registeredEmail = searchParams.get('email');

    // Tự động điền email nếu có từ trang đăng ký
    useEffect(() => {
        if (isFromRegister && registeredEmail) {
            form.setFieldsValue({
                email: registeredEmail
            });
            // Hiển thị welcome modal
            setShowWelcomeModal(true);
        }
    }, [isFromRegister, registeredEmail, form]);

    const onFinish = async (values) => {
        try {
            const result = await login(values);

            if (result.success) {
                toast.success('Đăng nhập thành công!');
                navigate("/home");
            } else {
                // Kiểm tra nếu tài khoản chưa kích hoạt
                if (result.message && result.message.includes("chưa được kích hoạt")) {
                    toast.warning("Tài khoản chưa được kích hoạt. Chuyển đến trang kích hoạt...");

                    // Lưu email để sử dụng ở trang kích hoạt
                    localStorage.setItem('pendingActivationEmail', values.email);

                    setTimeout(() => {
                        navigate("/activate-account", {
                            state: { email: values.email }
                        });
                    }, 1500);
                } else {
                    toast.error(result.message);
                }
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi đăng nhập!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-12">
                <Title level={2} className="text-center mb-8 text-[28px]">
                    Đăng Nhập
                </Title>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: 'email', message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                            className="text-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}            >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            className="text-lg"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="text-lg"
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                        <div className="text-right mt-2.5">
                            <Link to="/reset-password">Quên mật khẩu?</Link>
                        </div>
                    </Form.Item>
                </Form>
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Chưa có tài khoản?
                        <Link
                            to="/register"
                            className="text-blue-400 hover:text-blue-800 font-medium ml-1 transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>

            {/* Welcome Modal */}
            <Modal
                title={
                    <div className="text-center">
                        <InfoCircleOutlined className="text-green-500 text-2xl mr-2" />
                        <span className="text-green-600 font-semibold">Đăng ký thành công!</span>
                    </div>
                }
                open={showWelcomeModal}
                onOk={() => setShowWelcomeModal(false)}
                onCancel={() => setShowWelcomeModal(false)}
                okText="Hiểu rồi"
                cancelText="Đóng"
                centered
                width={500}
            >
                <div className="text-center py-4">
                    <p className="text-lg mb-4">Tài khoản của bạn đã được tạo thành công!</p>

                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="font-medium text-blue-800 mb-2">
                            💡 Hướng dẫn quan trọng:
                        </p>
                        <p className="text-blue-700">
                            Để sử dụng ví điện tử, bạn cần xác thực tài khoản trong phần
                            <span className="font-semibold"> "Quản lý ví" </span>
                            sau khi đăng nhập.
                        </p>
                    </div>

                    {registeredEmail && (
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-600">
                                Email đăng ký: <strong className="text-gray-800">{registeredEmail}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Login;
