import { useEffect, useState } from 'react';
import { Table, Button, message, Space } from 'antd';
import { postAPI } from '../../services/postAPI';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function VehiclesPage(){
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try{
            const resp = await postAPI.getAllPosts();
            const list = resp.data ?? resp;
            const vehicles = (Array.isArray(list) ? list : []).filter(p => (p.type||p.Type) === 'VEHICLE');
            setPosts(vehicles);
        }catch(err){
            console.error(err);
            message.error('Không thể tải bài đăng xe');
        }finally{ setLoading(false); }
    };

    useEffect(()=>{ load(); }, []);

    const handleDelete = async (postId) => {
        try{
            setLoading(true);
            const resp = await postAPI.deletePost(postId);
            if (resp.success) {
                message.success('Xóa thành công');
                load();
            } else message.error(resp.message || 'Xóa thất bại');
        }catch(err){ console.error(err); message.error('Lỗi'); } finally { setLoading(false); }
    };

    const columns = [
        { title: 'Tên xe', dataIndex: ['vehicle','brandName'], key: 'name', render: (_, r) => {
            const vehicle = r.vehicle || r.Vehicle;
            if (!vehicle) return r.title || r.Title || 'N/A';
            return `${vehicle.brandName || vehicle.BrandName || ''} ${vehicle.model || vehicle.Model || ''}`.trim();
        }},
        { title: 'Giá', dataIndex: 'price', key: 'price', render: (v) => v?.toLocaleString?.() + ' VND' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (_, r) => r.status || r.Status },
        { title: 'Hành động', key: 'action', render: (_, r) => (
            <Space>
                <Button icon={<EditOutlined/>} onClick={() => navigate(`/posts/edit/${r.postId || r.PostId}`)}>Sửa</Button>
                <Button danger icon={<DeleteOutlined/>} onClick={() => handleDelete(r.postId || r.PostId)}>Xóa</Button>
            </Space>
        ) }
    ];

    return (
        <div>
            <h2>Quản lý Vehicles (bài đăng loại VEHICLE)</h2>
            <Table columns={columns} dataSource={posts} rowKey={r=> r.postId || r.PostId} loading={loading} />
        </div>
    );
}
