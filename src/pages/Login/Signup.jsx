import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";

const { Title } = Typography;

const Signup = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Chuẩn bị data theo format API backend
            const registerData = {
                FullName: values.fullname,
                Email: values.email,
                Phone: values.phone,
                Password: values.password
            };

            const result = await register(registerData);

            if (result.success) {
                toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
                // Chuyển thẳng về trang đăng nhập
                navigate("/login");
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi đăng ký!");
        } finally {
            setLoading(false);
        }
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

                    {/* Email */}
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: 'email', message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input
                            placeholder="Nhập email của bạn"
                            className="text-lg"
                        />
                    </Form.Item>

                    {/* Số điện thoại */}
                    <Form.Item
                        label="Số điện thoại (tùy chọn)"
                        name="phone"
                        rules={[
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
                            { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự!" },
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
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Signup;
