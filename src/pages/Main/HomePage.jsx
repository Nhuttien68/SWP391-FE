
import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Input,
    Select,
    Button,
    Typography,
    Spin,
    Space,
    Empty,
    Pagination,
    message
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    CarOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { postAPI } from '../../services/postAPI';
import { brandAPI } from '../../services/brandAPI';
import PostCard from '../Post/PostCard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);

    const [postType, setPostType] = useState('vehicle');
    const [brands, setBrands] = useState([]); // used for both vehicle and battery brands
    // const [startIndex, setStartIndex] = useState((currentPage - 1) * pageSize);
    // const [currentPosts, setCurrentPosts] = useState(filteredPosts.slice(startIndex, startIndex + pageSize));

    // Mock data for demonstration - replace with actual API calls
    const mockPosts = [
        {
            id: 1,
            title: 'Tesla Model 3 2023 - Xe điện cao cấp',
            description: 'Tesla Model 3 mới 100%, full option, tự lái cấp độ 2, màn hình cảm ứng 15 inch',
            price: 2500000000,
            brand: 'Tesla',
            year: 2023,
            mileage: 0,
            batteryCapacity: 75,
            range: 500,
            location: 'TP.HCM',
            images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400'],
            postedDate: '2024-01-15',
            views: 245,
            likes: 18,
            status: 'available',
            seller: {
                name: 'Nguyễn Văn A',
                rating: 4.8
            }
        },
        {
            id: 2,
            title: 'VinFast VF8 Plus 2023 - SUV điện Việt Nam',
            description: 'VinFast VF8 Plus màu trắng, nội thất da cao cấp, hệ thống infotainment thông minh',
            price: 1800000000,
            brand: 'VinFast',
            year: 2023,
            mileage: 5000,
            batteryCapacity: 87.7,
            range: 420,
            location: 'Hà Nội',
            images: ['https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400'],
            postedDate: '2024-01-14',
            views: 189,
            likes: 12,
            status: 'available',
            seller: {
                name: 'Trần Thị B',
                rating: 4.6
            }
        },
        {
            id: 3,
            title: 'BYD Tang EV 2022 - 7 chỗ điện thông minh',
            description: 'BYD Tang EV 7 chỗ ngồi, pin LFP an toàn, sạc nhanh DC, công nghệ Trung Quốc',
            price: 1200000000,
            brand: 'BYD',
            year: 2022,
            mileage: 15000,
            batteryCapacity: 86.4,
            range: 380,
            location: 'Đà Nẵng',
            images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400'],
            postedDate: '2024-01-13',
            views: 156,
            likes: 8,
            status: 'available',
            seller: {
                name: 'Lê Văn C',
                rating: 4.5
            }
        }
    ];

    useEffect(() => {
        // Hiển thị mock data trước, sau đó thử gọi API
        setPosts(mockPosts);
        setFilteredPosts(mockPosts);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        // Tạm thời chỉ sử dụng mock data
        setTimeout(() => {

            setLoading(false);
        }, 500);

        // TODO: Uncomment when API is ready
        try {
            const result = await postAPI.getAllPosts({
                page: 1,
                pageSize: 50
            });

            if (result.success) {
                const postsData = result.data?.data || result.data || [];
                if (postsData.length > 0) {
                    setPosts(postsData);
                    setFilteredPosts(postsData);
                } else {
                    console.log('API returned empty data, keeping mock data');
                }
            } else {
                console.log('API failed, using mock data:', result.message);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            console.log('Using mock data due to API error');
        } finally {
            setLoading(false);
        }


        try{
            const result = (postType == 'vehicle') ? await brandAPI.getVehicleBrands() : await brandAPI.getBatteryBrands();
            if (result.success) {
                setBrands(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };


    // Filter functionality
    useEffect(() => {
        let filtered = posts;

        // Filter by view type (vehicle or battery)
        if (postType === 'vehicle') {
            filtered = filtered.filter(post => post.vehicle != null);
        } else if (postType === 'battery') {
            filtered = filtered.filter(post => post.battery != null);
        }

        if (searchText) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                post.vehicle?.brandName.toLowerCase().includes(searchText.toLowerCase()) ||
                post.battery?.modelName.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (selectedBrand) {
            filtered = filtered.filter(post => (
                post.vehicle?.brandName === selectedBrand ||
                post.battery?.brandName === selectedBrand ||
                // support mock data where brand is stored as `brand`
                post.brand === selectedBrand
            ));
        }

        if (selectedPriceRange) {
            const [min, max] = selectedPriceRange.split('-').map(Number);
            filtered = filtered.filter(post => {
                if (max) {
                    return post.price >= min && post.price <= max;
                }
                return post.price >= min;
            });
        }

        setFilteredPosts(filtered);
        setCurrentPage(1);
    }, [searchText, selectedBrand, selectedPriceRange, posts, postType]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDistance = (mileage) => {
        return new Intl.NumberFormat('vi-VN').format(mileage) + ' km';
    };

    // Handle search with API
    const handleSearch = async () => {
        if (!searchText && !selectedBrand && !selectedPriceRange) {
            fetchPosts();
            return;
        }

        setLoading(true);
        try {
            const searchParams = {};

            if (searchText) searchParams.keyword = searchText;
            if (selectedBrand) searchParams.brand = selectedBrand;

            if (selectedPriceRange) {
                const [min, max] = selectedPriceRange.split('-').map(Number);
                if (min) searchParams.priceMin = min;
                if (max) searchParams.priceMax = max;
            }

            const result = await postAPI.searchPosts(searchParams);

            if (result.success) {
                const searchResults = result.data?.data || result.data || [];
                setPosts(searchResults);
                setFilteredPosts(searchResults);
            } else {
                message.error(result.message);
            }
        } catch (error) {
            console.error('Search error:', error);
            message.error('Tìm kiếm thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Handle view post detail
    const handleViewDetail = async (postId) => {
        try {
            const result = await postAPI.getPostById(postId);
            if (result.success) {
                // Navigate to detail page or open modal
                message.info('Chức năng xem chi tiết đang được phát triển');
            }
        } catch (error) {
            console.error('View detail error:', error);
            message.error('Không thể xem chi tiết');
        }
    };

    // Get current posts for pagination
    const startIndex = (currentPage - 1) * pageSize;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + pageSize);
    console.log(currentPosts.length)

    const priceRanges = [
        { label: 'Dưới 1 tỷ', value: '0-1000000000' },
        { label: '1-2 tỷ', value: '1000000000-2000000000' },
        { label: '2-3 tỷ', value: '2000000000-3000000000' },
        { label: 'Trên 3 tỷ', value: '3000000000-' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <Title level={1} className="text-white mb-4">
                            🚗 Chợ Xe Điện Việt Nam
                        </Title>
                        <Paragraph className="text-xl text-blue-100 mb-8">
                            Nền tảng mua bán xe điện hàng đầu - An toàn, Tin cậy, Chuyên nghiệp
                        </Paragraph>

                        {/* Quick Search */}
                        <div className="max-w-2xl mx-auto">
                            <Space.Compact block>
                                <Input
                                    size="large"
                                    placeholder="Tìm kiếm xe điện (Tesla, VinFast, BYD...)"
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="w-2/3"
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleSearch}
                                    loading={loading}
                                    className="w-1/3 bg-orange-500 hover:bg-orange-600"
                                >
                                    Tìm kiếm
                                </Button>
                            </Space.Compact>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8} md={6}>
                            <Select
                                placeholder="Thương hiệu"
                                allowClear
                                className="w-full"
                                value={selectedBrand}
                                onChange={setSelectedBrand}
                                suffixIcon={<CarOutlined />}
                            >
                                {brands.map(brand => (
                                    <Option key={brand.brandId} value={brand.brandName}>{brand.brandName}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={8} md={6}>
                            <Select
                                placeholder="Khoảng giá"
                                allowClear
                                className="w-full"
                                value={selectedPriceRange}
                                onChange={setSelectedPriceRange}
                                suffixIcon={<DollarOutlined />}
                            >
                                {priceRanges.map(range => (
                                    <Option key={range.value} value={range.value}>
                                        {range.label}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={8} md={6}>
                            <Button
                                icon={<FilterOutlined />}
                                className="w-full"
                            >
                                Lọc nâng cao
                            </Button>
                        </Col>
                        <Col xs={24} sm={8} md={6}>
                            <div className="flex items-center justify-center md:justify-start">
                                <Space.Compact className="w-full">
                                    <Button
                                        type={postType === 'vehicle' ? 'primary' : 'default'}
                                        onClick={() => setPostType('vehicle')}
                                    >
                                        Xe
                                    </Button>
                                    <Button
                                        type={postType === 'battery' ? 'primary' : 'default'}
                                        onClick={() => setPostType('battery')}
                                    >
                                        Pin
                                    </Button>
                                </Space.Compact>
                            </div>
                        </Col>
                        <Col xs={24} md={6}>
                            <Text type="secondary">
                                Tìm thấy {filteredPosts.length} kết quả
                            </Text>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-20">
                        <Spin size="large" />
                        <div className="mt-4">
                            <Text>Đang tải danh sách xe điện...</Text>
                        </div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không tìm thấy xe điện phù hợp"
                    >
                        <Button type="primary" onClick={() => {
                            setSearchText('');
                            setSelectedBrand('');
                            setSelectedPriceRange('');
                        }}>
                            Xem tất cả
                        </Button>
                    </Empty>
                ) : (
                    <>
                        {/* Products Grid */}
                        <Row gutter={[24, 24]}>
                            {currentPosts.map(post => (
                                <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
                                    <PostCard post={post} />
                                </Col>
                            ))}
                        </Row>

                        {/* Pagination */}
                        <div className="text-center mt-12">
                            <Pagination
                                current={currentPage}
                                total={filteredPosts.length}
                                pageSize={pageSize}
                                onChange={setCurrentPage}
                                showSizeChanger={false}
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} của ${total} xe điện`
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;