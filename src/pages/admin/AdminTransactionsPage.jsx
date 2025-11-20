import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Space, Spin, message, Table, Tag } from 'antd';
import { Line, Column, Pie } from '@ant-design/plots';
import { DollarOutlined, ShoppingCartOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/adminAPI';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AdminTransactionsPage() {
    const [loading, setLoading] = useState(false);
    const [viewType, setViewType] = useState('month'); // 'day', 'month', 'year', 'range'
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        avgTransactionValue: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, [viewType, selectedDate, dateRange]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let response;

            switch (viewType) {
                case 'day':
                    response = await adminAPI.getTransactionsByDate(
                        selectedDate.date(),
                        selectedDate.month() + 1,
                        selectedDate.year()
                    );
                    break;
                case 'month':
                    response = await adminAPI.getTransactionsByMonth(
                        selectedDate.month() + 1,
                        selectedDate.year()
                    );
                    break;
                case 'year':
                    response = await adminAPI.getTransactionsByYear(selectedDate.year());
                    break;
                case 'range':
                    response = await adminAPI.getTransactionsByRange(
                        dateRange[0].format('YYYY-MM-DD'),
                        dateRange[1].format('YYYY-MM-DD')
                    );
                    break;
                default:
                    response = await adminAPI.getTransactionsByMonth(
                        dayjs().month() + 1,
                        dayjs().year()
                    );
            }

            if (response.success) {
                const data = Array.isArray(response.data) ? response.data : [];
                const normalized = data.map(item => ({
                    transactionId: item.transactionId ?? item.TransactionId,
                    amount: item.amount ?? item.Amount ?? 0,
                    status: item.status ?? item.Status,
                    paymentMethod: item.paymentMethod ?? item.PaymentMethod,
                    createdAt: item.createdAt ?? item.CreatedAt,
                    buyerName: item.buyerName ?? item.BuyerName,
                    sellerName: item.sellerName ?? item.SellerName,
                    postTitle: item.postTitle ?? item.PostTitle
                }));

                setTransactions(normalized);
                calculateStatistics(normalized);
            } else {
                message.error(response.message || 'Không thể tải dữ liệu giao dịch');
            }
        } catch (error) {
            console.error('Fetch transactions error:', error);
            message.error('Có lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (data) => {
        const total = data.reduce((sum, t) => sum + (t.amount || 0), 0);
        const completed = data.filter(t => (t.status || '').toUpperCase() === 'COMPLETED' || (t.status || '').toUpperCase() === 'PAID');
        const pending = data.filter(t => (t.status || '').toUpperCase() === 'PENDING');

        setStatistics({
            totalRevenue: total,
            totalTransactions: data.length,
            completedTransactions: completed.length,
            pendingTransactions: pending.length,
            avgTransactionValue: data.length > 0 ? total / data.length : 0
        });
    };

    // Prepare chart data
    const getRevenueByDateData = () => {
        const grouped = {};
        transactions.forEach(t => {
            if (t.createdAt) {
                const date = dayjs(t.createdAt).format('YYYY-MM-DD');
                grouped[date] = (grouped[date] || 0) + (t.amount || 0);
            }
        });
        return Object.entries(grouped).map(([date, revenue]) => ({
            date,
            revenue
        })).sort((a, b) => a.date.localeCompare(b.date));
    };

    const getStatusData = () => {
        const statusCount = {};
        transactions.forEach(t => {
            const status = t.status || 'UNKNOWN';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        return Object.entries(statusCount).map(([status, count]) => ({
            status,
            count
        }));
    };

    const getPaymentMethodData = () => {
        const methodRevenue = {};
        transactions.forEach(t => {
            const method = t.paymentMethod || 'UNKNOWN';
            methodRevenue[method] = (methodRevenue[method] || 0) + (t.amount || 0);
        });
        return Object.entries(methodRevenue).map(([method, revenue]) => ({
            method,
            revenue
        }));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const lineConfig = {
        data: getRevenueByDateData(),
        xField: 'date',
        yField: 'revenue',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
        smooth: true,
    };

    const columnConfig = {
        data: getPaymentMethodData(),
        xField: 'method',
        yField: 'revenue',
        label: {
            position: 'top',
            style: {
                fill: '#000000',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
    };

    const pieConfig = {
        data: getStatusData(),
        angleField: 'count',
        colorField: 'status',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [{ type: 'element-active' }],
    };

    const tableColumns = [
        { title: 'Mã GD', dataIndex: 'transactionId', key: 'id', render: (id) => `#${id?.substring(0, 8)}...` },
        { title: 'Người mua', dataIndex: 'buyerName', key: 'buyer' },
        { title: 'Người bán', dataIndex: 'sellerName', key: 'seller' },
        { title: 'Sản phẩm', dataIndex: 'postTitle', key: 'post', render: (v) => v || '—' },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (v) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span>,
            sorter: (a, b) => a.amount - b.amount
        },
        { title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'payment' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const colors = {
                    COMPLETED: 'green',
                    PAID: 'green',
                    PENDING: 'orange',
                    CANCELLED: 'red',
                    FAILED: 'red'
                };
                return <Tag color={colors[s] || 'default'}>{s}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'date',
            render: d => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—',
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Thống kê Doanh thu</h1>
                <p className="text-gray-600">Phân tích doanh thu và giao dịch của hệ thống</p>
            </div>

            {/* Filter Controls */}
            <Card className="mb-6">
                <Space size="middle" wrap>
                    <Select value={viewType} onChange={setViewType} style={{ width: 150 }}>
                        <Option value="day">Theo ngày</Option>
                        <Option value="month">Theo tháng</Option>
                        <Option value="year">Theo năm</Option>
                        <Option value="range">Tùy chỉnh</Option>
                    </Select>

                    {viewType === 'day' && (
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            format="DD/MM/YYYY"
                        />
                    )}

                    {viewType === 'month' && (
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            picker="month"
                            format="MM/YYYY"
                        />
                    )}

                    {viewType === 'year' && (
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            picker="year"
                            format="YYYY"
                        />
                    )}

                    {viewType === 'range' && (
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                        />
                    )}
                </Space>
            </Card>

            <Spin spinning={loading}>
                {/* Statistics Cards */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={statistics.totalRevenue}
                                precision={0}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<DollarOutlined />}
                                suffix="VND"
                                formatter={(value) => `${value.toLocaleString()}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng giao dịch"
                                value={statistics.totalTransactions}
                                prefix={<ShoppingCartOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Hoàn thành"
                                value={statistics.completedTransactions}
                                prefix={<RiseOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Giá trị TB"
                                value={statistics.avgTransactionValue}
                                precision={0}
                                valueStyle={{ color: '#722ed1' }}
                                suffix="VND"
                                formatter={(value) => `${value.toLocaleString()}`}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} lg={16}>
                        <Card title="Doanh thu theo thời gian">
                            <Line {...lineConfig} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title="Phân bố trạng thái">
                            <Pie {...pieConfig} />
                        </Card>
                    </Col>
                </Row>

                {/* Transaction Table */}
                <Card title="Chi tiết giao dịch">
                    <Table
                        columns={tableColumns}
                        dataSource={transactions}
                        rowKey="transactionId"
                        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} giao dịch` }}
                        scroll={{ x: 1200 }}
                    />
                </Card>
            </Spin>
        </div>
    );
}
