import React, { useEffect, useState } from 'react';
import { Result, Button, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { walletAPI } from '../../services/walletAPI';

// Helper to parse query params
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const PaymentReturn = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        // VNPay will redirect with query params: vnp_ResponseCode, vnp_Amount, etc.
        const responseCode = query.get('vnp_ResponseCode');
        const vnpAmount = query.get('vnp_Amount');
        // vnp_Amount is in smallest unit (VND * 100)
        const amountVND = vnpAmount ? parseInt(vnpAmount, 10) / 100 : 0;
        setAmount(amountVND);

        if (responseCode === '00') {
            // Payment success
            setSuccess(true);
            setMessage('Nạp tiền thành công!');
        } else {
            setSuccess(false);
            setMessage('Thanh toán thất bại hoặc bị hủy.');
        }
        setLoading(false);
    }, [query]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            {loading ? (
                <Spin size="large" />
            ) : (
                <Result
                    status={success ? 'success' : 'error'}
                    title={success ? 'Nạp tiền thành công' : 'Nạp tiền thất bại'}
                    subTitle={
                        success
                            ? `Bạn đã nạp ${amount.toLocaleString('vi-VN')} VNĐ vào ví.`
                            : message
                    }
                    extra={[
                        <Button type="primary" key="wallet" onClick={() => navigate('/profile?view=wallet')}>Quay về quản lý ví</Button>,
                        <Button key="home" onClick={() => navigate('/')}>Về trang chủ</Button>
                    ]}
                />
            )}
        </div>
    );
};

export default PaymentReturn;