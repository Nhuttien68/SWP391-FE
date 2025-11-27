import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert, Divider, Spin, Typography } from 'antd';
import { InfoCircleOutlined, PercentageOutlined, DollarOutlined } from '@ant-design/icons';
import { systemSettingsAPI } from '../services/systemSettingsAPI';

const { Title, Paragraph } = Typography;

/**
 * Trang thông tin về phí hoa hồng dành cho người dùng
 */
const CommissionInfoPage = () => {
    const [commissionRate, setCommissionRate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommissionRate();
    }, []);

    const fetchCommissionRate = async () => {
        setLoading(true);
        try {
            const response = await systemSettingsAPI.getCommissionRate();
            console.log('Commission rate response:', response);
            if (response.success) {
                setCommissionRate(response.data?.commissionRate ?? response.data?.CommissionRate ?? 0);
            }
        } catch (error) {
            console.error('Fetch commission rate error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const exampleCalculations = [
        { price: 10000000, label: '10 triệu' },
        { price: 50000000, label: '50 triệu' },
        { price: 100000000, label: '100 triệu' },
        { price: 500000000, label: '500 triệu' },
    ];

    const calculateCommission = (price) => {
        return Math.round(price * commissionRate / 100);
    };

    const calculateSellerReceived = (price) => {
        return price - calculateCommission(price);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <Title level={2}>
                        <PercentageOutlined className="mr-3" />
                        Chính sách Phí giao dịch
                    </Title>
                    <Paragraph className="text-lg text-gray-600">
                        Minh bạch và công bằng cho mọi giao dịch trên EV Marketplace
                    </Paragraph>
                </div>

                {/* Current Rate Card */}
                <Card className="mb-6 shadow-lg">
                    <div className="text-center py-6">
                        <Title level={3} className="mb-4">Phí hoa hồng hiện tại</Title>
                        <Statistic
                            value={commissionRate}
                            precision={2}
                            suffix="%"
                            valueStyle={{
                                fontSize: '48px',
                                fontWeight: 'bold',
                                color: '#1890ff'
                            }}
                        />
                        <Paragraph className="text-gray-600 mt-4">
                            Được áp dụng cho mọi giao dịch thành công trên nền tảng
                        </Paragraph>
                    </div>
                </Card>

                {/* Explanation */}
                <Card className="mb-6" title={<><InfoCircleOutlined className="mr-2" />Phí hoa hồng là gì?</>}>
                    <Paragraph>
                        <strong>Phí hoa hồng</strong> là khoản phí mà EV Marketplace thu từ mỗi giao dịch thành công
                        để duy trì và phát triển nền tảng. Phí này được tính trên tổng giá trị giao dịch và được
                        trừ trực tiếp từ số tiền người bán nhận được.
                    </Paragraph>
                    <Alert
                        message="Lưu ý quan trọng"
                        description={
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Người mua thanh toán <strong>100%</strong> giá trị sản phẩm</li>
                                <li>Người bán nhận <strong>{(100 - commissionRate).toFixed(2)}%</strong> sau khi trừ phí hoa hồng</li>
                                <li>Phí hoa hồng được tính tự động khi giao dịch thành công</li>
                                <li>Không có phí ẩn hoặc phí phát sinh thêm</li>
                            </ul>
                        }
                        type="info"
                        showIcon
                        className="mt-4"
                    />
                </Card>

                {/* Calculation Examples */}
                <Card
                    className="mb-6"
                    title={<><DollarOutlined className="mr-2" />Ví dụ tính phí</>}
                >
                    <Row gutter={[16, 16]}>
                        {exampleCalculations.map((example, index) => (
                            <Col xs={24} sm={12} lg={6} key={index}>
                                <Card className="bg-gray-50">
                                    <div className="text-center">
                                        <Title level={5} className="!mb-2">
                                            Giá bán: {example.label}
                                        </Title>
                                        <Divider className="my-3" />
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Giá bán:</span>
                                                <span className="font-semibold">
                                                    {formatCurrency(example.price)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-orange-600">
                                                <span>Phí ({commissionRate}%):</span>
                                                <span className="font-semibold">
                                                    -{formatCurrency(calculateCommission(example.price))}
                                                </span>
                                            </div>
                                            <Divider className="my-2" />
                                            <div className="flex justify-between text-blue-600">
                                                <span className="font-medium">Seller nhận:</span>
                                                <span className="font-bold">
                                                    {formatCurrency(calculateSellerReceived(example.price))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>

                {/* Benefits */}
                <Card title={<><InfoCircleOutlined className="mr-2" />Phí hoa hồng được dùng để</>}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                                        <InfoCircleOutlined className="text-blue-600" />
                                    </div>
                                    <div>
                                        <Title level={5} className="!mb-1">Duy trì hệ thống</Title>
                                        <Paragraph className="text-gray-600 !mb-0">
                                            Đảm bảo nền tảng hoạt động ổn định, an toàn 24/7
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                                        <InfoCircleOutlined className="text-green-600" />
                                    </div>
                                    <div>
                                        <Title level={5} className="!mb-1">Bảo vệ giao dịch</Title>
                                        <Paragraph className="text-gray-600 !mb-0">
                                            Hệ thống thanh toán an toàn và bảo mật thông tin
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                                        <InfoCircleOutlined className="text-purple-600" />
                                    </div>
                                    <div>
                                        <Title level={5} className="!mb-1">Phát triển tính năng</Title>
                                        <Paragraph className="text-gray-600 !mb-0">
                                            Cải thiện trải nghiệm và bổ sung tính năng mới
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-orange-100 p-2 rounded-full mr-3 mt-1">
                                        <InfoCircleOutlined className="text-orange-600" />
                                    </div>
                                    <div>
                                        <Title level={5} className="!mb-1">Hỗ trợ khách hàng</Title>
                                        <Paragraph className="text-gray-600 !mb-0">
                                            Đội ngũ chăm sóc khách hàng chuyên nghiệp
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* FAQ */}
                <Card className="mt-6" title="Câu hỏi thường gặp">
                    <div className="space-y-4">
                        <div>
                            <Title level={5}>Khi nào phí hoa hồng được trừ?</Title>
                            <Paragraph className="text-gray-600">
                                Phí hoa hồng được tự động trừ ngay khi giao dịch được xác nhận thành công.
                            </Paragraph>
                        </div>
                        <Divider />
                        <div>
                            <Title level={5}>Tôi có thể thương lượng phí hoa hồng không?</Title>
                            <Paragraph className="text-gray-600">
                                Phí hoa hồng là cố định và áp dụng công bằng cho tất cả người dùng.
                                Không có trường hợp ngoại lệ hoặc thương lượng.
                            </Paragraph>
                        </div>
                        <Divider />
                        <div>
                            <Title level={5}>Người mua có phải trả phí không?</Title>
                            <Paragraph className="text-gray-600">
                                Không. Người mua chỉ thanh toán đúng giá sản phẩm.
                                Phí hoa hồng được trừ từ phần tiền người bán nhận được.
                            </Paragraph>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CommissionInfoPage;
