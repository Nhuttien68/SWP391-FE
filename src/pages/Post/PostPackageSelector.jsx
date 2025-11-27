import { useState, useEffect } from 'react';
import { Card, Radio, Space, Typography, Spin, Alert, Tag, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { postPackageAPI } from '../../services/postPackageAPI';

const { Title, Text } = Typography;

const PostPackageSelector = ({ value, onChange, disabled = false }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await postPackageAPI.getAllPackages();

            if (response.success && response.data) {
                let packagesData = response.data;

                // Kiểm tra nếu items có nested data structure
                if (packagesData.length > 0 && packagesData[0].data) {
                    packagesData = packagesData.map(item => item.data);
                }

                // Lọc các gói đang active
                const activePackages = packagesData.filter(pkg => pkg.isActive);
                setPackages(activePackages);

                // Auto-select gói đầu tiên nếu chưa có selection
                if (!value && activePackages.length > 0 && onChange) {
                    onChange(activePackages[0].id);
                }
            } else {
                setError('Không thể tải danh sách gói đăng tin');
            }
        } catch (err) {
            console.error('Error fetching packages:', err);
            setError('Có lỗi xảy ra khi tải danh sách gói đăng tin');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const getPackageColor = (index) => {
        const colors = ['blue', 'green', 'purple', 'orange'];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">Đang tải danh sách gói đăng tin...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
            />
        );
    }

    if (packages.length === 0) {
        return (
            <Alert
                message="Chưa có gói đăng tin"
                description="Hiện tại chưa có gói đăng tin nào khả dụng. Vui lòng liên hệ quản trị viên."
                type="warning"
                showIcon
            />
        );
    }

    return (
        <div className="post-package-selector">
            <Space direction="vertical" size="middle" className="w-full">
                <div>
                    <Title level={4} className="!mb-2">
                        <CheckCircleOutlined className="mr-2 text-green-600" />
                        Chọn Gói Đăng Tin
                    </Title>
                    <Text type="secondary">
                        Chọn gói phù hợp với nhu cầu của bạn. Gói có thời gian dài sẽ giúp tin đăng hiển thị lâu hơn.
                    </Text>
                </div>

                <Radio.Group
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    className="w-full"
                    disabled={disabled}
                >
                    <Space direction="vertical" size="middle" className="w-full">
                        {packages.map((pkg, index) => (
                            <Card
                                key={pkg.id}
                                hoverable={!disabled}
                                className={`cursor-pointer transition-all ${value === pkg.id
                                    ? `border-${getPackageColor(index)}-500 border-2 bg-${getPackageColor(index)}-50 shadow-lg`
                                    : 'hover:border-gray-400'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !disabled && onChange && onChange(pkg.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <Radio value={pkg.id} disabled={disabled}>
                                        <Space direction="vertical" size="small">
                                            <Space>
                                                <Text strong className="text-lg">
                                                    {pkg.packageName}
                                                </Text>
                                                {value === pkg.id && (
                                                    <Tag color="success" icon={<CheckCircleOutlined />}>
                                                        Đã chọn
                                                    </Tag>
                                                )}
                                            </Space>

                                            <Space size="large" className="text-gray-600">
                                                <Space>
                                                    <ClockCircleOutlined />
                                                    <Text>
                                                        Thời hạn: <Text strong>{pkg.durationInDays} ngày</Text>
                                                    </Text>
                                                </Space>

                                                <Divider type="vertical" />

                                                <Space>
                                                    <DollarOutlined />
                                                    <Text>
                                                        Giá: <Text strong className="text-green-600">
                                                            {formatCurrency(pkg.price)}
                                                        </Text>
                                                    </Text>
                                                </Space>
                                            </Space>

                                            <Text type="secondary" className="text-sm">
                                                Tin đăng sẽ hiển thị trong {pkg.durationInDays} ngày kể từ khi được duyệt
                                            </Text>
                                        </Space>
                                    </Radio>
                                </div>
                            </Card>
                        ))}
                    </Space>
                </Radio.Group>
            </Space>
        </div>
    );
};

export default PostPackageSelector;
