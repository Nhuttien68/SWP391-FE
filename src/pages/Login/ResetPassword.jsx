import { Form, Input, Button, Typography, Steps } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";

const { Title, Text } = Typography;
const { Step } = Steps;

const ResetPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [email, setEmail] = useState('');
    const { forgotPassword, changePassword } = useAuth();

    // Bước 1: Gửi OTP để reset password
    const onSendOTP = async (values) => {
        setLoading(true);
        try {
            const result = await forgotPassword(values.email);

            if (result.success) {
                toast.success("Mã OTP đã được gửi đến email của bạn!");
                setEmail(values.email);
                setCurrentStep(1);
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi gửi OTP!");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Xác thực OTP và đổi mật khẩu
    const onResetPassword = async (values) => {
        setLoading(true);
        try {
            const changePasswordData = {
                email: email,
                otp: values.otp,
                newPassWord: values.newPassword
            };

            const result = await changePassword(changePasswordData);

            if (result.success) {
                toast.success("Đặt lại mật khẩu thành công!");
                navigate("/login");
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi đặt lại mật khẩu!");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Nhập Email',
            description: 'Gửi mã OTP'
        },
        {
            title: 'Xác thực OTP',
            description: 'Đặt mật khẩu mới'
        }
    ];

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="w-96 bg-white p-10 rounded-xl shadow-2xl">
                <Title level={3} className="text-center mb-5">
                    Đặt lại mật khẩu
                </Title>

                <Steps current={currentStep} className="mb-8">
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} description={item.description} />
                    ))}
                </Steps>

                {/* Bước 1: Nhập email để gửi OTP */}
                {currentStep === 0 && (
                    <Form layout="vertical" onFinish={onSendOTP}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email!" },
                                { type: 'email', message: "Email không hợp lệ!" }
                            ]}
                        >
                            <Input
                                placeholder="Nhập email của bạn"
                                className="p-2.5 text-lg"
                                disabled={loading}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                className="p-2.5 text-lg h-12"
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? "Đang gửi..." : "Gửi mã OTP"}
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {/* Bước 2: Nhập OTP và mật khẩu mới */}
                {currentStep === 1 && (
                    <div>
                        <div className="text-center mb-6">
                            <Text className="text-gray-600">
                                Mã OTP đã được gửi đến: <strong>{email}</strong>
                            </Text>
                        </div>

                        <Form layout="vertical" onFinish={onResetPassword}>
                            <Form.Item
                                name="otp"
                                label="Mã OTP"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mã OTP!" },
                                    { len: 6, message: "Mã OTP phải có 6 ký tự!" }
                                ]}
                            >
                                <Input
                                    placeholder="Nhập mã OTP"
                                    className="p-2.5 text-lg"
                                    maxLength={6}
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                                    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu mới"
                                    className="p-2.5 text-lg"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="p-2.5 text-lg"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    className="p-2.5 text-lg h-12"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                                </Button>
                            </Form.Item>

                            <div className="text-center mt-4">
                                <Button
                                    type="link"
                                    onClick={() => setCurrentStep(0)}
                                    disabled={loading}
                                >
                                    ← Quay lại nhập email
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
