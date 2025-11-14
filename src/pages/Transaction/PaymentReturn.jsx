import React, { useEffect, useState } from 'react';
import { Result, Button, Spin, Card, Steps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    WalletOutlined,
    HomeOutlined,
    ShoppingOutlined
} from '@ant-design/icons';

// Helper to parse query params
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const PaymentReturn = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        const responseCode = query.get('vnp_ResponseCode');
        const errorMessage = query.get('message'); // Lấy message lỗi từ backend
        const vnpAmount = query.get('vnp_Amount');
        const amountVND = vnpAmount ? parseInt(vnpAmount, 10) / 100 : 0;
        setAmount(amountVND);

        if (responseCode === '00' && !errorMessage) {
            // Chỉ thành công khi có code 00 VÀ KHÔNG có message lỗi
            setSuccess(true);
            setMessage('Nạp tiền thành công!');
        } else {
            setSuccess(false);
            setMessage(errorMessage || 'Thanh toán thất bại hoặc bị hủy.');
        }
        setLoading(false);
    }, [query]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        EV Marketplace
                    </h1>
                    <p className="text-gray-600">Nền tảng mua bán xe điện uy tín</p>
                </div>

                {/* Main Card */}
                <Card className="shadow-2xl rounded-2xl overflow-hidden border-0">
                    {/* Status Banner */}
                    <div className={`py-6 text-center ${success ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}>
                        {success ? (
                            <CheckCircleOutlined className="text-7xl text-white mb-4" />
                        ) : (
                            <CloseCircleOutlined className="text-7xl text-white mb-4" />
                        )}
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {success ? 'Giao dịch thành công!' : 'Giao dịch thất bại'}
                        </h2>
                        <p className="text-white text-lg opacity-90">
                            {success ? 'Tiền đã được cộng vào ví của bạn' : message}
                        </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="p-8">
                        {success && (
                            <>
                                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-gray-600 font-medium">Số tiền nạp:</span>
                                        <span className="text-3xl font-bold text-green-600">
                                            {amount.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 font-medium">Phương thức:</span>
                                        <span className="text-gray-800 font-semibold">VNPay</span>
                                    </div>
                                </div>

                                {/* Steps Guide */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Bước tiếp theo:</h3>
                                    <Steps
                                        direction="vertical"
                                        current={1}
                                        items={[
                                            {
                                                title: 'Nạp tiền thành công',
                                                description: 'Số dư đã được cập nhật vào ví',
                                                status: 'finish',
                                                icon: <CheckCircleOutlined />,
                                            },
                                            {
                                                title: 'Khám phá sản phẩm',
                                                description: 'Tìm kiếm và đặt cọc xe điện yêu thích',
                                                icon: <ShoppingOutlined />,
                                            },
                                            {
                                                title: 'Tham gia đấu giá',
                                                description: 'Sử dụng số dư để đấu giá các sản phẩm hot',
                                                icon: <WalletOutlined />,
                                            },
                                        ]}
                                    />
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <Button
                                size="large"
                                icon={<WalletOutlined />}
                                onClick={() => navigate('/wallet')}
                                className="h-12 font-semibold"
                            >
                                Quản lý ví
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/market')}
                                className="h-12 font-semibold bg-gradient-to-r from-blue-500 to-blue-600 border-0"
                            >
                                Khám phá sản phẩm
                            </Button>
                        </div>

                        {!success && (
                            <div className="mt-6 text-center">
                                <Button
                                    icon={<HomeOutlined />}
                                    onClick={() => navigate('/')}
                                    size="large"
                                    className="font-semibold"
                                >
                                    Về trang chủ
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Support Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-2">
                        Cần hỗ trợ? Liên hệ{' '}
                        <a href="mailto:support@ev-marketplace.vn" className="text-blue-600 hover:text-blue-700 font-semibold">
                            support@ev-marketplace.vn
                        </a>
                    </p>
                    <p className="text-gray-500 text-sm">
                        Hotline: 1900 xxxx | Làm việc 24/7
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentReturn;