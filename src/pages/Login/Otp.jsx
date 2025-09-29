import React from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Otp = () => {
    const navigate = useNavigate();

    // Debug log to ensure component renders
    console.log("OTP component rendered");

    const onFinish = (values) => {
        console.log("Mã OTP nhập:", values.otp);
        // TODO: Gọi API xác thực OTP
        message.success("Xác thực OTP thành công!");
        // Navigate to login after successful OTP verification
        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f0f2f5",
            }}
        >
            <Card title="Nhập mã OTP" style={{ width: 400 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Mã OTP"
                        name="otp"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã OTP!" },
                            { len: 6, message: "Mã OTP phải gồm 6 số!" },
                        ]}
                    >
                        <Input placeholder="Nhập mã OTP" maxLength={6} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Xác nhận
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Otp;
