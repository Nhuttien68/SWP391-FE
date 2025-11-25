import { useState, useEffect } from 'react';
import { Table, Button, notification, Modal, Space, Badge, Card, Row, Col, Statistic, Typography, Tooltip, Image, Tabs, Popconfirm, Form, Input, Select, Upload, message, Checkbox, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, WalletOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { postAPI } from '../../services/postAPI';
import brandAPI from '../../services/brandAPI';
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
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editPost, setEditPost] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editPreparing, setEditPreparing] = useState(false);
    const [newFiles, setNewFiles] = useState([]);
    const [keepImageIds, setKeepImageIds] = useState([]);
    const [vehicleBrands, setVehicleBrands] = useState([]);
    const [batteryBrands, setBatteryBrands] = useState([]);
    const [form] = Form.useForm();

    // Controlled reject modal state (mirror approve)
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectTargetPostId, setRejectTargetPostId] = useState(null);

    // Prefetch brands once to reduce perceived latency and ensure selects populate
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const vb = await brandAPI.getVehicleBrands();
                console.warn(vb)
                if (mounted && vb && vb.success) setVehicleBrands(vb.data || []);
            } catch (e) {
                console.error('[AdminPostsPage] prefetch vehicle brands error', e);
            }
            try {
                const bb = await brandAPI.getBatteryBrands();
                if (mounted && bb && bb.success) setBatteryBrands(bb.data || []);
            } catch (e) {
                console.error('[AdminPostsPage] prefetch battery brands error', e);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

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
                    pending: data.filter(post => post.status === 'PENDING').length,
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
                    pending: data.filter(post => post.status === 'PENDING').length,
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

    const openEditModal = async (post) => {
        setEditPreparing(true);
        setEditModalVisible(true);
        try {
            // fetch latest brands first (defensive)
            try {
                const vb = await brandAPI.getVehicleBrands();
                if (vb && vb.success) setVehicleBrands(vb.data || []);
            } catch (e) { console.error('[AdminPostsPage] load vehicle brands error', e); }
            try {
                const bb = await brandAPI.getBatteryBrands();
                if (bb && bb.success) setBatteryBrands(bb.data || []);
            } catch (e) { console.error('[AdminPostsPage] load battery brands error', e); }

            // prepare initial form values based on type
            const initial = {
                postId: post.postId,
                title: post.title,
                description: post.description,
                price: post.price,
            };

            if (post.type === 'VEHICLE' && post.vehicle) {
                initial.brandId = post.vehicle.brandId || post.vehicle.brandId || post.vehicle.brandId;
                initial.model = post.vehicle.model;
                initial.year = post.vehicle.year;
                initial.mileage = post.vehicle.mileage;
            }

            if (post.type === 'BATTERY' && post.battery) {
                initial.brandId = post.battery.brandId || post.battery.brandId || post.battery.brandId;
                initial.capacity = post.battery.capacity;
                initial.condition = post.battery.condition;
            }

            // collect existing image ids if available
            const existingIds = [];
            const imgs = post.postImages || post.post_images || post.imageUrls || [];
            if (Array.isArray(imgs) && imgs.length > 0) {
                imgs.forEach(i => {
                    const id = i.imageId || i.ImageId || i.id || (typeof i === 'string' ? null : null);
                    if (id) existingIds.push(id);
                });
            }
            // fallback: if response only has imgId array
            if (post.imgId && Array.isArray(post.imgId)) {
                post.imgId.forEach(id => existingIds.push(id));
            }

            setKeepImageIds(existingIds.map(i => i.toString()));
            setNewFiles([]);
            setEditPost(post);
            form.setFieldsValue(initial);
        } catch (err) {
            console.error('[AdminPostsPage] openEditModal error', err);
            message.error('Không thể mở form chỉnh sửa — kiểm tra console');
            setEditPost(null);
            setNewFiles([]);
            setKeepImageIds([]);
        } finally {
            setEditPreparing(false);
        }
    };

    const handleRemoveExistingImage = (id) => {
        setKeepImageIds(prev => prev.filter(x => x !== id));
    };

    const uploadProps = {
        beforeUpload: (file) => {
            setNewFiles(prev => [...prev, file]);
            return false; // prevent auto upload
        },
        onRemove: (file) => {
            setNewFiles(prev => prev.filter(f => f !== file));
        },
        multiple: true,
        fileList: newFiles
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!editPost) return;
            setEditLoading(true);

            const fd = new FormData();
            fd.append('postId', values.postId || editPost.postId);
            fd.append('title', values.title || '');
            fd.append('description', values.description || '');
            fd.append('price', values.price != null ? String(values.price) : '0');

            if (editPost.type === 'VEHICLE') {
                fd.append('brandId', values.brandId || '');
                fd.append('model', values.model || '');
                fd.append('year', values.year != null ? String(values.year) : '0');
                fd.append('mileage', values.mileage != null ? String(values.mileage) : '0');
            } else {
                fd.append('brandId', values.brandId || '');
                fd.append('capacity', values.capacity != null ? String(values.capacity) : '0');
                fd.append('condition', values.condition || '');
            }

            // keepImageIds - append multiple entries
            (keepImageIds || []).forEach(id => fd.append('keepImageIds', id));

            // new images
            (newFiles || []).forEach(file => fd.append('newImages', file));

            let resp;
            if (editPost.type === 'VEHICLE') {
                resp = await postAPI.updateVehiclePost(fd);
            } else {
                resp = await postAPI.updateBatteryPost(fd);
            }

            if (resp && resp.success) {
                notification.success({ message: 'Cập nhật thành công' });
                setEditModalVisible(false);
                setEditPost(null);
                if (activeTab === 'moderation') fetchPendingPosts(); else fetchAllPosts();
            } else {
                message.error(resp?.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            console.error('Edit submit error', err);
            message.error(err?.message || 'Có lỗi khi cập nhật');
        } finally {
            setEditLoading(false);
        }
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

    // Open reject modal (controlled), confirm will call API
    const handleReject = (postId) => {
        setRejectTargetPostId(postId);
        setRejectModalVisible(true);
    };

    const handleRejectConfirm = () => {
        const postId = rejectTargetPostId;
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
                    if (activeTab === 'moderation') fetchPendingPosts(); else fetchAllPosts();
                } else {
                    notification.error({
                        message: 'Từ chối thất bại',
                        description: response.message || 'Không thể từ chối bài đăng',
                        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                        duration: 4,
                        placement: 'topRight'
                    });
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
            })
            .finally(() => {
                setRejectModalVisible(false);
                setRejectTargetPostId(null);
            });
    };

    const handleRejectCancel = () => {
        setRejectModalVisible(false);
        setRejectTargetPostId(null);
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
                    case 'PENDING':
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
                    {activeTab === 'moderation' && record.status === 'PENDING' && (
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
                            <Button onClick={() => openEditModal(record)}>Sửa</Button>
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
                                                                    title="Tổng số bài chờ duyệt"
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
                                                        <Row gutter={16} className="mb-4">
                                                            <Col span={6}>
                                                                <Statistic
                                                                    title="Tổng số bài đã duyệt"
                                                                    value={stats.approved}
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

            {/* Controlled reject confirmation modal (visible when user clicks Từ chối) */}
            <Modal
                title="Xác nhận từ chối"
                open={rejectModalVisible}
                onOk={handleRejectConfirm}
                onCancel={handleRejectCancel}
                okText="Từ chối"
                cancelText="Hủy"
            >
                <p>Khi từ chối bài đăng, hệ thống sẽ hoàn trả 100,000 VND về ví của người đăng. Bạn có chắc chắn muốn từ chối?</p>
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
                                        selectedPost.status === 'PENDING' ? 'Chờ duyệt' :
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
            {/* Edit modal for admin */}
            <Modal
                title="Chỉnh sửa bài đăng"
                open={editModalVisible}
                onCancel={() => { setEditModalVisible(false); setEditPost(null); }}
                onOk={handleEditSubmit}
                okText="Lưu"
                confirmLoading={editLoading}
                width={800}
            >
                {editPreparing || !editPost ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin tip="Đang tải..." />
                    </div>
                ) : (
                    <Form form={form} layout="vertical" initialValues={{}}>
                        <Form.Item name="postId" label="PostId" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>

                        {editPost.type === 'VEHICLE' && (
                            <>
                                <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
                                    {vehicleBrands && vehicleBrands.length > 0 ? (
                                        <Select options={(vehicleBrands || []).map(b => ({ label: b.brandName || b.BrandName || b.name || b.Name, value: b.brandId || b.BrandId }))} />
                                    ) : (
                                        <Input placeholder="Không có danh sách thương hiệu — nhập BrandId hoặc tên" />
                                    )}
                                </Form.Item>
                                <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
                                    <Input type="number" />
                                </Form.Item>
                                <Form.Item name="mileage" label="Số km">
                                    <Input type="number" />
                                </Form.Item>
                            </>
                        )}

                        {editPost.type === 'BATTERY' && (
                            <>
                                <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}>
                                    {batteryBrands && batteryBrands.length > 0 ? (
                                        <Select options={(batteryBrands || []).map(b => ({ label: b.brandName || b.BrandName || b.name || b.Name, value: b.brandId || b.BrandId }))} />
                                    ) : (
                                        <Input placeholder="Không có danh sách thương hiệu — nhập BrandId hoặc tên" />
                                    )}
                                </Form.Item>
                                <Form.Item name="capacity" label="Dung lượng" rules={[{ required: true }]}>
                                    <Input type="number" />
                                </Form.Item>
                                <Form.Item name="condition" label="Tình trạng" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                            </>
                        )}

                        <Form.Item label="Hình ảnh hiện có">
                            {(editPost.postImages || editPost.imageUrls || []).length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {(editPost.postImages || editPost.imageUrls || []).map((img, idx) => {
                                        const url = img.imageUrl || img.ImageUrl || img || img.url;
                                        const id = img.imageId || img.ImageId || img.id || null;
                                        const keep = id ? keepImageIds.includes(id.toString()) : true;
                                        return (
                                            <div key={idx} style={{ position: 'relative' }}>
                                                <Image src={url} width={120} height={80} />
                                                {id && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                        <Checkbox checked={keep} onChange={() => {
                                                            if (keep) handleRemoveExistingImage(id.toString());
                                                            else setKeepImageIds(prev => [...prev, id.toString()]);
                                                        }}>Giữ</Checkbox>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div>Không có hình ảnh</div>
                            )}
                        </Form.Item>

                        <Form.Item label="Thêm ảnh mới">
                            <Upload {...uploadProps} listType="picture">
                                <Button>Chọn ảnh</Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default AdminPostsPage;