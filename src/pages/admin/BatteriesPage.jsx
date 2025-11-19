import { useEffect, useState } from 'react';
import { Table, Button, message, Space } from 'antd';
import { postAPI } from '../../services/postAPI';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function BatteriesPage(){
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try{
            const resp = await postAPI.getAllPosts();
            const list = resp.data ?? resp;
            const batteries = (Array.isArray(list) ? list : []).filter(p => (p.type||p.Type) === 'BATTERY');
            setPosts(batteries);
        }catch(err){
            console.error(err);
            message.error('Không thể tải bài đăng pin');
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
        { title: 'Tên pin', dataIndex: ['battery','brandName'], key: 'name', render: (_, r) => {
            const battery = r.battery || r.Battery;
            if (!battery) return r.title || r.Title || 'N/A';
            return `${battery.brandName || battery.BrandName || ''} ${battery.capacity || battery.Capacity || ''}`.trim();
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
            <h2>Quản lý Batteries (bài đăng loại BATTERY)</h2>
            <Table columns={columns} dataSource={posts} rowKey={r=> r.postId || r.PostId} loading={loading} />
        </div>
    );
}
