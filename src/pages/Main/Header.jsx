
import { Layout, Menu, Button, Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined, WalletOutlined, HistoryOutlined, SettingOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const { Header } = Layout;

const HeaderApp = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Menu dropdown cho user đã đăng nhập
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/profile?view=profile')
        },
        {
            key: 'wallet',
            icon: <WalletOutlined />,
            label: 'Quản lý ví',
            onClick: () => navigate('/profile?view=wallet')
        },
        {
            key: 'history',
            icon: <HistoryOutlined />,
            label: 'Lịch sử giao dịch',
            onClick: () => navigate('/profile?view=history')
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
            onClick: () => navigate('/profile?view=settings')
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout
        }
    ];

    return (
        <Header
            className="flex items-center justify-between bg-white shadow-md px-6 py-0"
        >
            {/* Logo */}
            <div className="text-xl font-bold text-blue-600">
                <Link to="/">EV_Marketplace</Link>
            </div>

            {/* Navigation Menu */}
            <Menu
                mode="horizontal"
                defaultSelectedKeys={["1"]}
                items={[
                    { key: "1", label: <Link to="/">Home</Link> },
                    { key: "2", label: <Link to="/about">About</Link> },
                    { key: "3", label: <Link to="/services">Services</Link> },
                    { key: "4", label: <Link to="/contact">Contact</Link> },
                ]}
                className="flex-1 ml-10"
            />

            {/* Auth Section */}
            <div className="flex gap-2.5 items-center">
                {true && (
                    <Link to="/admin">
                        <Button type="default" className="mr-3">
                            Quản lý bài đăng
                        </Button>
                    </Link>
                )}
                {isAuthenticated && (
                    <Link to="/createPost">
                        <Button type="primary" className="mr-3">
                            Tạo bài đăng
                        </Button>
                    </Link>
                )}
                {isAuthenticated ? (
                    // Hiển thị avatar và dropdown khi đã đăng nhập
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        arrow
                    >
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded">
                            <Avatar
                                size="default"
                                icon={<UserOutlined />}
                                src={user?.avatar} // Nếu có avatar URL
                            />
                            <span className="text-gray-700 font-medium">
                                {user?.fullName || user?.email || 'User'}
                            </span>
                        </div>
                    </Dropdown>
                ) : (
                    // Hiển thị Login/Signup khi chưa đăng nhập
                    <>
                        <Link to="/login">
                            <Button type="default">Đăng nhập</Button>
                        </Link>
                        <Link to="/register">
                            <Button type="primary">Đăng ký</Button>
                        </Link>
                    </>
                )}
            </div>
        </Header>
    );
};

export default HeaderApp;
