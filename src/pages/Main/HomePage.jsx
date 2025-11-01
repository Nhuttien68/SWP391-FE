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
    message
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
    const [postType, setPostType] = useState('vehicle');
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
        if (postType === 'vehicle') out = out.filter(p => p.vehicle || p.Vehicle || p.type === 'VEHICLE' || !p.battery);
        else out = out.filter(p => p.battery || p.Battery || p.type === 'BATTERY');

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
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <Title level={1} className="text-white mb-4">🚗 Chợ Xe Điện Việt Nam</Title>
                    <Paragraph className="text-blue-100 mb-6">Nền tảng mua bán xe điện - An toàn, Tin cậy, Chuyên nghiệp</Paragraph>

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
                            <Button type={postType === 'vehicle' ? 'primary' : 'default'} onClick={() => setPostType('vehicle')}>Xe</Button>
                            <Button type={postType === 'battery' ? 'primary' : 'default'} onClick={() => setPostType('battery')}>Pin</Button>
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