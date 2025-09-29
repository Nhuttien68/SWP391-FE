import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const { Title } = Typography;

const Login = () => {
    const onFinish = async (values) => {
        try {
            const res = await axios.post("http://localhost:5000/api/login", values);
            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                message.success("Đăng nhập thành công!");
                // chuyển hướng sang dashboard
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            message.error("Lỗi kết nối server!");
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log("Google Token:", credentialResponse.credential);

            // Gửi Google token về backend để xác thực
            const res = await axios.post("http://localhost:5000/api/google-login", {
                googleToken: credentialResponse.credential
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                message.success("Đăng nhập Google thành công!");
                // chuyển hướng sang dashboard
            } else {
                message.error(res.data.message || "Đăng nhập Google thất bại!");
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            message.error("Lỗi đăng nhập Google!");
        }
    };

    const handleGoogleError = () => {
        console.log("Google Login Failed");
        message.error("Đăng nhập Google thất bại!");
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
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}

                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Tên đăng nhập"
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
                        >
                            Đăng nhập
                        </Button>
                        <div className="text-right mt-2.5">
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                    </Form.Item>
                </Form>

                {/* Divider với text */}
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
