import "./Login.css"
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
        <div className="wrapper">
            <div className="form-login">
                <Title level={2} style={{ textAlign: "center", marginBottom: "30px", fontSize: "28px", }}>
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
                            style={{ fontSize: "18px", }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}            >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            style={{ fontSize: "18px", }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block
                            style={{ fontSize: "18px" }}
                        >Đăng nhập
                        </Button>
                        <div style={{ textAlign: "right", marginTop: "10px" }}>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                    </Form.Item>
                </Form>

                {/* Divider với text */}
                <div className="divider-container">
                    <div className="divider-line"></div>
                    <span className="divider-text">Hoặc đăng nhập bằng</span>
                    <div className="divider-line"></div>
                </div>

                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        width={400}
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
