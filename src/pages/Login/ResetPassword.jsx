import { Form, Input, Button, message, Typography } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const onFinish = async (values) => {
        try {
            const res = await axios.post("http://localhost:5000/api/reset-password", {
                token,
                newPassword: values.password
            });
            if (res.data.success) {
                message.success("Đặt lại mật khẩu thành công!");
                navigate("/login");
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            message.error("Lỗi kết nối server!");
        }
    };

    return (
        <div
            style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }
            }>
            <div
                style={{ width: "400px", background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
            >
                <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>Đặt lại mật khẩu</Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Nhập mật khẩu mới" }]}

                    >
                        <Input.Password placeholder="Mật khẩu mới"
                            style={{ padding: '10px', fontSize: '18px' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block
                            style={{ padding: '10px', fontSize: '18px', height: '48px' }}>Đặt lại</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
