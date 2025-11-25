import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Input, Typography, Space, Spin, message, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WalletOutlined, ReloadOutlined, DollarOutlined } from '@ant-design/icons';
import { withdrawalAPI } from '../../services/withdrawalAPI';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;
const { Text } = Typography;

export default function AdminWithdrawalPage() {
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, isAdmin } = useAuth();

    const [loading, setLoading] = useState(false);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0,
        pendingAmount: 0
    });

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!isAdmin) {
            navigate('/');
            return;
        }
    }, [isLoading, isAuthenticated, isAdmin, navigate]);

    useEffect(() => {
        fetchWithdrawalRequests();
    }, []);

    const fetchWithdrawalRequests = async () => {
        setLoading(true);
        try {
            const response = await withdrawalAPI.getAllWithdrawalRequests();
            if (response.success) {
                const data = response.data || [];

                // Normalize status to uppercase
                const normalizedData = data.map(item => ({
                    ...item,
                    status: (item.status || item.Status || '').toUpperCase()
                }));

                setWithdrawalRequests(normalizedData);
                calculateStatistics(normalizedData);
            } else {
                message.error(response.message || 'Không thể tải danh sách yêu cầu rút tiền');
            }
        } catch (error) {
            console.error('Fetch withdrawal requests error:', error);
            message.error('Có lỗi khi tải danh sách yêu cầu rút tiền');
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (data) => {
        const pending = data.filter(r => r.status === 'PENDING');
        const approved = data.filter(r => r.status === 'APPROVED');
        const rejected = data.filter(r => r.status === 'REJECTED');

        setStatistics({
            total: data.length,
            pending: pending.length,
            approved: approved.length,
            rejected: rejected.length,
            totalAmount: data.reduce((sum, r) => sum + (r.amount || 0), 0),
            pendingAmount: pending.reduce((sum, r) => sum + (r.amount || 0), 0)
        });
    };

    const handleApproveClick = (record) => {
        setSelectedWithdrawal(record);
        setAdminNote('');
        setApproveModalVisible(true);
    };

    const handleRejectClick = (record) => {
        setSelectedWithdrawal(record);
        setAdminNote('');
        setRejectModalVisible(true);
    };

    const handleApproveConfirm = async () => {
        if (!selectedWithdrawal) return;

        setLoading(true);
        try {
            const response = await withdrawalAPI.approveWithdrawal(selectedWithdrawal.withdrawalId, adminNote);
            if (response.success) {
                message.success('Đã phê duyệt yêu cầu rút tiền');
                setApproveModalVisible(false);
                setSelectedWithdrawal(null);
                setAdminNote('');
                fetchWithdrawalRequests();
            } else {
                message.error(response.message || 'Không thể phê duyệt yêu cầu');
            }
        } catch (error) {
            console.error('Approve withdrawal error:', error);
            message.error('Có lỗi khi phê duyệt yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectConfirm = async () => {
        if (!selectedWithdrawal) return;
        if (!adminNote.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }

        setLoading(true);
        try {
            const response = await withdrawalAPI.rejectWithdrawal(selectedWithdrawal.withdrawalId, adminNote);
            if (response.success) {
                message.success('Đã từ chối yêu cầu rút tiền');
                setRejectModalVisible(false);
                setSelectedWithdrawal(null);
                setAdminNote('');
                fetchWithdrawalRequests();
            } else {
                message.error(response.message || 'Không thể từ chối yêu cầu');
            }
        } catch (error) {
            console.error('Reject withdrawal error:', error);
            message.error('Có lỗi khi từ chối yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const columns = [
        {
            title: 'Mã YC',
            dataIndex: 'withdrawalId',
            key: 'withdrawalId',
            width: 100,
            render: (id) => `#${id?.substring(0, 8)}`,
        },
        {
            title: 'Người yêu cầu',
            dataIndex: 'userName',
            key: 'userName',
            render: (name, record) => (
                <div>
                    <div><Text strong>{name || 'N/A'}</Text></div>
                    <div className="text-xs text-gray-500">{record.userEmail || ''}</div>
                </div>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Text strong className="text-red-600">
                    {formatCurrency(amount)}
                </Text>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Thông tin ngân hàng',
            key: 'bank',
            width: 200,
            render: (_, record) => (
                <div className="text-sm">
                    <div><Text strong>{record.bankName}</Text></div>
                    <div className="text-gray-600">STK: {record.bankAccountNumber}</div>
                    <div className="text-gray-600">{record.bankAccountName}</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    PENDING: { color: 'orange', text: 'Chờ duyệt' },
                    APPROVED: { color: 'green', text: 'Đã duyệt' },
                    REJECTED: { color: 'red', text: 'Từ chối' },
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
            filters: [
                { text: 'Chờ duyệt', value: 'PENDING' },
                { text: 'Đã duyệt', value: 'APPROVED' },
                { text: 'Từ chối', value: 'REJECTED' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 150,
            render: (note) => note ? note : <Text type="secondary" className="italic">Trống</Text>,
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'requestedAt',
            key: 'requestedAt',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A',
            sorter: (a, b) => dayjs(a.requestedAt).unix() - dayjs(b.requestedAt).unix(),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 180,
            render: (_, record) => {
                if (record.status !== 'PENDING') {
                    return <Text type="secondary">—</Text>;
                }
                return (
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApproveClick(record)}
                        >
                            Duyệt
                        </Button>
                        <Button
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleRejectClick(record)}
                        >
                            Từ chối
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Quản lý yêu cầu rút tiền</h2>
                <p className="text-gray-600">Xử lý các yêu cầu rút tiền từ người dùng</p>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng yêu cầu"
                            value={statistics.total}
                            prefix={<WalletOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Chờ duyệt"
                            value={statistics.pending}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Số tiền chờ duyệt"
                            value={statistics.pendingAmount}
                            precision={0}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<DollarOutlined />}
                            suffix="VND"
                            formatter={(value) => `${value.toLocaleString()}`}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <Text type="secondary">
                            Hiển thị {withdrawalRequests.length} yêu cầu
                        </Text>
                    </div>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchWithdrawalRequests}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>

                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={withdrawalRequests}
                        rowKey="withdrawalId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} yêu cầu`
                        }}
                        scroll={{ x: 1400 }}
                    />
                </Spin>
            </Card>

            {/* Approve Modal */}
            <Modal
                title="Phê duyệt yêu cầu rút tiền"
                open={approveModalVisible}
                onOk={handleApproveConfirm}
                onCancel={() => {
                    setApproveModalVisible(false);
                    setSelectedWithdrawal(null);
                    setAdminNote('');
                }}
                okText="Phê duyệt"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                {selectedWithdrawal && (
                    <div className="space-y-4">
                        <div>
                            <Text strong>Người yêu cầu:</Text>
                            <div>{selectedWithdrawal.userName}</div>
                            <div className="text-sm text-gray-500">{selectedWithdrawal.userEmail}</div>
                        </div>
                        <div>
                            <Text strong>Số tiền:</Text>
                            <div className="text-lg text-red-600 font-semibold">
                                {formatCurrency(selectedWithdrawal.amount)}
                            </div>
                        </div>
                        <div>
                            <Text strong>Thông tin ngân hàng:</Text>
                            <div className="bg-gray-50 p-3 rounded mt-2">
                                <div><Text strong>{selectedWithdrawal.bankName}</Text></div>
                                <div>STK: {selectedWithdrawal.bankAccountNumber}</div>
                                <div>Chủ TK: {selectedWithdrawal.bankAccountName}</div>
                            </div>
                        </div>
                        {selectedWithdrawal.note && (
                            <div>
                                <Text strong>Ghi chú của user:</Text>
                                <div className="text-gray-600">{selectedWithdrawal.note}</div>
                            </div>
                        )}
                        <div>
                            <Text strong>Ghi chú của admin (tùy chọn):</Text>
                            <TextArea
                                rows={3}
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Nhập ghi chú nếu có..."
                                className="mt-2"
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <Text className="text-sm text-blue-800">
                                ℹ️ Khi phê duyệt, tiền sẽ được chuyển đến tài khoản ngân hàng của người dùng. Vui lòng kiểm tra kỹ thông tin trước khi phê duyệt.
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối yêu cầu rút tiền"
                open={rejectModalVisible}
                onOk={handleRejectConfirm}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setSelectedWithdrawal(null);
                    setAdminNote('');
                }}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                confirmLoading={loading}
            >
                {selectedWithdrawal && (
                    <div className="space-y-4">
                        <div>
                            <Text strong>Người yêu cầu:</Text>
                            <div>{selectedWithdrawal.userName}</div>
                            <div className="text-sm text-gray-500">{selectedWithdrawal.userEmail}</div>
                        </div>
                        <div>
                            <Text strong>Số tiền:</Text>
                            <div className="text-lg text-red-600 font-semibold">
                                {formatCurrency(selectedWithdrawal.amount)}
                            </div>
                        </div>
                        <div>
                            <Text strong className="text-red-600">Lý do từ chối (bắt buộc):</Text>
                            <TextArea
                                rows={3}
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                required
                                className="mt-2"
                            />
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <Text className="text-sm text-yellow-800">
                                ⚠️ Khi từ chối, số tiền sẽ được hoàn lại vào ví của người dùng.
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
