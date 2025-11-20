import { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Form, Row, Col, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { brandAPI } from '../../services/brandAPI';

export default function BrandsPage() {
    const [vehicleBrands, setVehicleBrands] = useState([]);
    const [batteryBrands, setBatteryBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [type, setType] = useState('vehicle');

    const [form] = Form.useForm();

    const load = async () => {
        setLoading(true);
        try {
            const vResp = await brandAPI.getVehicleBrands();
            const bResp = await brandAPI.getBatteryBrands();
            if (vResp.success) {
                const rawV = vResp.data || [];
                const mappedV = (Array.isArray(rawV) ? rawV : []).map(b => ({
                    brandId: b.BrandId || b.brandId,
                    brandName: b.BrandName || b.brandName || b.Name || b.name
                }));
                setVehicleBrands(mappedV);
            }
            if (bResp.success) {
                const rawB = bResp.data || [];
                const mappedB = (Array.isArray(rawB) ? rawB : []).map(b => ({
                    brandBatteryId: b.BrandId || b.brandId || b.BrandBatteryId,
                    brandName: b.BrandName || b.brandName || b.Name || b.name
                }));
                setBatteryBrands(mappedB);
            }
        } catch (err) {
            console.error('Load brands error', err);
            message.error('Không thể tải danh sách thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = (t) => {
        setType(t);
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (t, record) => {
        setType(t);
        setEditing(record);
        form.setFieldsValue({ name: record.brandName || record.BrandName });
        setModalOpen(true);
    };

    const handleDelete = async (t, id) => {
        try {
            setLoading(true);
            let resp;
            if (t === 'vehicle') resp = await brandAPI.deleteVehicleBrand(id);
            else resp = await brandAPI.deleteBatteryBrand(id);
            if (resp.success) {
                message.success('Xóa thành công');
                load();
            } else message.error(resp.message || 'Xóa thất bại');
        } catch (err) {
            console.error(err);
            message.error('Lỗi khi xóa');
        } finally { setLoading(false); }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            let resp;
            if (type === 'vehicle') {
                if (editing) resp = await brandAPI.updateVehicleBrand({ BrandId: editing.brandId || editing.BrandId, BrandName: values.name });
                else resp = await brandAPI.createVehicleBrand({ BrandName: values.name });
            } else {
                if (editing) resp = await brandAPI.updateBatteryBrand({ BatteryBrandId: editing.brandBatteryId || editing.BrandBatteryId || editing.BrandId, BrandName: values.name });
                else resp = await brandAPI.createBatteryBrand({ BrandName: values.name });
            }

            if (resp.success) {
                message.success('Thao tác thành công');
                setModalOpen(false);
                load();
            } else {
                message.error(resp.message || 'Thao tác thất bại');
            }
        } catch (err) {
            console.error('Submit brand error', err);
            message.error('Lỗi khi gửi dữ liệu');
        } finally { setLoading(false); }
    };

    const vehicleCols = [
        { title: 'Tên', dataIndex: 'brandName', key: 'brandName', render: (_, r) => r.brandName || r.BrandName },
        {
            title: 'Hành động', key: 'action', render: (_, r) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openEdit('vehicle', r)}>Sửa</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete('vehicle', r.brandId || r.BrandId)}>Xóa</Button>
                </Space>
            )
        }
    ];

    const batteryCols = [
        { title: 'Tên', dataIndex: 'brandName', key: 'brandName', render: (_, r) => r.brandName || r.BrandName },
        {
            title: 'Hành động', key: 'action', render: (_, r) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openEdit('battery', r)}>Sửa</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete('battery', r.brandBatteryId || r.BrandBatteryId || r.BrandId)}>Xóa</Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Row gutter={16} className="mb-4">
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('vehicle')}>Thêm Vehicle Brand</Button>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('battery')}>Thêm Battery Brand</Button>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <h3>Vehicle Brands</h3>
                    <Table columns={vehicleCols} dataSource={vehicleBrands} rowKey={r => r.brandId || r.BrandId} loading={loading} />
                </Col>
                <Col span={12}>
                    <h3>Battery Brands</h3>
                    <Table columns={batteryCols} dataSource={batteryBrands} rowKey={r => r.brandBatteryId || r.BrandBatteryId} loading={loading} />
                </Col>
            </Row>

            <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} title={editing ? 'Chỉnh sửa thương hiệu' : 'Tạo thương hiệu'}>
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên thương hiệu' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
