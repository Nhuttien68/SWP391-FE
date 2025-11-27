import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/postAPI';
import { walletAPI } from '../../services/walletAPI';
import { brandAPI } from '../../services/brandAPI';
import PostPackageSelector from './PostPackageSelector';
import {
    Form,
    Input,
    Select,
    Button,
    Upload,
    message,
    InputNumber,
    Radio,
    Card,
    Steps,
    Space,
    Typography,
    Divider,
    Row,
    Col,
    Alert,
    Modal
} from 'antd';
import {
    UploadOutlined,
    DollarOutlined,
    CarOutlined,
    FileTextOutlined,
    PictureOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

const CreatePost = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const [form] = Form.useForm();

    const [vehicleBrands, setVehicleBrands] = useState([]);
    const [batteryBrands, setBatteryBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageList, setImageList] = useState([]);
    const [postType, setPostType] = useState('vehicle');
    const [currentStep, setCurrentStep] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [selectedPackageId, setSelectedPackageId] = useState(null);

    const POSTING_FEE = 100000; // Giữ lại để hiển thị thông báo legacy

    useEffect(() => {
        // Wait until auth check completes to avoid race with AuthProvider
        if (isLoading) return;

        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để tạo bài đăng');
            navigate('/login');
            return;
        }

        fetchBrands();
        checkWallet();
    }, [isAuthenticated, isLoading, navigate]);

    const checkWallet = async () => {
        try {
            const walletResp = await walletAPI.getWallet();
            if (walletResp.success) {
                const balance = walletResp.data?.Balance ?? walletResp.data?.balance ?? 0;
                setWalletBalance(balance);
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
        }
    };

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
        console.log('=== STARTING POST CREATION ===');
        console.log('Form values:', values);
        console.log('Post type:', postType);
        console.log('Image list:', imageList);
        console.log('Selected package ID:', selectedPackageId);

        // Validate package selection
        if (!selectedPackageId) {
            message.error('Vui lòng chọn gói đăng tin!');
            return;
        }

        try {
            setLoading(true);

            // Kiểm tra ví
            console.log('Step 1: Checking wallet...');
            const walletResp = await walletAPI.getWallet();
            console.log('Wallet response:', walletResp);

            if (walletResp.status === '404' || walletResp.status === 404) {
                console.log('Wallet not found, creating new wallet...');
                const createResp = await walletAPI.createWallet();
                if (createResp.success) {
                    message.warning('Ví đã được tạo. Vui lòng nạp tiền vào ví trước khi tạo bài đăng.');
                } else {
                    message.error(createResp.message || 'Không thể tạo ví.');
                }
                setLoading(false);
                return;
            }

            if (!walletResp.success) {
                console.error('Failed to get wallet:', walletResp);
                message.error(walletResp.message || 'Không thể lấy thông tin ví.');
                setLoading(false);
                return;
            }

            // Note: Backend sẽ tự động trừ tiền từ ví dựa theo giá của gói đăng tin
            // Không cần kiểm tra số dư cụ thể ở đây, backend sẽ xử lý

            // Tạo FormData
            console.log('Step 2: Creating FormData...');
            const postData = new FormData();
            postData.append('Title', values.title);
            postData.append('Description', values.description || '');
            postData.append('Price', Number(values.price));
            postData.append('postPackgeID', selectedPackageId);

            // Upload images
            if (imageList && imageList.length > 0) {
                console.log('Adding images:', imageList.length);
                imageList.forEach((file, index) => {
                    console.log(`Image ${index}:`, file.originFileObj);
                    postData.append('Images', file.originFileObj);
                });
            } else {
                console.warn('No images to upload!');
            }

            // Thêm dữ liệu theo loại post
            if (postType === 'vehicle') {
                console.log('Adding vehicle data...');
                postData.append('vehicleCreateDto.BrandId', values.brandId);
                postData.append('vehicleCreateDto.Model', values.model);
                postData.append('vehicleCreateDto.Year', Number(values.year));
                postData.append('vehicleCreateDto.Mileage', Number(values.mileage));
            } else {
                console.log('Adding battery data...');

                postData.append('batteryCreateDto.BranId', values.brandId);
                postData.append('batteryCreateDto.Capacity', Number(values.capacity));
                postData.append('batteryCreateDto.Condition', values.condition);
            }

            // Log FormData
            console.log('Step 3: FormData contents:');
            for (let pair of postData.entries()) {
                console.log(pair[0] + ':', pair[1]);
            }

            const response = await postAPI.createPost(postData, postType);


            if (response.success) {
                console.log('✅ POST CREATED SUCCESSFULLY!');
                message.success('Tạo bài đăng thành công! Bài đăng đang chờ phê duyệt.');
                navigate('/market', { state: { showPendingModal: true } });
            } else {
                console.error('❌ POST CREATION FAILED:', response);
                message.error(response.message || 'Có lỗi xảy ra khi tạo bài đăng');
                console.error('Error details:', response.error);
            }
        } catch (error) {
            console.error('❌ EXCEPTION in onFinish:', error);
            console.error('Error stack:', error.stack);
            message.error('Có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại!');
        } finally {
            setLoading(false);
            console.log('=== END POST CREATION ===');
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Bạn chỉ có thể tải lên file ảnh!');
                return false;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
                return false;
            }
            return false; // Prevent auto upload
        },
        onChange: ({ fileList }) => {
            setImageList(fileList);
        },
        onRemove: (file) => {
            const index = imageList.indexOf(file);
            const newFileList = imageList.slice();
            newFileList.splice(index, 1);
            setImageList(newFileList);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <Card className="mb-6 shadow-lg">
                    <Space direction="vertical" className="w-full" size="large">
                        <div>
                            <Title level={2} className="!mb-2">
                                <FileTextOutlined className="mr-3 text-blue-600" />
                                Tạo Bài Đăng Mới
                            </Title>
                            <Text type="secondary">
                                Điền thông tin chi tiết để đăng tin bán xe điện hoặc pin
                            </Text>
                        </div>

                        {/* Wallet Info Alert */}
                        <Alert
                            message={
                                <Space>
                                    <DollarOutlined />
                                    <Text strong>Thông tin ví</Text>
                                </Space>
                            }
                            description={
                                <Space direction="vertical" size="small">
                                    <Text>
                                        Số dư ví hiện tại: <Text strong className="text-green-600">
                                            {formatCurrency(walletBalance)}
                                        </Text>
                                    </Text>
                                    <Text type="secondary">
                                        Phí đăng tin sẽ được tính dựa trên gói bạn chọn và tự động trừ từ ví.
                                    </Text>
                                </Space>
                            }
                            type="info"
                            showIcon
                        />
                    </Space>
                </Card>

                {/* Form */}
                <Card className="shadow-lg">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{
                            type: postType
                        }}
                        size="large"
                    >
                        {/* Step 1: Loại tin */}
                        <Divider orientation="left">
                            <Space>
                                <CarOutlined />
                                <Text strong>Loại Tin Đăng</Text>
                            </Space>
                        </Divider>

                        <Form.Item name="type">
                            <Radio.Group
                                onChange={(e) => {
                                    setPostType(e.target.value);
                                    form.resetFields(['brandId', 'model', 'year', 'mileage', 'capacity', 'condition']);
                                }}
                                value={postType}
                                className="w-full"
                            >
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Card
                                            hoverable
                                            className={`text-center cursor-pointer ${postType === 'vehicle' ? 'border-blue-500 border-2 bg-blue-50' : ''}`}
                                            onClick={() => {
                                                setPostType('vehicle');
                                                form.setFieldsValue({ type: 'vehicle' });
                                                form.resetFields(['brandId', 'model', 'year', 'mileage', 'capacity', 'condition']);
                                            }}
                                        >
                                            <Radio value="vehicle" className="hidden" />
                                            <Space direction="vertical" align="center" size="middle" className="w-full py-4">
                                                <CarOutlined className="text-5xl text-blue-600" />
                                                <Text strong className="text-lg">Xe Điện</Text>
                                                <Text type="secondary" className="text-sm">Đăng tin bán xe điện</Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Card
                                            hoverable
                                            className={`text-center cursor-pointer ${postType === 'battery' ? 'border-green-500 border-2 bg-green-50' : ''}`}
                                            onClick={() => {
                                                setPostType('battery');
                                                form.setFieldsValue({ type: 'battery' });
                                                form.resetFields(['brandId', 'model', 'year', 'mileage', 'capacity', 'condition']);
                                            }}
                                        >
                                            <Radio value="battery" className="hidden" />
                                            <Space direction="vertical" align="center" size="middle" className="w-full py-4">
                                                <span className="text-5xl">🔋</span>
                                                <Text strong className="text-lg">Pin Xe Điện</Text>
                                                <Text type="secondary" className="text-sm">Đăng tin bán pin</Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                </Row>
                            </Radio.Group>
                        </Form.Item>

                        {/* Step 1.5: Chọn gói đăng tin */}
                        <Divider orientation="left">
                            <Space>
                                <DollarOutlined />
                                <Text strong>Gói Đăng Tin</Text>
                            </Space>
                        </Divider>

                        <PostPackageSelector
                            value={selectedPackageId}
                            onChange={setSelectedPackageId}
                            disabled={loading}
                        />

                        {/* Step 2: Thông tin cơ bản */}
                        <Divider orientation="left">
                            <Space>
                                <FileTextOutlined />
                                <Text strong>Thông Tin Cơ Bản</Text>
                            </Space>
                        </Divider>

                        <Row gutter={16}>
                            <Col xs={24}>
                                <Form.Item
                                    name="title"
                                    label="Tiêu đề bài đăng"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tiêu đề!' },
                                        { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' },
                                        { max: 200, message: 'Tiêu đề không được quá 200 ký tự!' }
                                    ]}
                                >
                                    <Input
                                        placeholder="VD: Xe điện VinFast VF8 2023 - Màu trắng, ít sử dụng"
                                        showCount
                                        maxLength={200}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24}>
                                <Form.Item
                                    name="description"
                                    label="Mô tả chi tiết"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mô tả!' },
                                        { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự!' }
                                    ]}
                                >
                                    <TextArea
                                        rows={6}
                                        placeholder="Nhập mô tả chi tiết về sản phẩm: tình trạng, lịch sử sử dụng, các đặc điểm nổi bật..."
                                        showCount
                                        maxLength={1000}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="price"
                                    label="Giá bán (VND)"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá!' },
                                        {
                                            type: 'number',
                                            min: 1000,
                                            message: 'Giá phải lớn hơn 1.000 VND!'
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        className="w-full"
                                        placeholder="Nhập giá bán"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        addonAfter="VND"
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="brandId"
                                    label="Thương hiệu"
                                    rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
                                >
                                    <Select
                                        placeholder="Chọn thương hiệu"
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {(postType === 'vehicle' ? vehicleBrands : batteryBrands).map(brand => (
                                            <Select.Option key={brand.brandId} value={brand.brandId}>
                                                {brand.brandName}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Step 3: Thông tin chi tiết */}
                        <Divider orientation="left">
                            <Space>
                                <CarOutlined />
                                <Text strong>Thông Tin Chi Tiết</Text>
                            </Space>
                        </Divider>

                        {postType === 'vehicle' ? (
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="model"
                                        label="Model / Phiên bản"
                                        rules={[{ required: true, message: 'Vui lòng nhập model!' }]}
                                    >
                                        <Input placeholder="VD: VF8 Plus" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="year"
                                        label="Năm sản xuất"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập năm sản xuất!' },
                                            {
                                                type: 'number',
                                                min: 2000,
                                                max: new Date().getFullYear() + 1,
                                                message: 'Năm sản xuất không hợp lệ!'
                                            }
                                        ]}
                                    >
                                        <InputNumber
                                            className="w-full"
                                            placeholder="VD: 2023"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="mileage"
                                        label="Số km đã đi"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số km!' },
                                            { type: 'number', min: 0, message: 'Số km phải >= 0!' }
                                        ]}
                                    >
                                        <InputNumber
                                            className="w-full"
                                            placeholder="VD: 15000"
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            addonAfter="km"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        ) : (
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="capacity"
                                        label="Dung lượng pin"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập dung lượng!' },
                                            { type: 'number', min: 1, message: 'Dung lượng phải > 0!' }
                                        ]}
                                    >
                                        <InputNumber
                                            className="w-full"
                                            placeholder="VD: 4000"
                                            addonAfter="mAh"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="condition"
                                        label="Tình trạng"
                                        rules={[{ required: true, message: 'Vui lòng chọn tình trạng!' }]}
                                    >
                                        <Select placeholder="Chọn tình trạng pin">
                                            <Select.Option value="Mới">🆕 Mới 100%</Select.Option>
                                            <Select.Option value="Như mới">✨ Như mới (&gt;95%)</Select.Option>
                                            <Select.Option value="Tốt">👍 Tốt (80-95%)</Select.Option>
                                            <Select.Option value="Trung bình">⚡ Trung bình (60-80%)</Select.Option>
                                            <Select.Option value="Cần thay thế">🔧 Cần thay thế (&lt;60%)</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        {/* Step 4: Hình ảnh */}
                        <Divider orientation="left">
                            <Space>
                                <PictureOutlined />
                                <Text strong>Hình Ảnh Sản Phẩm</Text>
                            </Space>
                        </Divider>

                        <Form.Item
                            rules={[
                                {
                                    validator: (_, value) => {
                                        console.log('Validating images, imageList:', imageList);
                                        if (imageList.length === 0) {
                                            return Promise.reject(new Error('Vui lòng tải lên ít nhất 1 hình ảnh!'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={imageList}
                                maxCount={5}
                                multiple
                                accept="image/*"
                                {...uploadProps}
                            >
                                {imageList.length < 5 && (
                                    <div>
                                        <PictureOutlined className="text-2xl mb-2" />
                                        <div>Tải ảnh lên</div>
                                        <div className="text-xs text-gray-500">
                                            (Tối đa 5 ảnh)
                                        </div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>

                        <Alert
                            message="Lưu ý"
                            description={
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Hình ảnh rõ nét, chất lượng cao sẽ thu hút nhiều người mua hơn</li>
                                    <li>Nên chụp nhiều góc độ khác nhau của sản phẩm</li>
                                    <li>Mỗi ảnh không quá 5MB</li>
                                    <li>Định dạng: JPG, PNG, JPEG</li>
                                </ul>
                            }
                            type="info"
                            className="mb-6"
                        />

                        {/* Submit Button */}
                        <Form.Item>
                            <Space direction="vertical" className="w-full">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    size="large"
                                    block
                                    disabled={!selectedPackageId}
                                    className="h-12 text-lg font-semibold"
                                    onClick={() => {
                                        console.log('Submit button clicked!');
                                        console.log('Current form values:', form.getFieldsValue());
                                        console.log('Image list:', imageList);
                                        console.log('Post type:', postType);
                                        console.log('Selected package ID:', selectedPackageId);
                                    }}
                                >
                                    {!selectedPackageId
                                        ? 'Vui lòng chọn gói đăng tin'
                                        : 'Đăng Tin Ngay'
                                    }
                                </Button>
                            </Space>
                        </Form.Item>

                        {!selectedPackageId && (
                            <Alert
                                message="Chưa chọn gói đăng tin"
                                description="Vui lòng chọn một gói đăng tin phù hợp trước khi tiếp tục."
                                type="warning"
                                showIcon
                            />
                        )}
                        {/* Modal is displayed on the Market page after navigation */}
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default CreatePost;