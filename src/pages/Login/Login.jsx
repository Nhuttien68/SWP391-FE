import "./Login.css"
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
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

    return (
        <div class="wrapper">
            <div class="form-login"          >
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
                            style={{ padding: '13px', fontSize: "18px", }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}            >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            style={{ padding: '13px', fontSize: "18px", }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block
                            style={{ padding: '13px', fontSize: "18px", }}
                        >Đăng nhập
                        </Button>
                        <div style={{ textAlign: "right", marginTop: "10px" }}>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                    </Form.Item>

                </Form>
            </div>

        </div>
    );
};

export default Login;
