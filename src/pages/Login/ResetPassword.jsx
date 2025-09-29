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
        <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="w-96 bg-white p-10 rounded-xl shadow-2xl">
                <Title level={3} className="text-center mb-5">
                    Đặt lại mật khẩu
                </Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Nhập mật khẩu mới" }]}
                    >
                        <Input.Password
                            placeholder="Mật khẩu mới"
                            className="p-2.5 text-lg"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="p-2.5 text-lg h-12"
                        >
                            Đặt lại
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
