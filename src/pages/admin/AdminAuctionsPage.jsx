import { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import auctionAPI from '../../services/auctionAPI';

export default function AdminAuctionsPage(){
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try{
            const resp = await auctionAPI.getActiveAuctions();
            if (resp.success) {
                const list = Array.isArray(resp.data) ? resp.data : resp.data?.Data ?? [];
                setAuctions(list);
            } else message.error(resp.message || 'Không thể tải auctions');
        }catch(err){ console.error(err); message.error('Lỗi khi tải auctions'); }
        finally{ setLoading(false); }
    };

    useEffect(()=>{ load(); }, []);

    const handleCloseExpired = async () => {
        try{
            setLoading(true);
            const resp = await auctionAPI.closeExpiredAuctions();
            if (resp.success) {
                message.success('Đã đóng các phiên hết hạn');
                load();
            } else message.error(resp.message || 'Đóng thất bại');
        }catch(err){ console.error(err); message.error('Lỗi'); } finally{ setLoading(false); }
    };

    const columns = [
        { title: 'AuctionId', dataIndex: 'auctionId', key: 'auctionId' },
        { title: 'Post', dataIndex: ['post','title'], key: 'post', render: (_, r) => r.post?.title || r.postTitle || '—' },
        { title: 'Start', dataIndex: 'startAt', key: 'startAt', render: (d) => new Date(d).toLocaleString() },
        { title: 'End', dataIndex: 'endAt', key: 'endAt', render: (d) => new Date(d).toLocaleString() },
        { title: 'CurrentPrice', dataIndex: 'currentPrice', key: 'currentPrice', render: v => v?.toLocaleString?.() + ' VND' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: s => s },
        { title: 'Actions', key: 'action', render: (_, r) => (
            <Space>
                <Button onClick={() => window.open(`/auctions/${r.auctionId || r.AuctionId}`, '_blank')}>View</Button>
            </Space>
        ) }
    ];

    return (
        <div>
            <h2>Quản lý Auctions</h2>
            <div className="mb-4">
                <Button type="primary" onClick={handleCloseExpired}>Đóng phiên hết hạn</Button>
            </div>
            <Table columns={columns} dataSource={auctions} rowKey={r=> r.auctionId || r.AuctionId} loading={loading} />
        </div>
    );
}
