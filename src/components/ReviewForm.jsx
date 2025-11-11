import React, { useState, useEffect } from 'react';
import { Modal, Form, Rate, Input, Button, message, Select, Empty, Spin } from 'antd';
import reviewAPI from '../services/reviewAPI';
import transactionAPI from '../services/transactionAPI';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const ReviewForm = ({ open, onClose, sellerId, postId, transactionIdFromOrder, onSubmitted }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [eligibleTx, setEligibleTx] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const navigate = useNavigate();

  // If called from Orders with a specific transaction, pre-fill it so user
  // doesn't need to re-enter the transaction id.
  useEffect(() => {
    if (!open) return;
    if (transactionIdFromOrder) {
      try {
        const tx = transactionIdFromOrder.toString().toUpperCase();
        form.setFieldsValue({ transactionId: tx });
      } catch (e) {
        // ignore
      }
    }
  }, [open, transactionIdFromOrder, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('[ReviewForm] handleOk start', { postId, transactionIdFromOrder });
      setSubmitting(true);

      // Backend requires transactionId; frontend will pass what user provides.
      const payload = {
        TransactionId: values.transactionId ? values.transactionId.toString().toUpperCase() : values.transactionId,
        Rating: values.rating,
        Comment: values.comment,
      };

      // Use seller review endpoint (frontend no longer supports post reviews)
      const res = await reviewAPI.createReviewForSeller(payload);
      // Normalize various backend response shapes. Backend may return
      // { success: true, ... } or { Status: "200", Message: "..." }
      const ok = !!(res && (
        res.success === true ||
        res.Success === true ||
        (res.Status && Number(res.Status) >= 200 && Number(res.Status) < 300) ||
        (res.status && Number(res.status) >= 200 && Number(res.status) < 300)
      ));

      if (ok) {
        console.log('[ReviewForm] createReview success', { res });
        message.success(res?.Message || res?.message || 'Đã gửi đánh giá');
        form.resetFields();
        // include the transaction id as well to help parent resolve the post when needed
        const submittedInfo = { postId, transactionId: payload.TransactionId || transactionIdFromOrder };
        console.log('[ReviewForm] calling onSubmitted with', submittedInfo);
        onSubmitted && onSubmitted(submittedInfo);
        try {
          console.log('[ReviewForm] calling onClose');
          onClose && onClose();
        } catch (e) { console.error('[ReviewForm] onClose error', e); }
      } else {
        console.log('[ReviewForm] createReview not ok', { res });
        message.error(res?.Message || res?.message || 'Không thể gửi đánh giá');
      }
    } catch (err) {
      console.error('[ReviewForm] handleOk error', err);
      // validation failure or API error
      if (err?.response?.data?.Message) {
        message.error(err.response.data.Message);
      } else if (err?.message) {
        message.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    // Load user's purchases and filter completed transactions for this seller/post
    const loadEligible = async () => {
      setLoadingTx(true);
      try {
        const res = await transactionAPI.getMyPurchases();
        const list = res?.data?.data || res?.data || [];
        // filter transactions that are COMPLETED and match sellerId or postId
        const filtered = (Array.isArray(list) ? list : []).filter(t => {
          const status = (t.status || t.Status || '').toString().toUpperCase();
          const txSellerId = t.sellerId || t.SellerId || t.seller?.userId || t.sellerId;
          const txPostId = t.postId || t.PostId || t.post?.postId || t.postId;
          const matchesSeller = sellerId ? String(txSellerId) === String(sellerId) : true;
          const matchesPost = postId ? String(txPostId) === String(postId) : true;
          return status === 'COMPLETED' && matchesSeller && matchesPost;
        });

        setEligibleTx(filtered.map(t => ({
          label: `${(t.transactionId || t.TransactionId || '').toString().substring(0,8)} - ${new Date(t.createdAt || t.CreatedAt || Date.now()).toLocaleDateString()}`,
          value: (t.transactionId || t.TransactionId || '').toString().toUpperCase()
        })));
      } catch (err) {
        setEligibleTx([]);
      } finally {
        setLoadingTx(false);
      }
    };

    loadEligible();
  }, [open, sellerId, postId]);

  return (
    <Modal
      title="Gửi đánh giá cho người bán"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleOk} disabled={loadingTx || (!transactionIdFromOrder && eligibleTx.length === 0)}>
          Gửi đánh giá
        </Button>
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ rating: 5 }}>
        <Form.Item
          label="Giao dịch hoàn thành"
          name="transactionId"
          rules={[{ required: true, message: 'Vui lòng chọn giao dịch hoàn thành để xác thực đánh giá' }]}
        >
          {transactionIdFromOrder ? (
            // Let Form control the value (we pre-set it via form.setFieldsValue). Do not pass `value` prop so validation picks it up.
            <Input disabled />
          ) : loadingTx ? (
            <div className="text-center"><Spin /></div>
          ) : eligibleTx.length === 0 ? (
            <Empty description="Bạn chưa có giao dịch hoàn thành với người bán này" />
          ) : (
            <Select options={eligibleTx} placeholder="Chọn giao dịch hoàn thành" />
          )}
        </Form.Item>

        <Form.Item label="Đánh giá" name="rating" rules={[{ required: true, message: 'Chọn số sao' }]}> 
          <Rate />
        </Form.Item>

        <Form.Item label="Bình luận" name="comment">
          <TextArea rows={4} placeholder="Viết bình luận của bạn (tùy chọn)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
