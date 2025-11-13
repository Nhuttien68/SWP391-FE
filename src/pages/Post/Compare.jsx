import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Image,
    Typography,
    Table,
    Button,
    Space,
    Tag,
    Divider,
    Empty,
    Spin,
    Select,
    message
} from 'antd';
import {
    CarOutlined,
    ThunderboltOutlined,
    DollarOutlined,
    CloseOutlined,
    SwapOutlined,
    EnvironmentOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postAPI } from '../../services/postAPI';

const { Title, Text } = Typography;

const Compare = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [post1, setPost1] = useState(null);
    const [post2, setPost2] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allPosts, setAllPosts] = useState([]);

    useEffect(() => {
        fetchAllPosts();

        const id1 = searchParams.get('post1');
        const id2 = searchParams.get('post2');

        // Reset state trước khi fetch mới
        if (!id1) setPost1(null);
        if (!id2) setPost2(null);

        if (id1) fetchPost(id1, 1);
        if (id2) fetchPost(id2, 2);
    }, [searchParams]);

    const fetchAllPosts = async () => {
        try {
            const response = await postAPI.getAllPosts();
            if (response.success) {
                const posts = response.data?.data || response.data || [];
                // Lọc các bài đăng đã được duyệt
                const approvedPosts = posts.filter(p => p.status === 'APPROVED');
                setAllPosts(approvedPosts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchPost = async (postId, position) => {
        setLoading(true);
        try {
            const response = await postAPI.getPostById(postId);
            if (response.success) {
                if (position === 1) {
                    setPost1(response.data);
                } else {
                    setPost2(response.data);
                }
            } else {
                message.error(`Không thể tải sản phẩm ${position}`);
            }
        } catch (error) {
            console.error(`Error fetching post ${position}:`, error);
            message.error(`Lỗi khi tải sản phẩm ${position}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPost = (postId, position) => {
        if (!postId) return;

        const params = new URLSearchParams(searchParams);
        params.set(`post${position}`, postId);
        navigate(`/compare?${params.toString()}`);
    };

    const handleRemovePost = (position) => {
        const params = new URLSearchParams(searchParams);
        params.delete(`post${position}`);
        navigate(`/compare?${params.toString()}`);

        if (position === 1) {
            setPost1(null);
        } else {
            setPost2(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const getPostImage = (post) => {
        if (!post) return '/placeholder.png';

        // Thử nhiều cách lấy hình ảnh
        if (post.imageUrls && post.imageUrls.length > 0) {
            return post.imageUrls[0];
        }
        if (post.postImages && post.postImages.length > 0) {
            return post.postImages[0].imageUrl || post.postImages[0].ImageUrl || post.postImages[0];
        }
        if (post.PostImages && post.PostImages.length > 0) {
            return post.PostImages[0].imageUrl || post.PostImages[0].ImageUrl || post.PostImages[0];
        }
        if (post.imageUrl) return post.imageUrl;
        if (post.ImageUrl) return post.ImageUrl;

        return 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400';
    };

    const getComparisonData = () => {
        if (!post1 && !post2) return [];

        const specs = [
            {
                key: 'title',
                label: 'Tên sản phẩm',
                getValue: (post) => post?.title
            },
            {
                key: 'price',
                label: 'Giá',
                getValue: (post) => post?.price ? formatCurrency(post.price) : null
            },
            {
                key: 'type',
                label: 'Loại',
                getValue: (post) => {
                    if (post?.type === 'VEHICLE') return 'Xe điện';
                    if (post?.type === 'BATTERY') return 'Pin xe điện';
                    return post?.type;
                }
            },
            {
                key: 'status',
                label: 'Tình trạng',
                getValue: (post) => {
                    if (post?.status === 'APPROVED') return 'Đã duyệt';
                    if (post?.status === 'PENDING') return 'Chờ duyệt';
                    if (post?.status === 'REJECTED') return 'Từ chối';
                    return post?.status;
                }
            },
            {
                key: 'description',
                label: 'Mô tả',
                getValue: (post) => post?.description
            },
            {
                key: 'seller',
                label: 'Người bán',
                getValue: (post) => post?.user?.email
            },
            {
                key: 'createdAt',
                label: 'Ngày đăng',
                getValue: (post) => post?.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : null
            }
        ];

        // Nếu là xe điện, thêm thông tin xe
        if (post1?.vehicle || post2?.vehicle) {
            specs.push(
                {
                    key: 'vehicleBrand',
                    label: 'Thương hiệu xe',
                    getValue: (post) => post?.vehicle?.vehicleBrand?.brandName
                },
                {
                    key: 'model',
                    label: 'Model',
                    getValue: (post) => post?.vehicle?.model
                },
                {
                    key: 'year',
                    label: 'Năm sản xuất',
                    getValue: (post) => post?.vehicle?.year
                },
                {
                    key: 'color',
                    label: 'Màu sắc',
                    getValue: (post) => post?.vehicle?.color
                },
                {
                    key: 'range',
                    label: 'Quãng đường (km)',
                    getValue: (post) => post?.vehicle?.range
                },
                {
                    key: 'maxSpeed',
                    label: 'Tốc độ tối đa (km/h)',
                    getValue: (post) => post?.vehicle?.maxSpeed
                },
                {
                    key: 'enginePower',
                    label: 'Công suất động cơ (kW)',
                    getValue: (post) => post?.vehicle?.enginePower
                },
                {
                    key: 'licensePlate',
                    label: 'Biển số',
                    getValue: (post) => post?.vehicle?.licensePlate
                }
            );
        }

        // Nếu là pin, thêm thông tin pin
        if (post1?.battery || post2?.battery) {
            specs.push(
                {
                    key: 'batteryBrand',
                    label: 'Thương hiệu pin',
                    getValue: (post) => post?.battery?.batteryBrand?.brandName
                },
                {
                    key: 'capacity',
                    label: 'Dung lượng (kWh)',
                    getValue: (post) => post?.battery?.capacity
                },
                {
                    key: 'voltage',
                    label: 'Điện áp (V)',
                    getValue: (post) => post?.battery?.voltage
                },
                {
                    key: 'warrantyPeriod',
                    label: 'Bảo hành (tháng)',
                    getValue: (post) => post?.battery?.warrantyPeriod
                },
                {
                    key: 'batteryCondition',
                    label: 'Tình trạng pin',
                    getValue: (post) => {
                        const condition = post?.battery?.condition;
                        if (condition === 'NEW') return 'Mới';
                        if (condition === 'USED') return 'Đã qua sử dụng';
                        return condition;
                    }
                }
            );
        }

        // Lọc chỉ giữ các spec có ít nhất 1 giá trị không null
        const filteredSpecs = specs.filter(spec => {
            const val1 = post1 ? spec.getValue(post1) : null;
            const val2 = post2 ? spec.getValue(post2) : null;
            return val1 !== null && val1 !== undefined || val2 !== null && val2 !== undefined;
        });

        return filteredSpecs.map(spec => ({
            key: spec.key,
            label: spec.label,
            post1Value: post1 ? (spec.getValue(post1) || '-') : '-',
            post2Value: post2 ? (spec.getValue(post2) || '-') : '-'
        }));
    };

    const columns = [
        {
            title: 'Thông tin',
            dataIndex: 'label',
            key: 'label',
            width: '30%',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: post1 ? post1.title : 'Sản phẩm 1',
            dataIndex: 'post1Value',
            key: 'post1Value',
            width: '35%',
            render: (text) => <Text>{text}</Text>
        },
        {
            title: post2 ? post2.title : 'Sản phẩm 2',
            dataIndex: 'post2Value',
            key: 'post2Value',
            width: '35%',
            render: (text) => <Text>{text}</Text>
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Title level={2}>
                        <SwapOutlined className="mr-2" />
                        So sánh sản phẩm
                    </Title>
                    <Text type="secondary">Chọn 2 sản phẩm để xem thông tin so sánh chi tiết</Text>
                </div>

                {/* Product Selection Cards */}
                <Row gutter={[24, 24]} className="mb-6">
                    {/* Product 1 */}
                    <Col xs={24} md={12}>
                        <Card
                            className="h-full shadow-md"
                            cover={
                                post1 ? (
                                    <div className="relative">
                                        <Image
                                            src={getPostImage(post1)}
                                            alt={post1.title}
                                            width="100%"
                                            height={300}
                                            style={{ objectFit: 'cover' }}
                                            preview={true}
                                            fallback="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400"
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRemovePost(1)}
                                            className="absolute top-2 right-2 bg-white hover:bg-red-50"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-[300px] bg-gray-100 flex items-center justify-center">
                                        <Empty description="Chưa chọn sản phẩm" />
                                    </div>
                                )
                            }
                        >
                            <Card.Meta
                                title={
                                    <div className="mb-3">
                                        <Text strong className="text-lg">Sản phẩm 1</Text>
                                    </div>
                                }
                                description={
                                    <div>
                                        {post1 ? (
                                            <Space direction="vertical" className="w-full">
                                                <Text strong className="text-xl text-blue-600">
                                                    {formatCurrency(post1.price)}
                                                </Text>
                                                <Text className="text-gray-600">{post1.title}</Text>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Tag icon={<EnvironmentOutlined />} color="blue">
                                                        {post1.location || 'N/A'}
                                                    </Tag>
                                                    <Tag icon={<CalendarOutlined />}>
                                                        {new Date(post1.createdAt).toLocaleDateString('vi-VN')}
                                                    </Tag>
                                                </div>
                                            </Space>
                                        ) : (
                                            <Select
                                                className="w-full"
                                                placeholder="Chọn sản phẩm để so sánh"
                                                showSearch
                                                filterOption={(input, option) =>
                                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                                onChange={(value) => handleSelectPost(value, 1)}
                                                options={allPosts.map(p => ({
                                                    value: p.postId,
                                                    label: p.title
                                                }))}
                                            />
                                        )}
                                    </div>
                                }
                            />
                        </Card>
                    </Col>

                    {/* Product 2 */}
                    <Col xs={24} md={12}>
                        <Card
                            className="h-full shadow-md"
                            cover={
                                post2 ? (
                                    <div className="relative">
                                        <Image
                                            src={getPostImage(post2)}
                                            alt={post2.title}
                                            width="100%"
                                            height={300}
                                            style={{ objectFit: 'cover' }}
                                            preview={true}
                                            fallback="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400"
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRemovePost(2)}
                                            className="absolute top-2 right-2 bg-white hover:bg-red-50"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-[300px] bg-gray-100 flex items-center justify-center">
                                        <Empty description="Chưa chọn sản phẩm" />
                                    </div>
                                )
                            }
                        >
                            <Card.Meta
                                title={
                                    <div className="mb-3">
                                        <Text strong className="text-lg">Sản phẩm 2</Text>
                                    </div>
                                }
                                description={
                                    <div>
                                        {post2 ? (
                                            <Space direction="vertical" className="w-full">
                                                <Text strong className="text-xl text-blue-600">
                                                    {formatCurrency(post2.price)}
                                                </Text>
                                                <Text className="text-gray-600">{post2.title}</Text>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Tag icon={<EnvironmentOutlined />} color="blue">
                                                        {post2.location || 'N/A'}
                                                    </Tag>
                                                    <Tag icon={<CalendarOutlined />}>
                                                        {new Date(post2.createdAt).toLocaleDateString('vi-VN')}
                                                    </Tag>
                                                </div>
                                            </Space>
                                        ) : (
                                            <Select
                                                className="w-full"
                                                placeholder="Chọn sản phẩm để so sánh"
                                                showSearch
                                                filterOption={(input, option) =>
                                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                                onChange={(value) => handleSelectPost(value, 2)}
                                                options={allPosts.map(p => ({
                                                    value: p.postId,
                                                    label: p.title
                                                }))}
                                            />
                                        )}
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Comparison Table */}
                {(post1 || post2) && (
                    <Card className="shadow-md">
                        <Title level={4} className="mb-4">
                            Bảng so sánh chi tiết
                        </Title>
                        <Divider />
                        {loading ? (
                            <div className="text-center py-12">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Table
                                dataSource={getComparisonData()}
                                columns={columns}
                                pagination={false}
                                bordered
                                size="middle"
                            />
                        )}
                    </Card>
                )}

                {/* Empty State */}
                {!post1 && !post2 && (
                    <Card className="shadow-md text-center py-12">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <Text>Vui lòng chọn ít nhất 1 sản phẩm để bắt đầu so sánh</Text>
                                </div>
                            }
                        />
                    </Card>
                )}

                {/* Action Buttons */}
                {(post1 || post2) && (
                    <div className="mt-6 text-center">
                        <Space>
                            {post1 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate(`/post/${post1.postId}`)}
                                >
                                    Xem chi tiết sản phẩm 1
                                </Button>
                            )}
                            {post2 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate(`/post/${post2.postId}`)}
                                >
                                    Xem chi tiết sản phẩm 2
                                </Button>
                            )}
                        </Space>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compare;
