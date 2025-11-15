import { Table, Tag, Button, Space, Select, Card, Statistic, Row, Col, message } from "antd";
import { useState, useEffect } from "react";
import { UserOutlined, TeamOutlined, CrownOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { adminAPI } from '../../services/adminAPI';

const { Option } = Select;

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tính toán thống kê
    const totalUsers = users.length;
    const activeUsers = users.filter(u => (u.status || '').toUpperCase() === 'ACTIVE').length;
    const adminUsers = users.filter(u => (u.role || '').toUpperCase() === "ADMIN").length;

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const resp = await adminAPI.getAllUsers();
                if (resp.success) {
                    // resp.data should be an array thanks to adminAPI normalization
                    const raw = resp.data ?? resp;
                    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.Data) ? raw.Data : []);
                    if (!Array.isArray(list)) {
                        console.error('Unexpected users payload', raw);
                        message.error('Dữ liệu người dùng không hợp lệ');
                    } else {
                        const mapped = list.map(u => ({
                            id: u.userId || u.UserId || (u.UserId ? u.UserId.toString() : undefined) || (u.userId ? u.userId.toString() : undefined),
                            name: u.fullName || u.FullName || u.fullName || u.Fullname || u.FullName,
                            email: u.email || u.Email,
                            role: u.role || u.Role || 'USER',
                            status: u.status || u.Status || 'INACTIVE',
                            phone: u.phone || u.Phone,
                            balance: u.walletBalance || 0
                        }));
                        setUsers(mapped);
                    }
                } else {
                    message.error(resp.message || 'Không thể lấy danh sách người dùng');
                }
            } catch (error) {
                console.error('Load users error:', error);
                message.error('Có lỗi khi tải danh sách người dùng');
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    // NOTE: backend currently exposes only read endpoints for users under AdminController.
    // Actions like toggling status or changing role are not available, so we keep UI read-only.
    const toggleActive = (id) => {
        toast.info('Thao tác này không được hỗ trợ bởi API hiện tại');
    };

    const changeRole = (id, role) => {
        toast.info('Thao tác này không được hỗ trợ bởi API hiện tại');
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            className: "font-semibold text-gray-700",
            width: 80
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            className: "font-medium text-gray-800",
            render: (name) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserOutlined className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">{name}</span>
                </div>
            )
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            className: "text-gray-600",
            render: (email) => (
                <span className="text-sm text-gray-600">{email}</span>
            )
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role, record) => (
                <Select
                    value={role}
                    className="w-32"
                    onChange={(val) => changeRole(record.id, val)}
                    size="small"
                >
                    <Option value="Member">
                        <div className="flex items-center space-x-1">
                            <TeamOutlined className="text-blue-500" />
                            <span>Member</span>
                        </div>
                    </Option>
                    <Option value="Admin">
                        <div className="flex items-center space-x-1">
                            <CrownOutlined className="text-yellow-500" />
                            <span>Admin</span>
                        </div>
                    </Option>
                </Select>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (active) => (
                <Tag
                    color={active ? "green" : "red"}
                    className={`font-medium ${active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                >
                    {active ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            render: (bal) => (
                <span className="font-semibold text-green-600">
                    {bal.toLocaleString()} VND
                </span>
            )
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type={record.is_active ? "default" : "primary"}
                        size="small"
                        className={`font-medium transition-all duration-200 ${record.is_active
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                            : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300"
                            }`}
                        onClick={() => toggleActive(record.id)}
                    >
                        {record.is_active ? "Khóa" : "Phê duyệt"}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Người dùng</h1>
                <p className="text-gray-600">Quản lý thông tin và phân quyền người dùng trong hệ thống</p>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[12, 12]} className="mb-6">
                <Col xs={24} sm={8} md={8}>
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" size="small">
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">Tổng người dùng</span>}
                            value={totalUsers}
                            prefix={<TeamOutlined className="text-white text-sm" />}
                            valueStyle={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} md={8}>
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" size="small">
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">Người dùng hoạt động</span>}
                            value={activeUsers}
                            prefix={<UserOutlined className="text-white text-sm" />}
                            valueStyle={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} md={8}>
                    <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" size="small">
                        <Statistic
                            title={<span className="text-white/90 font-medium text-xs">Quản trị viên</span>}
                            value={adminUsers}
                            prefix={<CrownOutlined className="text-white text-sm" />}
                            valueStyle={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Table */}
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <TeamOutlined className="mr-2 text-blue-600" />
                        Danh sách người dùng
                    </h2>
                </div>
                <div className="p-6">
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        loading={loading}
                        className="custom-table"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `Hiển thị ${range[0]}-${range[1]} trong ${total} người dùng`,
                            className: "mt-4"
                        }}
                        scroll={{ x: 800 }}
                    />
                </div>
            </Card>
        </div>
    );
}
