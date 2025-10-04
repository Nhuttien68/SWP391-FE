import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDebounce, useDebounceCallback } from "../../hooks/useDebounce.js";

const { Title } = Typography;

const Login = () => {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    // State để lưu giá trị input
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    
    // Debounce giá trị input với delay 300ms
    const debouncedEmail = useDebounce(emailInput, 300);
    const debouncedPassword = useDebounce(passwordInput, 300);
    
    // Debounced validation callback
    const debouncedValidation = useDebounceCallback((fieldName, value) => {
        if (fieldName === 'email' && value) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                form.setFields([{
                    name: 'email',
                    errors: ['Email không hợp lệ!']
                }]);
            } else {
                form.setFields([{
                    name: 'email',
                    errors: []
                }]);
            }
        }
        
        if (fieldName === 'password' && value) {
            // Validate password length
            if (value.length < 6) {
                form.setFields([{
                    name: 'password',
                    errors: ['Mật khẩu phải có ít nhất 6 ký tự!']
                }]);
            } else {
                form.setFields([{
                    name: 'password',
                    errors: []
                }]);
            }
        }
    }, 500);

    // Effect để validate khi debounced value thay đổi
    useEffect(() => {
        if (debouncedEmail) {
            debouncedValidation('email', debouncedEmail);
        }
    }, [debouncedEmail, debouncedValidation]);

    useEffect(() => {
        if (debouncedPassword) {
            debouncedValidation('password', debouncedPassword);
        }
    }, [debouncedPassword, debouncedValidation]);

    const onFinish = async (values) => {
        try {
            const result = await login(values);

            if (result.success) {
                message.success(result.message);
                navigate("/dashboard"); // Chuyển hướng sang dashboard
            } else {
                message.error(result.message);
            }
        } catch (err) {
            message.error("Có lỗi xảy ra khi đăng nhập!");
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
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" }
                        ]}
                        validateStatus={form.getFieldError('email').length > 0 ? 'error' : ''}
                        help={form.getFieldError('email')[0]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                            className="text-lg"
                            onChange={(e) => setEmailInput(e.target.value)}
                            disabled={isLoading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                        validateStatus={form.getFieldError('password').length > 0 ? 'error' : ''}
                        help={form.getFieldError('password')[0]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            className="text-lg"
                            onChange={(e) => setPasswordInput(e.target.value)}
                            disabled={isLoading}
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
