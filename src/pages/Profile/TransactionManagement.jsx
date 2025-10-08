import { Card, Table, Tag, Select } from "antd";
import { useState } from "react";

const TransactionManagement = () => {
    const [status, setStatus] = useState("Tất cả");

    const data = [
        {
            key: "1",
            buyer: "Nguyễn Văn A",
            seller: "Trần Thị B",
            amount: 1200000,
            payment_method: "VNPay",
            status: "Completed",
            created_at: "2025-10-06",
        },
        {
            key: "2",
            buyer: "Lê Hoàng C",
            seller: "Phạm Minh D",
            amount: 950000,
            payment_method: "Momo",
            status: "Pending",
            created_at: "2025-10-05",
        },
    ];

    const filteredData =
        status === "Tất cả" ? data : data.filter((item) => item.status === status);

    const columns = [
        { title: "Người mua", dataIndex: "buyer", key: "buyer" },
        { title: "Người bán", dataIndex: "seller", key: "seller" },
        {
            title: "Số tiền (VNĐ)",
            dataIndex: "amount",
            key: "amount",
            render: (text) => text.toLocaleString("vi-VN"),
        },
        { title: "Phương thức", dataIndex: "payment_method", key: "payment_method" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color =
                    status === "Completed"
                        ? "green"
                        : status === "Pending"
                            ? "orange"
                            : "red";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        { title: "Ngày tạo", dataIndex: "created_at", key: "created_at" },
    ];

    return (
        <div className="p-6 space-y-4">
            <Card title="Quản lý giao dịch" className="shadow-lg rounded-2xl">
                <div className="flex justify-end mb-4">
                    <Select
                        value={status}
                        onChange={setStatus}
                        options={[
                            { label: "Tất cả", value: "Tất cả" },
                            { label: "Pending", value: "Pending" },
                            { label: "Completed", value: "Completed" },
                            { label: "Failed", value: "Failed" },
                        ]}
                        className="w-40"
                    />
                </div>
                <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} />
            </Card>
        </div>
    );
};

export default TransactionManagement;
