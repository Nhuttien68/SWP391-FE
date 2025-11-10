import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Empty, Pagination, Typography } from 'antd';
import PostCard from '../Post/PostCard.jsx';
import { postAPI } from '../../services/postAPI';

const { Title } = Typography;

const ProfilePosts = () => {
    const [myPosts, setMyPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        loadMyPosts();
    }, []);

    const loadMyPosts = async () => {
        setLoadingPosts(true);
        try {
            const res = await postAPI.getMyPosts({ page: 1, pageSize: 200 });
            const postsData = res?.data?.data || res?.data || [];
            const normalized = postsData.map((p) => ({ ...p, id: p.id ?? p.postId ?? p.postID }));
            setMyPosts(normalized);
        } catch (err) {
            console.error('Error loading my posts', err);
        } finally {
            setLoadingPosts(false);
        }
    };

    return (
        <div className="p-6 min-h-[80vh] bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <Card>
                        <div className="mb-4 flex justify-between items-center">
                            <Title level={4} className="!mb-0">Bài đăng của tôi</Title>
                        </div>
                        {myPosts.length === 0 ? (
                            <Empty description="Bạn chưa có bài đăng nào" />
                        ) : (
                            <>
                                <Row gutter={[16, 16]}>
                                    {myPosts.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize).map(post => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
                                            <PostCard post={post} />
                                        </Col>
                                    ))}
                                </Row>
                                <div className="text-center mt-6">
                                    <Pagination
                                        current={currentPage}
                                        total={myPosts.length}
                                        pageSize={pageSize}
                                        onChange={(p) => setCurrentPage(p)}
                                    />
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePosts;
