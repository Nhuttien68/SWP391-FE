import React, { useEffect, useState } from 'react';
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
    Carousel
} from 'antd';
import { SearchOutlined, CarOutlined } from '@ant-design/icons';
import PostCard from '../Post/PostCard';
import { postAPI } from '../../services/postAPI';
import { brandAPI } from '../../services/brandAPI';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const HomePage = () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [postType, setPostType] = useState('VEHICLE');
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await postAPI.getAllPosts({ page: 1, pageSize: 200 });
                const postsData = res?.data?.data || res?.data || [];
                const normalized = postsData.map(p => ({ ...p, id: p.id ?? p.postId ?? p.postID }));
                setPosts(normalized);
                setFiltered(normalized);

                const brandResp = await brandAPI.getVehicleBrands();
                setBrands(brandResp?.data || []);
            } catch (err) {
                console.error('Fetch posts error', err);
                message.error('Không thể tải bài đăng (xem console)');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        let out = posts.slice();
        if (postType === 'VEHICLE') out = out.filter(p => p.type === 'VEHICLE');
        else if (postType === 'BATTERY') out = out.filter(p => p.type === 'BATTERY');

        if (searchText) {
            const q = searchText.toLowerCase();
            out = out.filter(p => (
                (p.title || p.Title || '').toString().toLowerCase().includes(q) ||
                (p.description || p.Description || '').toString().toLowerCase().includes(q) ||
                ((p.vehicle || p.Vehicle)?.brandName || (p.battery || p.Battery)?.brandName || p.brand || '').toString().toLowerCase().includes(q)
            ));
        }

        if (selectedBrand) {
            out = out.filter(p => {
                const b = (p.vehicle || p.Vehicle)?.brandName || (p.battery || p.Battery)?.brandName || p.brand || '';
                return b === selectedBrand;
            });
        }

        setFiltered(out);
        setCurrentPage(1);
    }, [searchText, selectedBrand, postType, posts]);

    const startIndex = (currentPage - 1) * pageSize;
    const current = filtered.slice(startIndex, startIndex + pageSize);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Promotional Banner */}
            <div className="bg-[#FFBA00]">
                <div className="max-w-7xl mx-auto px-4">
                    <Carousel autoplay className="mb-0">
                        <div>
                            <div className="h-[400px] bg-center bg-cover rounded-b-xl overflow-hidden relative" style={{ backgroundImage: 'url(https://www.vinfast.com/themes/porto/img/slides/vf8-black.jpg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                                    <div className="h-full flex items-center">
                                        <div className="text-white p-12 max-w-2xl">
                                            <h1 className="text-5xl font-bold mb-4">"Nhà" mới toanh. Khám phá nhanh!</h1>
                                            <p className="text-xl mb-8">Khám phá các mẫu xe điện hiện đại và thân thiện với môi trường</p>
                                            <div className="bg-white/90 rounded-lg p-4 backdrop-blur-sm">
                                                <div className="flex gap-4">
                                                    <Select
                                                        className="w-1/3"
                                                        placeholder="Danh mục"
                                                        size="large"
                                                    >
                                                        <Option value="xe">Xe điện</Option>
                                                        <Option value="pin">Pin xe điện</Option>
                                                    </Select>
                                                    <Input.Search
                                                        placeholder="Tìm sản phẩm..."
                                                        size="large"
                                                        className="flex-1"
                                                        enterButton="Tìm kiếm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-[400px] bg-center bg-cover rounded-b-xl overflow-hidden relative" style={{ backgroundImage: 'url(https://vinfastauto.com/sites/default/files/styles/news_360x200/public/2022-11/VF8_front.jpg)' }}>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                                    <div className="h-full flex items-center">
                                        <div className="text-white p-12 max-w-2xl">
                                            <h1 className="text-5xl font-bold mb-4">Pin Chính Hãng</h1>
                                            <p className="text-xl mb-8">Giải pháp pin thông minh cho xe điện của bạn</p>
                                            <div className="bg-white/90 rounded-lg p-4 backdrop-blur-sm">
                                                <div className="flex gap-4">
                                                    <Select
                                                        className="w-1/3"
                                                        placeholder="Danh mục"
                                                        size="large"
                                                    >
                                                        <Option value="xe">Xe điện</Option>
                                                        <Option value="pin">Pin xe điện</Option>
                                                    </Select>
                                                    <Input.Search
                                                        placeholder="Tìm sản phẩm..."
                                                        size="large"
                                                        className="flex-1"
                                                        enterButton="Tìm kiếm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Carousel>
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Row gutter={[16, 32]} className="mb-8">
                    <Col xs={12} sm={8} md={6} lg={3}>
                        <div className="text-center cursor-pointer hover:opacity-80">
                            <div className="bg-white rounded-lg p-4 shadow-sm mb-2">
                                <img src="/electric-car.png" alt="Xe điện" className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="font-medium">Xe điện</p>
                        </div>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={3}>
                        <div className="text-center cursor-pointer hover:opacity-80">
                            <div className="bg-white rounded-lg p-4 shadow-sm mb-2">
                                <img src="/battery.png" alt="Pin" className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="font-medium">Pin xe điện</p>
                        </div>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={3}>
                        <div className="text-center cursor-pointer hover:opacity-80">
                            <div className="bg-white rounded-lg p-4 shadow-sm mb-2">
                                <img src="/spare-parts.png" alt="Phụ tùng" className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="font-medium">Phụ tùng</p>
                        </div>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={3}>
                        <div className="text-center cursor-pointer hover:opacity-80">
                            <div className="bg-white rounded-lg p-4 shadow-sm mb-2">
                                <img src="/maintenance.png" alt="Bảo dưỡng" className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="font-medium">Bảo dưỡng</p>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Promotional Banner */}
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <Carousel autoplay>
                    <div>
                        <div className="h-[300px] bg-center bg-cover rounded-xl overflow-hidden" style={{ backgroundImage: 'url(https://www.vinfast.com/themes/porto/img/slides/vf8-black.jpg)' }}>
                            <div className="h-full flex items-center bg-gradient-to-r from-black/50 to-transparent">
                                <div className="text-white p-12">
                                    <h2 className="text-3xl font-bold mb-4">Xe Điện Thế Hệ Mới</h2>
                                    <p className="text-lg mb-6">Khám phá ngay hôm nay</p>
                                    <Button type="primary" size="large" className="bg-[#FFBA00] border-none">
                                        Xem thêm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="h-[300px] bg-center bg-cover rounded-xl overflow-hidden" style={{ backgroundImage: 'url(https://vinfastauto.com/sites/default/files/styles/news_360x200/public/2022-11/VF8_front.jpg)' }}>
                            <div className="h-full flex items-center bg-gradient-to-r from-black/50 to-transparent">
                                <div className="text-white p-12">
                                    <h2 className="text-3xl font-bold mb-4">Pin Chính Hãng</h2>
                                    <p className="text-lg mb-6">Chất lượng đảm bảo</p>
                                    <Button type="primary" size="large" className="bg-[#FFBA00] border-none">
                                        Tìm hiểu thêm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Carousel>
            </div>

            <div className="bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <Title level={1} className="text-white mb-4">🚗 Khám Phá Xe Điện</Title>
                    <Paragraph className="text-blue-100 mb-6">Tìm kiếm xe điện phù hợp với nhu cầu của bạn</Paragraph>

                    <div className="max-w-3xl mx-auto">
                        <Space.Compact block style={{ width: '100%' }}>
                            <Input
                                size="large"
                                placeholder="Tìm kiếm xe điện..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Button type="primary" size="large" onClick={() => { /* noop - reactive search */ }}>Tìm kiếm</Button>
                        </Space.Compact>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Thương hiệu"
                            allowClear
                            className="w-full"
                            value={selectedBrand || undefined}
                            onChange={setSelectedBrand}
                            suffixIcon={<CarOutlined />}
                        >
                            {brands.map(b => (
                                <Option key={b.brandId ?? b.id} value={b.brandName ?? b.BrandName}>{b.brandName ?? b.BrandName}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={16} md={18} className="flex justify-end">
                        <div className="flex gap-2">
                            <Button type={postType === 'VEHICLE' ? 'primary' : 'default'} onClick={() => setPostType('VEHICLE')}>Xe</Button>
                            <Button type={postType === 'BATTERY' ? 'primary' : 'default'} onClick={() => setPostType('BATTERY')}>Pin</Button>
                        </div>
                    </Col>
                </Row>

                {loading ? (
                    <div className="text-center py-20"><Spin size="large" /></div>
                ) : filtered.length === 0 ? (
                    <Empty description="Không tìm thấy bài đăng" />
                ) : (
                    <>
                        <Row gutter={[24, 24]}>
                            {current.map(p => (
                                <Col xs={24} sm={12} md={8} lg={6} key={p.id ?? p.postId}>
                                    <PostCard post={p} />
                                </Col>
                            ))}
                        </Row>

                        <div className="text-center mt-8">
                            <Pagination
                                current={currentPage}
                                total={filtered.length}
                                pageSize={pageSize}
                                onChange={(p) => setCurrentPage(p)}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;