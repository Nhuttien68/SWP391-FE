import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    message,
    Tag,
    Popconfirm,
    Descriptions
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { postPackageAPI } from '../../services/postPackageAPI';

const PostPackagePage = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const result = await postPackageAPI.getAllPackages();
            console.log('API Result:', result); // Debug
            if (result.success) {
                // API trả về mảng BaseResponse, mỗi item có data bên trong
                const packagesData = Array.isArray(result.data)
                    ? result.data.map(item => item.data || item.Data).filter(Boolean)
                    : [];
                console.log('Packages Data:', packagesData); // Debug
                setPackages(packagesData);
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Không thể tải danh sách gói');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPackage(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingPackage(record);
        form.setFieldsValue({
            packageName: record.packageName,
            price: record.price,
            durationInDays: record.durationInDays
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const result = await postPackageAPI.deletePackage(id);
            if (result.success) {
                message.success(result.message);
                fetchPackages();
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Không thể xóa gói');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                PackageName: values.packageName,
                Price: values.price,
                DurationInDays: values.durationInDays
            };

            let result;
            if (editingPackage) {
                payload.Id = editingPackage.id;
                result = await postPackageAPI.updatePackage(payload);
            } else {
                result = await postPackageAPI.createPackage(payload);
            }

            if (result.success) {
                message.success(result.message);
                setModalVisible(false);
                form.resetFields();
                fetchPackages();
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('Không thể lưu gói');
            console.error('Submit error:', error);
        }
    };

    const showDetail = (record) => {
        setSelectedPackage(record);
        setDetailModalVisible(true);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const columns = [
        {
            title: 'Tên Gói',
            dataIndex: 'packageName',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-semibold">{text}</div>
                    <div className="text-xs text-gray-500">ID: {record.id?.substring(0, 8)}</div>
                </div>
            )
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (value) => <span className="font-semibold text-green-600">{formatCurrency(value)}</span>,
            sorter: (a, b) => a.price - b.price
        },
        {
            title: 'Thời hạn',
            dataIndex: 'durationInDays',
            key: 'duration',
            render: (days) => (
                <Tag color="blue">{days} ngày</Tag>
            ),
            sorter: (a, b) => a.durationInDays - b.durationInDays
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'status',
            render: (isActive) => (
                <Tag icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Hoạt động' : 'Ngừng'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Ngừng', value: false }
            ],
            onFilter: (value, record) => record.isActive === value
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'created',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '—',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => showDetail(record)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa gói này?"
                        description="Bạn có chắc muốn xóa gói đăng bài này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold m-0">Quản Lý Gói Đăng Bài</h2>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size="large"
                        >
                            Tạo Gói Mới
                        </Button>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={packages}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} gói`
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingPackage ? 'Chỉnh Sửa Gói' : 'Tạo Gói Mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Tên Gói"
                        name="packageName"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên gói' },
                            { max: 100, message: 'Tên gói không quá 100 ký tự' }
                        ]}
                    >
                        <Input placeholder="VD: Gói VIP, Gói Cơ Bản..." />
                    </Form.Item>

                    <Form.Item
                        label="Giá (VNĐ)"
                        name="price"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá' },
                            { type: 'number', min: 0, message: 'Giá phải >= 0' }
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập giá gói"
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời hạn (Ngày)"
                        name="durationInDays"
                        rules={[
                            { required: true, message: 'Vui lòng nhập thời hạn' },
                            { type: 'number', min: 1, message: 'Thời hạn phải >= 1 ngày' }
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            placeholder="Nhập số ngày"
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingPackage ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi Tiết Gói"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedPackage && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Tên Gói">
                            {selectedPackage.packageName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá">
                            <span className="font-semibold text-green-600">
                                {formatCurrency(selectedPackage.price)}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời hạn">
                            <Tag color="blue">{selectedPackage.durationInDays} ngày</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag
                                icon={selectedPackage.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                color={selectedPackage.isActive ? 'success' : 'error'}
                            >
                                {selectedPackage.isActive ? 'Hoạt động' : 'Ngừng'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {selectedPackage.description || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {selectedPackage.createdAt ? new Date(selectedPackage.createdAt).toLocaleString('vi-VN') : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Package ID">
                            <code className="text-xs">{selectedPackage.id}</code>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default PostPackagePage;
