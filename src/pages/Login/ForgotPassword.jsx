
import { Form, Input, Button, message, Typography } from "antd";
import axios from "axios";

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
        <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="w-96 bg-white p-10 rounded-xl shadow-2xl">
                <Title level={3} className="text-center mb-5">
                    Quên mật khẩu
                </Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: "Nhập email của bạn" }]}
                    >
                        <Input
                            placeholder="Nhập email"
                            className="p-2.5 text-lg"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="px-6 py-3 text-base h-12"
                        >
                            Gửi link đặt lại
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;
