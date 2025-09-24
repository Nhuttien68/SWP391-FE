
import { Form, Input, Button, message, Typography } from "antd";
import axios from "axios";
import './ForgotPassword.css'

const { Title } = Typography;

const ForgotPassword = () => {
    const onFinish = async (values) => {
        try {
            const res = await axios.post("http://localhost:5000/api/forgot-password", values);
            if (res.data.success) {
                message.success(res.data.message);
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            message.error("Lỗi kết nối server!");
        }
    };

    return (
        <div class="container">
            <div class="form">
                <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>Quên mật khẩu</Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="email" rules={[{ required: true, message: "Nhập email của bạn" }]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Gửi link đặt lại</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;
