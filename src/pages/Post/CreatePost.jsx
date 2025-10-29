import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/postAPI';
import { brandAPI } from '../../services/brandAPI';
import { Form, Input, Select, Button, Upload, message, InputNumber, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const CreatePost = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const [form] = Form.useForm();

    const [vehicleBrands, setVehicleBrands] = useState([]);
    const [batteryBrands, setBatteryBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageList, setImageList] = useState([]);
    const [postType, setPostType] = useState('vehicle');

    useEffect(() => {
        // Wait until auth check completes to avoid race with AuthProvider
        if (isLoading) return;

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchBrands();
    }, [isAuthenticated, isLoading]);

    const fetchBrands = async () => {
        try {
            const [vehicleResponse, batteryResponse] = await Promise.all([
                brandAPI.getVehicleBrands(),
                brandAPI.getBatteryBrands()
            ]);

            if (vehicleResponse.success) {
                setVehicleBrands(vehicleResponse.data);
            }
            if (batteryResponse.success) {
                setBatteryBrands(batteryResponse.data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            message.error('Không thể tải danh sách thương hiệu');
        }
    };


    const onFinish = async (values) => {
        try {
            setLoading(true);

            const postData = new FormData();
            postData.append('type', values.type);
            postData.append('title', values.title);
            postData.append('description', values.description || '');
            postData.append('price', Number(values.price));

            console.log('Sending data:', postData); // Để debug

            // BE chưa hỗ trợ upload ảnh nên tạm bỏ qua
            imageList.forEach((file) => {
                postData.append('images', file.originFileObj);
            });

            // Backend expects nested vehicleCreateDto fields when binding from a form
            if (values.type === 'vehicle') {
                postData.append('vehicleCreateDto.brandId', values.brandId);
                postData.append('vehicleCreateDto.model', values.model);
                postData.append('vehicleCreateDto.year', values.year);
                postData.append('vehicleCreateDto.mileage', values.mileage);
            }
            else {
                postData.append('batteryCreateDto.branId', values.capacity);
                postData.append('batteryCreateDto.capacity', values.capacity);
                postData.append('batteryCreateDto.condition', values.condition);
            }

            const response = await postAPI.createPost(postData, values.type);
            if (response.success) {
                message.success('Tạo bài đăng thành công!');
                navigate('/'); // Chuyển về trang chủ sau khi tạo thành công
            } else {
                message.error(response.message || 'Có lỗi xảy ra khi tạo bài đăng');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            message.error('Có lỗi xảy ra khi tạo bài đăng');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Bạn chỉ có thể tải lên file ảnh!');
                return false;
            }
            return false;
        },
        onChange: ({ fileList }) => {
            setImageList(fileList);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Tạo Bài Đăng Mới</h1>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ 
                    type: postType,
                    title: "wawa title",
                    description: "wawa description",
                    price: 1000000,
                    model: "wawa model",
                    year: 2020,
                    mileage: 10000
                 }}
            >
                <Form.Item
                    name="type"
                    label="Loại tin đăng"
                >
                    <Radio.Group onChange={(e) => setPostType(e.target.value)}>
                        <Radio value="vehicle">Xe điện</Radio>
                        <Radio value="battery">Pin xe điện</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                    <Input placeholder="Nhập tiêu đề bài đăng" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm" value="wawa description" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá"
                    rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                >
                    <InputNumber
                        className="w-full"
                        placeholder="Nhập giá"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    name="brandId"
                    label="Thương hiệu"
                    rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
                >
                    <Select placeholder="Chọn thương hiệu">
                        {postType === 'vehicle'
                            ? vehicleBrands.map(brand => (
                                <Select.Option key={brand.brandId} value={brand.brandId}>
                                    {brand.brandName}
                                </Select.Option>
                            ))
                            : batteryBrands.map(brand => (
                                <Select.Option key={brand.brandId} value={brand.brandId}>
                                    {brand.brandName}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Form.Item>

                {postType === 'vehicle' ? (
                    <>
                        <Form.Item
                            name="model"
                            label="Model"
                            rules={[{ required: true, message: 'Vui lòng nhập model!' }]}
                        >
                            <Input placeholder="Nhập model xe" />
                        </Form.Item>

                        <Form.Item
                            name="year"
                            label="Năm sản xuất"
                            rules={[{ required: true, message: 'Vui lòng nhập năm sản xuất!' }]}
                        >
                            <InputNumber className="w-full" placeholder="Nhập năm sản xuất" />
                        </Form.Item>

                        <Form.Item
                            name="mileage"
                            label="Số km đã đi"
                            rules={[{ required: true, message: 'Vui lòng nhập số km đã đi!' }]}
                        >
                            <InputNumber className="w-full" placeholder="Nhập số km đã đi" />
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item
                            name="capacity"
                            label="Dung lượng"
                            rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin!' }]}
                        >
                            <Input placeholder="Nhập dung lượng pin (VD: 4000mAh)" />
                        </Form.Item>

                        <Form.Item
                            name="condition"
                            label="Tình trạng"
                            rules={[{ required: true, message: 'Vui lòng chọn tình trạng!' }]}
                        >
                            <Select placeholder="Chọn tình trạng">
                                <Select.Option value="new">Mới</Select.Option>
                                <Select.Option value="like-new">Như mới</Select.Option>
                                <Select.Option value="used">Đã sử dụng</Select.Option>
                            </Select>
                        </Form.Item>
                    </>
                )}

                <Form.Item
                    name="images"
                    label="Hình ảnh"
                    rules={[{ required: true, message: 'Vui lòng tải lên ít nhất 1 hình ảnh!' }]}
                >
                    <Upload
                        listType="picture"
                        maxCount={5}
                        multiple
                        {...uploadProps}
                    >
                        <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                        Tạo bài đăng
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreatePost;