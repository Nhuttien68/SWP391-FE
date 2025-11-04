import { useState, useEffect } from 'react';
import { Table, Button, notification, Modal, Space, Badge, Card, Row, Col, Statistic, Typography, Tooltip, Image, Tabs, Popconfirm } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, WalletOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { postAPI } from '../../services/postAPI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { confirm } = Modal;
const { Text } = Typography;

const AdminPostsPage = () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [approveTargetPostId, setApproveTargetPostId] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [activeTab, setActiveTab] = useState('moderation');
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, isAdmin } = useAuth();

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

    const fetchPendingPosts = async () => {
        setLoading(true);
        try {
            const response = await postAPI.getPendingPosts();
            if (response.success) {
                setPosts(response.data);
                // Update statistics
                const data = response.data || [];
                setStats({
                    total: data.length,
                    pending: data.filter(post => post.status === 'PENNDING').length,
                    approved: data.filter(post => post.status === 'APPROVED').length,
                    rejected: data.filter(post => post.status === 'REJECTED').length
                });
            } else {
                message.error('Không thể tải danh sách bài đăng');
            }
        } catch (error) {
            console.error('Load posts error:', error);
            message.error('Có lỗi xảy ra khi tải danh sách bài đăng');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPosts = async () => {
        setLoading(true);
        try {
            const response = await postAPI.getAllPosts();
            if (response.success) {
                setPosts(response.data);
                const data = response.data || [];
                setStats({
                    total: data.length,
                    pending: data.filter(post => post.status === 'PENNDING').length,
                    approved: data.filter(post => post.status === 'APPROVED').length,
                    rejected: data.filter(post => post.status === 'REJECTED').length
                });
            } else {
                message.error('Không thể tải danh sách bài đăng');
            }
        } catch (error) {
            console.error('Load all posts error:', error);
            message.error('Có lỗi xảy ra khi tải danh sách bài đăng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load according to active tab
        if (activeTab === 'moderation') fetchPendingPosts();
        else fetchAllPosts();
    }, [activeTab]);

    const showPostDetail = (post) => {
        setSelectedPost(post);
        setDetailVisible(true);
    };

    const handleApprove = (postId) => {
        // Open controlled approve modal
        setApproveTargetPostId(postId);
        setApproveModalVisible(true);
    };

    const handleApproveConfirm = () => {
        const postId = approveTargetPostId;
        // Show loading notification
        notification.info({
            key: `approve-${postId}`,
            message: 'Đang xử lý',
            description: 'Vui lòng đợi trong giây lát...',
            icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
            duration: 0
        });

        postAPI.approvePost(postId)
            .then(response => {
                if (response.success) {
                    notification.destroy();
                    notification.success({
                        message: 'Phê duyệt thành công',
                        description: 'Bài đăng đã được phê duyệt và đã thêm 100,000 VND vào ví admin',
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        duration: 4,
                        placement: 'topRight'
                    });
                    // Refresh data based on current tab
                    if (activeTab === 'moderation') {
                        fetchPendingPosts();
                    } else {
                        fetchAllPosts();
                    }
                } else {
                    notification.error({
                        message: 'Phê duyệt thất bại',
                        description: response.message || 'Không thể phê duyệt bài đăng',
                        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                        duration: 4,
                        placement: 'topRight'
                    });
                }
            })
            .catch(error => {
                console.error('Approve error:', error);
                notification.error({
                    message: 'Lỗi',
                    description: 'Có lỗi xảy ra khi phê duyệt bài đăng',
                    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                    duration: 4,
                    placement: 'topRight'
                });
            })
            .finally(() => {
                setApproveModalVisible(false);
                setApproveTargetPostId(null);
            });
    };

    const handleApproveCancel = () => {
        setApproveModalVisible(false);
        setApproveTargetPostId(null);
    };

    const handleReject = (postId) => {
        confirm({
            title: 'Xác nhận từ chối',
            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: 'Khi từ chối bài đăng, hệ thống sẽ hoàn trả 100,000 VND về ví của người đăng. Bạn có chắc chắn muốn từ chối?',
            onOk() {
                return new Promise((resolve, reject) => {
                    // Show loading notification
                    notification.info({
                        key: `reject-${postId}`,
                        message: 'Đang xử lý',
                        description: 'Vui lòng đợi trong giây lát...',
                        icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
                        duration: 0
                    });

                    postAPI.rejectPost(postId)
                        .then(response => {
                            if (response.success) {
                                notification.destroy();
                                notification.success({
                                    message: 'Từ chối thành công',
                                    description: 'Bài đăng đã bị từ chối' +
                                        (response.data?.UserNewBalance ?
                                            `. Đã hoàn trả 100,000 VND. Số dư mới của người dùng: ${response.data.UserNewBalance.toLocaleString()} VND` :
                                            ''),
                                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                    duration: 4,
                                    placement: 'topRight'
                                });
                                // Refresh data based on current tab
                                if (activeTab === 'moderation') {
                                    fetchPendingPosts();
                                } else {
                                    fetchAllPosts();
                                }
                                resolve();
                            } else {
                                notification.error({
                                    message: 'Từ chối thất bại',
                                    description: response.message || 'Không thể từ chối bài đăng',
                                    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                                    duration: 4,
                                    placement: 'topRight'
                                });
                                reject();
                            }
                        })
                        .catch(error => {
                            console.error('Reject error:', error);
                            notification.error({
                                message: 'Lỗi',
                                description: 'Có lỗi xảy ra khi từ chối bài đăng',
                                icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                                duration: 4,
                                placement: 'topRight'
                            });
                            reject(error);
                        });
                });
            },
            okButtonProps: {
                loading: false
            }
        });
    };

    const handleDelete = async (postId) => {
        try {
            const resp = await postAPI.deletePost(postId);
            if (resp.success) {
                message.success('Xóa bài đăng thành công');
                // refresh current tab
                if (activeTab === 'moderation') fetchPendingPosts();
                else fetchAllPosts();
            } else {
                message.error(resp.message || 'Xóa thất bại');
            }
        } catch (error) {
            console.error('Delete post error:', error);
            message.error('Có lỗi khi xóa bài đăng');
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: '25%',
            render: (title, record) => (
                <div>
                    <Text strong>{title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.description?.length > 50
                            ? record.description.substring(0, 50) + '...'
                            : record.description}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Thông tin chi tiết',
            width: '25%',
            render: (_, record) => (
                <div>
                    <Text strong>Loại: </Text>
                    <Text>{record.type === 'VEHICLE' ? 'Xe điện' : 'Pin xe điện'}</Text>
                    <br />
                    {record.type === 'VEHICLE' && record.vehicle && (
                        <>
                            <Text type="secondary">
                                {record.vehicle.brandName} - {record.vehicle.model}
                                {record.vehicle.year && ` (${record.vehicle.year})`}
                            </Text>
                            <br />
                            <Text type="secondary">
                                Số km: {record.vehicle.mileage?.toLocaleString() || 'N/A'}
                            </Text>
                        </>
                    )}
                    {record.type === 'BATTERY' && record.battery && (
                        <>
                            <Text type="secondary">
                                {record.battery.brandName} - {record.battery.capacity}
                            </Text>
                            <br />
                            <Text type="secondary">
                                Tình trạng: {record.battery.condition || 'N/A'}
                            </Text>
                        </>
                    )}
                </div>
            )
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: '15%',
            render: (price) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {price?.toLocaleString('vi-VN')} VND
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '15%',
            render: (status) => {
                let color = 'default';
                let text = 'Không xác định';

                switch (status) {
                    case 'PENNDING':
                        color = 'warning';
                        text = 'Chờ duyệt';
                        break;
                    case 'APPROVED':
                        color = 'success';
                        text = 'Đã duyệt';
                        break;
                    case 'REJECTED':
                        color = 'error';
                        text = 'Đã từ chối';
                        break;
                }

                return <Badge status={color} text={text} />;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => showPostDetail(record)}
                        />
                    </Tooltip>
                    {activeTab === 'moderation' && record.status === 'PENNDING' && (
                        <>
                            <Tooltip title="Phê duyệt và nhận 100,000 VND">
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleApprove(record.postId)}
                                >
                                    Phê duyệt
                                </Button>
                            </Tooltip>
                            <Tooltip title="Từ chối và hoàn trả 100,000 VND cho người đăng">
                                <Button
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => handleReject(record.postId)}
                                >
                                    Từ chối
                                </Button>
                            </Tooltip>
                        </>
                    )}

                    {activeTab === 'manage' && (
                        <>
                            <Button onClick={() => navigate(`/posts/edit/${record.postId}`)}>Sửa</Button>
                            <Popconfirm
                                title="Bạn có chắc muốn xóa bài đăng này?"
                                onConfirm={() => {
                                    return new Promise((resolve, reject) => {
                                        postAPI.deletePost(record.postId)
                                            .then(response => {
                                                if (response.success) {
                                                    notification.success({
                                                        message: 'Xóa thành công',
                                                        description: 'Bài đăng đã được xóa thành công',
                                                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                                        duration: 4,
                                                        placement: 'topRight'
                                                    });
                                                    if (activeTab === 'moderation') {
                                                        fetchPendingPosts();
                                                    } else {
                                                        fetchAllPosts();
                                                    }
                                                    resolve();
                                                } else {
                                                    message.error(response.message || 'Xóa thất bại');
                                                    reject();
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Delete post error:', error);
                                                message.error('Có lỗi khi xóa bài đăng');
                                                reject(error);
                                            });
                                    });
                                }}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button danger>Xóa</Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-posts">
            <div className="mb-6">
                <Row gutter={[16, 16]} className="mb-6">
                    <Col span={24}>
                        <Card>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={(key) => setActiveTab(key)}
                                        items={[
                                            {
                                                key: 'moderation',
                                                label: 'Kiểm duyệt bài',
                                                children: (
                                                    <>
                                                        <Row gutter={16} className="mb-4">
                                                            <Col span={6}>
                                                                <Statistic
                                                                    title="Tổng số bài chờ"
                                                                    value={stats.pending}
                                                                    prefix={<WalletOutlined />}
                                                                />
                                                            </Col>
                                                        </Row>

                                                        <Table
                                                            columns={columns}
                                                            dataSource={posts}
                                                            rowKey="postId"
                                                            loading={loading}
                                                        />
                                                    </>
                                                )
                                            },
                                            {
                                                key: 'manage',
                                                label: 'Quản lý bài',
                                                children: (
                                                    <>
                                                        <Row justify="space-between" align="middle" className="mb-4">
                                                            <Col>
                                                                <Button type="primary" onClick={() => navigate('/posts/create')}>Thêm bài</Button>
                                                            </Col>
                                                        </Row>

                                                        <Table
                                                            columns={columns}
                                                            dataSource={posts}
                                                            rowKey="postId"
                                                            loading={loading}
                                                        />
                                                    </>
                                                )
                                            }
                                        ]}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Controlled approve confirmation modal (visible when user clicks Phê duyệt) */}
            <Modal
                title="Xác nhận phê duyệt"
                open={approveModalVisible}
                onOk={handleApproveConfirm}
                onCancel={handleApproveCancel}
                okText="Phê duyệt"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn phê duyệt bài đăng này? Khi phê duyệt, admin sẽ được nhận 100,000 VND.</p>
            </Modal>

            <Modal
                title="Chi tiết bài đăng"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={800}
            >
                {selectedPost && (
                    <div>
                        <h2>{selectedPost.title}</h2>
                        <p>{selectedPost.description}</p>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="Thông tin cơ bản">
                                    <p><strong>Giá:</strong> {selectedPost.price?.toLocaleString('vi-VN')} VND</p>
                                    <p><strong>Loại:</strong> {selectedPost.type === 'VEHICLE' ? 'Xe điện' : 'Pin xe điện'}</p>
                                    <p><strong>Trạng thái:</strong> {
                                        selectedPost.status === 'PENNDING' ? 'Chờ duyệt' :
                                            selectedPost.status === 'APPROVED' ? 'Đã duyệt' :
                                                'Đã từ chối'
                                    }</p>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title={selectedPost.type === 'VEHICLE' ? 'Thông số xe' : 'Thông số pin'}>
                                    {selectedPost.type === 'VEHICLE' && selectedPost.vehicle && (
                                        <>
                                            <p><strong>Thương hiệu:</strong> {selectedPost.vehicle.brandName}</p>
                                            <p><strong>Model:</strong> {selectedPost.vehicle.model}</p>
                                            <p><strong>Năm sản xuất:</strong> {selectedPost.vehicle.year}</p>
                                            <p><strong>Số km:</strong> {selectedPost.vehicle.mileage?.toLocaleString()}</p>
                                        </>
                                    )}
                                    {selectedPost.type === 'BATTERY' && selectedPost.battery && (
                                        <>
                                            <p><strong>Thương hiệu:</strong> {selectedPost.battery.brandName}</p>
                                            <p><strong>Dung lượng:</strong> {selectedPost.battery.capacity}</p>
                                            <p><strong>Tình trạng:</strong> {selectedPost.battery.condition}</p>
                                        </>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                        {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
                            <Card title="Hình ảnh" style={{ marginTop: '16px' }}>
                                <Row gutter={[16, 16]}>
                                    {selectedPost.imageUrls.map((url, index) => (
                                        <Col span={8} key={index}>
                                            <Image
                                                src={url}
                                                alt={`Ảnh ${index + 1}`}
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminPostsPage;