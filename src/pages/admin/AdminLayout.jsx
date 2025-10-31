import { Layout, Menu } from "antd";
import {
    UserOutlined,
    FileTextOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    BarChartOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import UsersPage from "./UserPage";
import AdminPostsPage from "./AdminPostsPage";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
    const [selectedKey, setSelectedKey] = useState("users");

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
                                    { key: "wallets", label: "Wallets" },
                                ],
                            },
                            {
                                key: "posts",
                                icon: <FileTextOutlined />,
                                label: "Tin đăng & Specs",
                                children: [
                                    { key: "posts_list", label: "Posts" },
                                    { key: "vehicles", label: "Vehicles" },
                                    { key: "batteries", label: "Batteries" },
                                    { key: "brands", label: "Brands" },
                                ],
                            },
                            {
                                key: "auctions",
                                icon: <DollarOutlined />,
                                label: "Đấu giá & Giao dịch",
                                children: [
                                    { key: "auctions_list", label: "Auctions" },
                                    { key: "bids", label: "Auction Bids" },
                                    { key: "transactions", label: "Transactions" },
                                ],
                            },
                            {
                                key: "contracts",
                                icon: <FileTextOutlined />,
                                label: "Hợp đồng & Đánh giá",
                                children: [
                                    { key: "contracts_list", label: "Contracts" },
                                    { key: "reviews", label: "Reviews" },
                                ],
                            },
                            {
                                key: "favorites",
                                icon: <ShoppingCartOutlined />,
                                label: "Yêu thích & Giỏ hàng",
                                children: [
                                    { key: "favorites_list", label: "Favorites" },
                                    { key: "cart", label: "Shopping Cart" },
                                    { key: "cart_items", label: "Cart Items" },
                                ],
                            },
                            {
                                key: "statistics",
                                icon: <BarChartOutlined />,
                                label: "Thống kê",
                                children: [
                                    { key: "revenue", label: "Báo cáo doanh thu" },
                                    { key: "trends", label: "Xu hướng" },
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
                                <div className="text-white font-medium text-sm">Admin User</div>
                                <div className="text-gray-400 text-xs">admin@example.com</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Menu */}
                    <Menu
                        theme="dark"
                        mode="inline"
                        className="border-none bg-gray-800"
                        items={[
                            {
                                key: "profile",
                                icon: <UserOutlined className="text-blue-400" />,
                                label: (
                                    <Link to="/profile" className="text-white hover:text-blue-300 transition-colors">
                                        Hồ sơ cá nhân
                                    </Link>
                                ),
                                className: "hover:bg-gray-700"
                            },
                            {
                                key: "logout",
                                icon: <LogoutOutlined className="text-red-400" />,
                                label: (
                                    <Link to="/logout" className="text-white hover:text-red-300 transition-colors">
                                        Đăng xuất
                                    </Link>
                                ),
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
                    {selectedKey === "wallets" && <div>💳 Quản lý Wallets</div>}
                    {selectedKey === "posts_list" && <AdminPostsPage />}
                    {selectedKey === "vehicles" && <div>🚗 Quản lý Vehicles</div>}
                    {selectedKey === "auctions_list" && <div>🏷️ Quản lý Auctions</div>}
                    {selectedKey === "transactions" && <div>💰 Quản lý Transactions</div>}
                    {selectedKey === "revenue" && <div>📊 Báo cáo doanh thu</div>}
                    {selectedKey === "trends" && <div>📈 Xu hướng</div>}
                </Content>
            </Layout>
        </Layout>
    );
}
