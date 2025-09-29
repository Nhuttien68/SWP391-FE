import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Signup = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = (values) => {
        console.log("Dữ liệu đăng ký:", values);
        // TODO: Gọi API đăng ký ở đây
        navigate("/otp");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-600">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-12">
                <Title level={2} className="text-center mb-8 text-[28px]">
                    Đăng Ký
                </Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    {/* Họ tên */}
                    <Form.Item
                        label="Họ và tên"
                        name="fullname"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                        <Input
                            placeholder="Nhập họ tên của bạn"
                            className="text-lg"
                        />
                    </Form.Item>

                    {/* Số điện thoại */}
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại"
                            className="text-lg"
                        />
                    </Form.Item>

                    {/* Mật khẩu */}
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            { min: 8, message: "Mật khẩu phải ít nhất 8 ký tự!" },
                        ]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu"
                            className="text-lg"
                        />
                    </Form.Item>

                    {/* Nút đăng ký */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="text-lg"
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Signup;
