import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component này dùng cho các route như Login, Register
// Nếu user đã đăng nhập thì sẽ redirect về trang chủ
const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // Nếu đã đăng nhập, chuyển về trang chủ
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Nếu chưa đăng nhập, hiển thị component
    return children;
};

export default PublicOnlyRoute;