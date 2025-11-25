
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Tooltip } from "antd";
import { UserOutlined, LogoutOutlined, WalletOutlined, SettingOutlined, ShoppingCartOutlined, ShoppingOutlined, HeartOutlined, FileTextOutlined, PlusOutlined, LoginOutlined, UserAddOutlined, MenuOutlined, DashboardOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState, useEffect, useRef } from "react";
import { cartAPI } from "../../services/cartAPI.js";

const { Header } = Layout;

const HeaderApp = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    // Whether header should use compact (mobile) layout. Determined by width/height ratio.
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchCartCount();
        } else {
            setCartCount(0);
        }
    }, [isAuthenticated, user]);

    // Listen for cart updates emitted by cartAPI so header count stays in sync
    useEffect(() => {
        const handler = (e) => {
            try {
                const count = e?.detail?.count;
                if (typeof count === 'number') setCartCount(count);
                else fetchCartCount();
            } catch (err) {
                fetchCartCount();
            }
        };

        window.addEventListener('cartUpdated', handler);
        return () => window.removeEventListener('cartUpdated', handler);
    }, []);

    const fetchCartCount = async () => {
        try {
            const response = await cartAPI.getCart();
            if (response.success) {
                const items = response.data?.data?.cartItems || response.data?.cartItems || [];
                setCartCount(items.length);
            }
        } catch (error) {
            console.error('Fetch cart count error:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Determine compact mode based on width/height ratio.
    useEffect(() => {
        const RATIO_THRESHOLD = 1.6; // width/height ratios below this will enable compact header

        const evaluate = () => {
            try {
                const w = window.innerWidth || document.documentElement.clientWidth;
                const h = window.innerHeight || document.documentElement.clientHeight;
                if (!w || !h) return;
                const ratio = w / h;
                setIsCompact(ratio < RATIO_THRESHOLD);
            } catch (e) {
                // ignore
            }
        };

        evaluate();
        window.addEventListener('resize', evaluate);
        window.addEventListener('orientationchange', evaluate);
        return () => {
            window.removeEventListener('resize', evaluate);
            window.removeEventListener('orientationchange', evaluate);
        };
    }, []);

    // Overflow handling for action buttons: measure available width and move excess into More menu
    const actionsContainerRef = useRef(null);
    const actionButtonRefs = useRef({});
    const [visibleActionsCount, setVisibleActionsCount] = useState(null);

    const actionsList = [
        { key: 'posts', label: 'Bài đăng', icon: <FileTextOutlined />, to: '/posts' },
        { key: 'favorites', label: 'Yêu thích', icon: <HeartOutlined />, to: '/favorites' },
        { key: 'cart', label: 'Giỏ hàng', icon: <ShoppingCartOutlined />, to: '/cart', badge: cartCount },
        { key: 'wallet', label: 'Ví', icon: <WalletOutlined />, to: '/wallet' },
    ];

    useEffect(() => {
        const measure = () => {
            try {
                const container = actionsContainerRef.current;
                if (!container) return;
                const containerWidth = container.clientWidth;
                // measure each button width (including margin approx)
                const widths = actionsList.map(a => {
                    const el = actionButtonRefs.current[a.key];
                    if (!el) return 0;
                    return el.offsetWidth + 8; // small gap allowance
                });

                let sum = 0;
                let count = widths.length;
                for (let i = 0; i < widths.length; i++) {
                    sum += widths[i];
                    if (sum > containerWidth) {
                        count = i; break;
                    }
                }
                setVisibleActionsCount(count);
            } catch (e) {
                // ignore
            }
        };

        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
        // recompute when cartCount or auth changes which may affect labels
    }, [cartCount, isAuthenticated]);

    // Menu dropdown cho user đã đăng nhập
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/profile')
        },
        {
            key: 'wallet',
            icon: <WalletOutlined />,
            label: 'Quản lý ví',
            onClick: () => navigate('/wallet')
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý đơn hàng',
            onClick: () => navigate('/orders')
        },
        ...(isAdmin ? [{
            key: 'admin',
            icon: <DashboardOutlined />,
            label: 'Quản trị hệ thống',
            onClick: () => navigate('/admin')
        }] : []),
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
            onClick: () => navigate('/settings')
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

    // derive active route flags from location so header highlights update on page change
    const path = location?.pathname || '';
    // Treat /compare as part of market so Compare page highlights Market nav
    const navSelectedKey = path === '/' || path === ''
        ? '1'
        : (path.startsWith('/market') || path.startsWith('/post') || path.startsWith('/compare') ? 'market' 
        : (path.startsWith('/auction') ? 'auction' : ''));

    const isPostsActive = path.startsWith('/posts');
    const isFavoritesActive = path.startsWith('/favorites');
    const isCartActive = path.startsWith('/cart') || path.startsWith('/checkout');
    const isWalletActive = path.startsWith('/wallet');
    const isAdminActive = path.startsWith('/admin');
    const isCreatePostActive = path.startsWith('/createPost');

    return (
        <Header
            className="flex items-center justify-between bg-white shadow-md px-6 py-0"
        >
            {/* Logo */}
            <div className="text-xl font-bold text-blue-600">
                <Link to="/">EV_Marketplace</Link>
            </div>

            {/* Navigation Menu */}
            {/* Navigation: show horizontal menu when not compact, otherwise show a mobile dropdown */}
            {!isCompact ? (
                <div className="flex-1 ml-10">
                    <Menu
                        mode="horizontal"
                        selectedKeys={navSelectedKey ? [navSelectedKey] : []}
                        items={[
                            { key: "1", label: <Link to="/">Trang chủ</Link> },
                            { key: "market", label: <Link to="/market">Chợ</Link> },
                            { key: "auction", label: <Link to="/auction">Đấu giá</Link> },
                        ]}
                    />
                </div>
            ) : (
                <div>
                    <Dropdown
                        menu={{
                            items: [
                                { key: "1", label: <Link to="/">Trang chủ</Link> },
                                { key: "market", label: <Link to="/market">Chợ xe điện</Link> },
                                { key: "auction", label: <Link to="/auction">Đấu giá</Link> },
                            ]
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<MenuOutlined />} />
                    </Dropdown>
                </div>
            )}
            {/* Auth Section */}
            <div className="flex gap-2.5 items-center">
                {/* Quản lý tin - hiện cho tất cả user đã đăng nhập */}
                {isAuthenticated && (
                    <Link to="/posts">
                        <Button type={isPostsActive ? 'primary' : 'default'} className="mr-3">
                            Quản lý tin
                        </Button>
                    </Link>
                )}

                {/* Bài đăng yêu thích */}
                {isAuthenticated && (
                    <Link to="/favorites">
                        <Tooltip title="Bài đăng yêu thích">
                            <Button
                                type={isFavoritesActive ? 'primary' : 'text'}
                                icon={<HeartOutlined style={{ fontSize: '20px', color: isFavoritesActive ? undefined : '#ff4d4f' }} />}
                                className="mr-2"
                            />
                        </Tooltip>
                    </Link>
                )}

                {/* Giỏ hàng*/}
                {isAuthenticated && (
                    <Link to="/cart">
                        <Tooltip title="Giỏ hàng">
                            <Badge count={cartCount} offset={[0, 0]} size="small">
                                <Button
                                    type={isCartActive ? 'primary' : 'text'}
                                    icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
                                    className="mr-2"
                                />
                            </Badge>
                        </Tooltip>
                    </Link>
                )}

                {/* Admin button */}
                {isAdmin && (
                    <Link to="/admin">
                        <Button type={isAdminActive ? 'primary' : 'default'} className="mr-3">
                            Admin
                        </Button>
                    </Link>
                )}


                {isAuthenticated && (
                    <Link to={isAuthenticated ? "/createPost" : "/login"}>
                        <Button type={isCreatePostActive ? 'primary' : 'primary'} className="mr-3">Đăng tin</Button>
                    </Link>
                )}

                {/* When not authenticated, show compact login/register icons */}
                {!isAuthenticated && (
                    <>
                        <Link to="/login">
                            <Button type="default" className="mr-2">
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button type="primary">
                                Đăng ký
                            </Button>
                        </Link>
                    </>
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

                            <span className="hidden sm:inline-block font-medium text-sm">
                                {user?.fullName || user?.email || ''}
                            </span>
                        </div>
                    </Dropdown>
                ) : (
                    // unauthenticated login/register icons shown above
                    null
                )}
            </div>
        </Header>
    );
};

export default HeaderApp;
