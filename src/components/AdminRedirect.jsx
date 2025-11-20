import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component tự động redirect admin về trang admin khi truy cập trang home
 */
const AdminRedirect = ({ children }) => {
    const { isAdmin, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated && isAdmin) {
            // Nếu là admin và đang ở trang home, redirect về admin
            if (window.location.pathname === '/' || window.location.pathname === '/home') {
                navigate('/admin', { replace: true });
            }
        }
    }, [isAdmin, isLoading, isAuthenticated, navigate]);

    // Nếu đang loading hoặc chưa redirect, hiển thị children
    if (isLoading) {
        return null; // Hoặc có thể return một loading spinner
    }

    return children;
};

export default AdminRedirect;
