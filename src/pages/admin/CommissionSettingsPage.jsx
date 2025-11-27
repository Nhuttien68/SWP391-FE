import { useState, useEffect } from 'react';
import { Card, Statistic, Button, InputNumber, DatePicker, message, Spin, Row, Col, Divider, Table } from 'antd';
import { DollarOutlined, PercentageOutlined, ReloadOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import { systemSettingsAPI } from '../../services/systemSettingsAPI';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function CommissionSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [currentRate, setCurrentRate] = useState(0);
    const [newRate, setNewRate] = useState(0);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month'),
        dayjs().endOf('day')
    ]);

    // Lấy tỷ lệ hoa hồng hiện tại
    const fetchCommissionRate = async () => {
        setLoading(true);
        try {
            const response = await systemSettingsAPI.getCommissionRate();
            if (response.success) {
                const rate = response.data?.CommissionRate ?? 0;
                setCurrentRate(rate);
                setNewRate(rate);
            } else {
                message.error(response.message || 'Không thể tải tỷ lệ hoa hồng');
            }
        } catch (error) {
            message.error('Lỗi khi tải tỷ lệ hoa hồng');
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật tỷ lệ hoa hồng
    const handleUpdateRate = async () => {
        if (newRate < 0 || newRate > 100) {
            message.error('Tỷ lệ hoa hồng phải từ 0% đến 100%');
            return;
        }

        if (newRate === currentRate) {
            message.info('Tỷ lệ hoa hồng không thay đổi');
            return;
        }

        setLoading(true);
        try {
            const response = await systemSettingsAPI.updateCommissionRate(newRate);
            if (response.success) {
                message.success(response.message || 'Cập nhật thành công');
                setCurrentRate(newRate);
            } else {
                message.error(response.message || 'Không thể cập nhật');
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật tỷ lệ hoa hồng');
        } finally {
            setLoading(false);
        }
    };

    // Lấy báo cáo hoa hồng
    const fetchCommissionReport = async () => {
        if (!dateRange || dateRange.length !== 2) {
            message.error('Vui lòng chọn khoảng thời gian');
            return;
        }

        setReportLoading(true);
        try {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const response = await systemSettingsAPI.getCommissionReport(startDate, endDate);
            if (response.success) {
                setReportData(response.data);
                message.success('Tải báo cáo thành công');
            } else {
                message.error(response.message || 'Không thể tải báo cáo');
            }
        } catch (error) {
            message.error('Lỗi khi tải báo cáo');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissionRate();
        fetchCommissionReport();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Hoa hồng</h1>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        fetchCommissionRate();
                        fetchCommissionReport();
                    }}
                >
                    Làm mới
                </Button>
            </div>

            {/* Cài đặt tỷ lệ hoa hồng */}
            <Card title="Cài đặt Tỷ lệ Hoa hồng" loading={loading}>
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        <Statistic
                            title="Tỷ lệ hiện tại"
                            value={currentRate}
                            precision={2}
                            suffix="%"

                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col xs={24} md={16}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tỷ lệ hoa hồng mới (%)
                                </label>
                                <InputNumber
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    precision={2}
                                    value={newRate}
                                    onChange={setNewRate}
                                    className="w-full"
                                    placeholder="Nhập tỷ lệ từ 0 đến 100"
                                />
                            </div>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleUpdateRate}
                                loading={loading}
                                disabled={newRate === currentRate}
                            >
                                Cập nhật tỷ lệ
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Báo cáo hoa hồng */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <FileTextOutlined />
                        <span>Báo cáo Hoa hồng</span>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                                Chọn khoảng thời gian
                            </label>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                                className="w-full"
                                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                            />
                        </div>
                        <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={fetchCommissionReport}
                            loading={reportLoading}
                        >
                            Xem báo cáo
                        </Button>
                    </div>

                    {reportLoading ? (
                        <div className="text-center py-8">
                            <Spin size="large" />
                        </div>
                    ) : reportData ? (
                        <>
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Tổng giao dịch"
                                            value={reportData.TotalTransactions || 0}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Tổng doanh thu"
                                            value={reportData.TotalRevenue || 0}
                                            precision={0}
                                            suffix="VNĐ"
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Tổng hoa hồng"
                                            value={reportData.TotalCommission || 0}
                                            precision={0}
                                            suffix="VNĐ"
                                            prefix={<DollarOutlined />}
                                            valueStyle={{ color: '#ff4d4f' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Seller nhận được"
                                            value={reportData.TotalSellerReceived || 0}
                                            precision={0}
                                            suffix="VNĐ"
                                            valueStyle={{ color: '#faad14' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Row gutter={16} className="mt-4">
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Statistic
                                            title="Tỷ lệ hoa hồng TB"
                                            value={reportData.AverageCommissionRate || 0}
                                            precision={2}
                                            suffix="%"
                                            valueStyle={{ color: '#722ed1' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Statistic
                                            title="% Hoa hồng/Doanh thu"
                                            value={reportData.CommissionPercentage || 0}
                                            precision={2}
                                            suffix="%"
                                            valueStyle={{ color: '#13c2c2' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">
                                    <strong>Kỳ báo cáo:</strong> {reportData.Period}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Chọn khoảng thời gian và nhấn "Xem báo cáo" để xem chi tiết
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
