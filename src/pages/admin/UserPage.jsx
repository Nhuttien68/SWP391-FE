import { Table, Tag, Button, Space, Select, Card, Statistic, Row, Col, message, Popconfirm } from "antd";
import { useState, useEffect } from "react";
import { UserOutlined, TeamOutlined, CrownOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
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
                    const list = Array.isArray(resp.data) ? resp.data : [];
                    const mapped = list.map(u => ({
                        id: u.userId || u.UserId,
                        name: u.fullName || u.FullName || 'N/A',
                        email: u.email || u.Email || 'N/A',
                        phone: u.phone || u.Phone || 'N/A',
                        role: u.role || u.Role || 'USER',
                        status: u.status || u.Status || 'INACTIVE',
                        createdAt: u.createdAt || u.CreatedAt,
                        // Lấy balance từ wallet được include trong User entity
                        balance: u.wallet?.balance || u.Wallet?.Balance || 0
                    }));
                    setUsers(mapped);
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


    const toggleActive = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const action = newStatus === 'INACTIVE' ? 'khóa' : 'mở khóa';

        try {
            setLoading(true);
            const response = await adminAPI.updateUserStatus(userId, newStatus);

            if (response.success) {
                message.success(`Đã ${action} người dùng thành công`);

                // Cập nhật state local
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, status: newStatus } : u
                ));
            } else {
                message.error(response.message || `Không thể ${action} người dùng`);
            }
        } catch (error) {
            console.error('Toggle user status error:', error);
            message.error(`Có lỗi khi ${action} người dùng`);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
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
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'gold' : 'blue'}>
                    {role === 'ADMIN' ? (
                        <><CrownOutlined /> {role}</>
                    ) : (
                        <><UserOutlined /> {role}</>
                    )}
                </Tag>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const isActive = (status || '').toUpperCase() === 'ACTIVE';
                return (
                    <Tag
                        color={isActive ? "green" : "red"}
                        className={`font-medium ${isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                    >
                        {isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                );
            },
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            render: (bal) => (
                <span className="font-semibold text-green-600">
                    {bal?.toLocaleString() || 0} VND
                </span>
            )
        },
        {
            title: "Hành động",
            key: "action",
            fixed: 'right',
            width: 150,
            render: (_, record) => {
                const isActive = (record.status || '').toUpperCase() === 'ACTIVE';
                const isAdmin = (record.role || '').toUpperCase() === 'ADMIN';

                // Không cho phép khóa tài khoản admin
                if (isAdmin) {
                    return <Tag color="gold">Quản trị viên</Tag>;
                }

                return (
                    <Popconfirm
                        title={isActive ? "Khóa người dùng?" : "Mở khóa người dùng?"}
                        description={isActive ? "Người dùng sẽ không thể đăng nhập sau khi bị khóa." : "Người dùng sẽ có thể đăng nhập lại."}
                        onConfirm={() => toggleActive(record.id, record.status)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        okButtonProps={{ danger: isActive }}
                    >
                        <Button
                            type={isActive ? "default" : "primary"}
                            danger={isActive}
                            icon={isActive ? <LockOutlined /> : <UnlockOutlined />}
                            size="small"
                        >
                            {isActive ? "Khóa" : "Mở khóa"}
                        </Button>
                    </Popconfirm>
                );
            }
        }
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
