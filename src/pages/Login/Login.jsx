import { Form, Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext.jsx";

const { Title } = Typography;

const Login = () => {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const result = await login(values);

            if (result.success) {
                toast.success('Đăng nhập thành công!');
                navigate("/home");
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi đăng nhập!");
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // TODO: Implement Google OAuth backend endpoint
            toast.info("Tính năng đăng nhập Google đang được phát triển!");
        } catch (err) {
            toast.error("Lỗi đăng nhập Google!");
        }
    };

    const handleGoogleError = () => {
        toast.error("Đăng nhập Google thất bại!");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-12">
                <Title level={2} className="text-center mb-8 text-[28px]">
                    Đăng Nhập
                </Title>
                <Form
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


                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm font-medium">
                        Hoặc đăng nhập bằng
                    </span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        width={400}
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        useOneTap={false}
                    />
                </div>


                {/* Sign up link */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Chưa có tài khoản?
                        <Link
                            to="/signup"
                            className="text-blue-400 hover:text-blue-800 font-medium ml-1 transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
