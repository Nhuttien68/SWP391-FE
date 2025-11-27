import { Layout, Menu } from "antd";
import {
    UserOutlined,
    FileTextOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    BarChartOutlined,
    LogoutOutlined,
    PercentageOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UsersPage from "./UserPage";
import AdminPostsPage from "./AdminPostsPage";
import BrandsPage from "./BrandsPage";
import AdminAuctionsPage from "./AdminAuctionsPage";
import AdminTransactionsPage from "./AdminTransactionsPage";
import AdminWalletPage from "./AdminWalletPage";
import AdminWithdrawalPage from "./AdminWithdrawalPage";
import CommissionSettingsPage from "./CommissionSettingsPage";
import PostPackagePage from "./PostPackagePage";
import { useAuth } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, isAdmin, logout, user } = useAuth();

    const [selectedKey, setSelectedKey] = useState("users");

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            navigate('/login');
            return
        }

        if (!isAdmin) {
            navigate('/');
            return
        }
    }, [isLoading, isAuthenticated, isAdmin, navigate]);

    return (
        <Layout className="min-h-screen">
            {/* Sidebar */}
            <Sider width={240} theme="dark" className="relative">
                <div className="text-white text-center py-4 font-bold text-xl bg-gray-900 border-b border-gray-600">
                    🏥 Admin Panel
                </div>
                <div className="pb-32 overflow-y-auto h-full">
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={["users"]}
                        onClick={(e) => setSelectedKey(e.key)}
                        className="border-none"
                        items={[
                            {
                                key: "users",
                                icon: <UserOutlined />,
                                label: "Người dùng",
                                children: [
                                    { key: "users_list", label: "Users" },
                                    { key: "wallets", label: "Wallets of system" },

                                ],
                            },
                            {
                                key: "posts",
                                icon: <FileTextOutlined />,
                                label: "Tin đăng & Specs",
                                children: [
                                    { key: "posts_list", label: "Posts" },
                                    { key: "brands_list", label: "Brands" },
                                ],
                            },
                            {
                                key: "auctions",
                                icon: <DollarOutlined />,
                                label: " Giao dịch",
                                children: [
                                    { key: "transactions", label: "Transactions" },
                                    { key: "withdraw", label: "Withdraw" },
                                ],
                            },
                            {
                                key: "settings",
                                icon: <SettingOutlined />,
                                label: "Cài đặt",
                                children: [
                                    { key: "commission", label: "Hoa hồng" },
                                    { key: "packages", label: "Gói đăng bài" },
                                ],
                            },

                        ]}

                    />
                </div>

                {/* User Actions Section */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-600">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-600">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <UserOutlined className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">{user?.fullName}</div>
                                <div className="text-gray-400 text-xs">{user?.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Menu */}
                    <Menu
                        theme="dark"
                        mode="inline"
                        className="border-none bg-gray-800"
                        onClick={(e) => {
                            if (e.key === 'logout') {
                                handleLogout();
                            }
                        }}
                        items={[
                            {
                                key: "logout",
                                icon: <LogoutOutlined className="text-red-400" />,
                                label: "Đăng xuất",
                                className: "hover:bg-gray-700"
                            }
                        ]}
                    />
                </div>
            </Sider>

            {/* Content */}
            <Layout>
                <Content className="m-6 p-6 bg-white rounded-lg shadow">
                    {selectedKey === "users_list" && <UsersPage />}
                    {selectedKey === "wallets" && <AdminWalletPage />}
                    {selectedKey === "withdraw" && <AdminWithdrawalPage />}
                    {selectedKey === "posts_list" && <AdminPostsPage />}
                    {selectedKey === "brands_list" && <BrandsPage />}
                    {selectedKey === "auctions_list" && <AdminAuctionsPage />}
                    {selectedKey === "transactions" && <AdminTransactionsPage />}
                    {selectedKey === "commission" && <CommissionSettingsPage />}
                    {selectedKey === "packages" && <PostPackagePage />}
                </Content>
            </Layout>
        </Layout>
    );
}
