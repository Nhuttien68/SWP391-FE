import { useEffect, useState } from 'react';
import { Table, Button, Space, message, Tag } from 'antd';
import { transactionAPI } from '../../services/transactionAPI';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const resp = await transactionAPI.getAllTransactions();
            if (resp.success) {
                const raw = resp.data ?? resp;
                const list = Array.isArray(raw)
                    ? raw
                    : (Array.isArray(raw?.Data) ? raw.Data : (Array.isArray(raw?.data) ? raw.data : []));

                // Normalize items to camelCase keys to make table rendering consistent
                const mapped = (list || []).map(item => ({
                    transactionId: item.transactionId ?? item.TransactionId,
                    postTitle: item.postTitle ?? item.PostTitle,
                    buyerName: item.buyerName ?? item.BuyerName ?? item.buyerName ?? item.BuyerName,
                    sellerName: item.sellerName ?? item.SellerName,
                    amount: item.amount ?? item.Amount,
                    paymentMethod: item.paymentMethod ?? item.PaymentMethod,
                    status: item.status ?? item.Status,
                    createdAt: item.createdAt ?? item.CreatedAt,
                    raw: item
                }));

                setTransactions(mapped);
            } else {
                console.error('Transactions API error', resp);
                message.error(resp.message || 'Không thể tải giao dịch');
            }
        } catch (err) {
            console.error('Load transactions error', err);
            message.error('Lỗi khi tải giao dịch');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCancel = async (id) => {
        try {
            setLoading(true);
            const resp = await transactionAPI.cancelTransaction(id);
            if (resp.success) {
                message.success('Giao dịch đã bị hủy');
                load();
            } else message.error(resp.message || 'Hủy thất bại');
        } catch (err) { console.error(err); message.error('Lỗi'); } finally { setLoading(false); }
    };

    const columns = [
        { title: 'ID', dataIndex: 'transactionId', key: 'transactionId' },
        { title: 'Post', dataIndex: 'postTitle', key: 'postTitle', render: (v) => v || '—' },
        { title: 'Buyer', dataIndex: 'buyerName', key: 'buyerName' },
        { title: 'Seller', dataIndex: 'sellerName', key: 'sellerName' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (v) => v?.toLocaleString?.() + ' VND' },
        { title: 'Payment', dataIndex: 'paymentMethod', key: 'paymentMethod' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag>{s}</Tag> },
        { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '—' },
        { title: 'Actions', key: 'action', render: (_, r) => (
            <Space>
                <Button onClick={() => window.open(`/transactions/${r.transactionId || r.TransactionId}`, '_blank')}>View</Button>
                <Button danger onClick={() => handleCancel(r.transactionId || r.TransactionId)}>Cancel</Button>
            </Space>
        ) }
    ];

    return (
        <div>
            <h2>Quản lý Giao dịch</h2>
            <Table columns={columns} dataSource={transactions} rowKey={r => r.transactionId || r.TransactionId} loading={loading} />
        </div>
    );
}
