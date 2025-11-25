import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Row,
    Col,
    Input,
    Select,
    Button,
    Typography,
    Spin,
    Empty,
    Pagination,
    Space,
    message,
    Card,
    Tag,
    Badge,
    Carousel,
} from 'antd';
import {
    SearchOutlined,
    CarOutlined,
    FireOutlined,
    ThunderboltOutlined,
    HeartOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    SafetyOutlined,
    BgColorsOutlined,
    TeamOutlined,
    LockOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import PostCard from '../Post/PostCard';
import { postAPI } from '../../services/postAPI';
import { brandAPI } from '../../services/brandAPI';

const { Title, Text } = Typography;
const { Option } = Select;

const quickFilters = [
    { label: 'Bán chạy', icon: <FireOutlined /> },
    { label: 'Giá tốt', icon: <DollarOutlined /> },
    { label: 'Mới nhất', icon: <ClockCircleOutlined /> },
    { label: 'Yêu thích', icon: <HeartOutlined /> },
];

const highlightCategories = [
    { title: 'Xe điện', icon: <CarOutlined style={{ fontSize: '48px' }} />, count: 234, color: 'blue' },
    { title: 'Pin xe điện', icon: <ThunderboltOutlined style={{ fontSize: '48px' }} />, count: 156, color: 'green' },
    { title: 'Đấu giá', icon: <FireOutlined style={{ fontSize: '48px' }} />, count: 45, color: 'red' },

];

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [postType, setPostType] = useState('vehicle');
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [postRes, brandRes] = await Promise.all([
                    postAPI.getAllPosts({ page: 1, pageSize: 200 }),
                    brandAPI.getVehicleBrands(),
                ]);

                const postsData = postRes?.data?.data || postRes?.data || [];
                const normalized = postsData.map((p) => ({
                    ...p,
                    id: p.id ?? p.postId ?? p.postID,
                }));
                setPosts(normalized);
                setBrands(brandRes?.data || []);
            } catch (err) {
                console.error('Fetch posts error', err);
                message.error('Không thể tải danh sách bài đăng.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const filteredPosts = useMemo(() => {
        let result = posts.slice();

        if (postType === 'vehicle') {
            result = result.filter(
                (p) => p.vehicle || p.Vehicle || p.type === 'VEHICLE' || !p.battery,
            );
        } else {
            result = result.filter((p) => p.battery || p.Battery || p.type === 'BATTERY');
        }

        if (searchText) {
            const q = searchText.toLowerCase();
            result = result.filter((p) => {
                const title = (p.title || p.Title || '').toString().toLowerCase();
                const desc = (p.description || p.Description || '').toString().toLowerCase();
                const brandName = (
                    (p.vehicle || p.Vehicle)?.brandName ||
                    (p.battery || p.Battery)?.brandName ||
                    p.brand ||
                    ''
                )
                    .toString()
                    .toLowerCase();

                return title.includes(q) || desc.includes(q) || brandName.includes(q);
            });
        }

        if (selectedBrand) {
            result = result.filter((p) => {
                const brandName =
                    (p.vehicle || p.Vehicle)?.brandName ||
                    (p.battery || p.Battery)?.brandName ||
                    p.brand ||
                    '';
                return brandName === selectedBrand;
            });
        }

        return result;
    }, [posts, postType, searchText, selectedBrand]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredPosts]);

    const startIndex = (currentPage - 1) * pageSize;
    const current = filteredPosts.slice(startIndex, startIndex + pageSize);

    const systemFeatures = [
        {
            icon: '🛡️',
            title: 'Giao Dịch An Toàn',
            description: 'Hệ thống xác minh người dùng và bảo vệ toàn bộ giao dịch 100%',
        },
        {
            icon: '⚡',
            title: 'Nhanh Chóng & Hiệu Quả',
            description: 'Đăng bài trong 5 phút, tìm kiếm thông minh với AI',
        },
        {
            icon: '🤝',
            title: 'Cộng Đồng Lớn',
            description: 'Kết nối hàng chục ngàn người dùng xe điện trên toàn quốc',
        },
        {
            icon: '💰',
            title: 'Giá Rẻ & Minh Bạch',
            description: 'Phí đăng tin chỉ 100K/bài, không phí ẩn, thanh toán linh hoạt',
        },
    ];

    const functionalityFeatures = [
        {
            icon: '🔨',
            title: 'Hệ Thống Đấu Giá',
            description: 'Tham gia đấu giá xe điện và phụ tùng với giá cạnh tranh. Theo dõi các phiên đấu giá trực tiếp và thắng giá tốt nhất.',
            details: ['Đấu giá trực tuyến realtime', 'Bảo vệ giá của người thắng', 'Hệ thống tự động nâng giá'],
        },
        {
            icon: '📢',
            title: 'Đăng Tin Dễ Dàng',
            description: 'Đăng bài bán xe hoặc phụ tùng của bạn chỉ với 100K/bài. Hỗ trợ upload ảnh, mô tả chi tiết và định giá tự động.',
            details: ['Phí đăng tin: 100K/bài', 'Hỗ trợ up hình miễn phí', 'Công cụ định giá AI'],
        },
        {
            icon: '⭐',
            title: 'Đánh Giá & Xếp Hạng',
            description: 'Xây dựng uy tín qua hệ thống đánh giá 5 sao. Khách hàng có thể xem lịch sử giao dịch và nhận xét của bạn.',
            details: ['Hệ thống sao 5', 'Lịch sử giao dịch công khai', 'Huy hiệu độ tin cậy'],
        },
        {
            icon: '📊',
            title: 'Phân Tích & Thống Kê',
            description: 'Theo dõi hiệu suất bán hàng của bạn với dashboard chi tiết. Xem số lượt xem, tin nhắn và tỷ lệ bán hàng.',
            details: ['Dashboard người bán', 'Thống kê lượt xem', 'Báo cáo doanh số'],
        },
    ];

    const introSlides = [
        {
            title: 'Chào Mừng Đến EV Marketplace',
            subtitle: 'Nền tảng trao đổi xe điện và phụ tùng hàng đầu Việt Nam',
            description: 'Kết nối người mua và người bán trong cộng đồng xe điện uy tín',
            image: '/images/ev-car-1.jpg',
            isRealImage: true,
            bgColor: 'from-blue-600 to-blue-800',
            cta: 'Khám Phá Ngay',
        },
        {
            title: 'Pin Xe Điện',
            subtitle: 'Công nghệ pin tiên tiến - An toàn và bền bỉ',
            description: 'Mua bán pin xe điện chính hãng với giá tốt nhất thị trường',
            image: '/images/ev-pin.png',
            isRealImage: true,
            bgColor: 'from-green-600 to-green-800',
            cta: 'Xem Pin Ngay',
        },
        {
            title: 'An Toàn & Bảo Vệ',
            subtitle: 'Mọi giao dịch đều được bảo vệ tối đa',
            description: 'Xác minh danh tính, bảo hiểm giao dịch, hỗ trợ 24/7',
            image: '🔒',
            bgColor: 'from-green-600 to-green-800',
            cta: 'Tìm Hiểu Thêm',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
            {/* Introduction Carousel */}
            <section className="mb-8">
                <Carousel autoplay dotPosition="bottom" className="w-full">
                    {introSlides.map((slide, idx) => (
                        <div key={idx}>
                            {slide.isRealImage ? (
                                // Slide với ảnh thật
                                <div className="relative h-[500px] md:h-[600px] overflow-hidden">
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-900/50 to-blue-900/70"></div>

                                    {/* Content overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">

                                        <Title level={1} className="!text-white !mb-3 !text-3xl md:!text-5xl">
                                            {slide.title}
                                        </Title>
                                        <Text className="text-blue-100 text-lg md:text-xl block mb-4">
                                            {slide.subtitle}
                                        </Text>
                                        <Text className="text-blue-50 text-base md:text-lg block mb-8">
                                            {slide.description}
                                        </Text>
                                        {(() => {
                                            const ctaLink = slide.cta && slide.cta.toLowerCase().includes('khám') ? '/market' : null;
                                            return ctaLink ? (
                                                <Link to={ctaLink}>
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        className="!bg-white !text-blue-700 hover:!bg-blue-50 font-semibold"
                                                    >
                                                        {slide.cta}
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    className="!bg-white !text-blue-700 hover:!bg-blue-50 font-semibold"
                                                >
                                                    {slide.cta}
                                                </Button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ) : (
                                // Slide với emoji
                                <div className={`bg-gradient-to-r ${slide.bgColor} py-20 md:py-32 text-center`}>
                                    <div className="max-w-4xl mx-auto px-4">
                                        <div className="text-6xl md:text-8xl mb-6">{slide.image}</div>
                                        <Title level={1} className="!text-white !mb-3 !text-3xl md:!text-5xl">
                                            {slide.title}
                                        </Title>
                                        <Text className="text-blue-100 text-lg md:text-xl block mb-4">
                                            {slide.subtitle}
                                        </Text>
                                        <Text className="text-blue-50 text-base md:text-lg block mb-8">
                                            {slide.description}
                                        </Text>
                                        {(() => {
                                            const ctaLink = slide.cta && slide.cta.toLowerCase().includes('khám') ? '/market' : null;
                                            return ctaLink ? (
                                                <Link to={ctaLink}>
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        className="!bg-white !text-blue-700 hover:!bg-blue-50 font-semibold"
                                                    >
                                                        {slide.cta}
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    className="!bg-white !text-blue-700 hover:!bg-blue-50 font-semibold"
                                                >
                                                    {slide.cta}
                                                </Button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </Carousel>
            </section>

            {/* Features Section */}
            <section className="bg-gradient-to-r from-white via-blue-50 to-white py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <Title level={2} className="text-center mb-12">
                        🌟 Tại Sao Chọn EV Marketplace?
                    </Title>
                    <Row gutter={[24, 24]}>
                        {systemFeatures.map((feature, idx) => (
                            <Col xs={24} sm={12} md={6} key={idx}>
                                <Card hoverable variant="borderless" className="text-center h-full hover:shadow-lg transition">
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <Title level={4}>{feature.title}</Title>
                                    <Text type="secondary">{feature.description}</Text>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Functionality Features Section */}
            <section className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <Title level={2} className="text-center mb-12">
                        ✨ Các Chức Năng Nổi Bật
                    </Title>
                    <Row gutter={[32, 32]}>
                        {functionalityFeatures.map((feature, idx) => (
                            <Col xs={24} sm={12} md={12} lg={6} key={idx}>
                                <Card
                                    hoverable
                                    variant="borderless"
                                    className="h-full hover:shadow-lg transition"
                                >
                                    <div className="text-5xl mb-4 text-center">{feature.icon}</div>
                                    <Title level={4} className="text-center">{feature.title}</Title>
                                    <Text className="block mb-4">{feature.description}</Text>
                                    <div className="space-y-2">
                                        {feature.details.map((detail, i) => (
                                            <div key={i} className="flex items-center text-sm text-gray-600">
                                                <CheckCircleOutlined className="mr-2 text-green-600" />
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* <section className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Row gutter={[32, 16]} className="text-center">
                        <Col xs={12} sm={6}>
                            <div className="text-3xl font-bold text-blue-600">1,234</div>
                            <div className="text-gray-600 text-sm">Xe đang bán</div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div className="text-3xl font-bold text-green-600">856</div>
                            <div className="text-gray-600 text-sm">Người dùng</div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div className="text-3xl font-bold text-orange-600">342</div>
                            <div className="text-gray-600 text-sm">Giao dịch thành công</div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div className="text-3xl font-bold text-purple-600">98%</div>
                            <div className="text-gray-600 text-sm">Khách hàng hài lòng</div>
                        </Col>
                    </Row>
                </div>
            </section> */}

            <section className="bg-gradient-to-r from-white via-indigo-50 to-white py-8 mb-6">
                <div className="max-w-7xl mx-auto px-4">
                    <Title level={3} className="!mb-6">
                        <FireOutlined className="text-orange-500 mr-2" /> Danh mục nổi bật
                    </Title>
                    <Row gutter={[16, 16]} justify="center">
                        {highlightCategories.map((cat) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={cat.title}>
                                <Card hoverable variant="borderless" className="text-center hover:shadow-md">
                                    <div className="text-4xl mb-2" style={{ color: `var(--ant-${cat.color}-6)` }}>
                                        {cat.icon}
                                    </div>
                                    <div className="font-semibold">{cat.title}</div>
                                    <Badge
                                        count={cat.count}
                                        style={{ backgroundColor: `var(--ant-${cat.color}-6)` }}
                                        className="mt-2"
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 py-6">
                <Card className="mb-6 shadow-sm bg-white/90 text-center">
                    <Title level={3}>Khám phá thị trường xe & pin</Title>
                    <Text className="block mb-4">Tìm kiếm xe điện, pin và phụ tùng trên trang thị trường chuyên biệt của chúng tôi.</Text>
                    <div className="flex justify-center">
                        <Link to="/market">
                            <Button type="primary" size="large">Đi đến Thị trường</Button>
                        </Link>
                    </div>
                </Card>
            </section>

            <section className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <Title level={2} className="text-center !mb-8">
                        Tại sao chọn chúng tôi?
                    </Title>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" className="text-center h-full">
                                <div className="text-4xl mb-3">🛡️</div>
                                <Title level={4}>An toàn</Title>
                                <Text type="secondary">Giao dịch được bảo vệ 100%</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" className="text-center h-full">
                                <div className="text-4xl mb-3">⚡</div>
                                <Title level={4}>Nhanh chóng</Title>
                                <Text type="secondary">Đăng bán chỉ trong 5 phút</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" className="text-center h-full">
                                <div className="text-4xl mb-3">💰</div>
                                <Title level={4}>Tiết kiệm</Title>
                                <Text type="secondary">Không phí ẩn, tối ưu chi phí</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" className="text-center h-full">
                                <div className="text-4xl mb-3">🤝</div>
                                <Title level={4}>Hỗ trợ 24/7</Title>
                                <Text type="secondary">Đội ngũ hỗ trợ luôn sẵn sàng</Text>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
