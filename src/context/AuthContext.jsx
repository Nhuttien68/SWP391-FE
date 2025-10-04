import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/authAPI';

// Tạo Auth Context
const AuthContext = createContext();

// Custom hook để sử dụng Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi load app
        const checkAuthStatus = () => {
            const token = localStorage.getItem('token');
            const userData = authAPI.getCurrentUser();

            if (token && userData) {
                setUser(userData);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    // Hàm đăng ký
    const register = async (userData) => {
        setIsLoading(true);
        try {
            const result = await authAPI.register(userData);
            setIsLoading(false);
            return result;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Hàm xác thực OTP
    const verifyOTP = async (email, otp) => {
        setIsLoading(true);
        try {
            const result = await authAPI.verifyOTP(email, otp);
            setIsLoading(false);
            return result;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Hàm đăng nhập
    const login = async (loginData) => {
        setIsLoading(true);
        try {
            const result = await authAPI.login(loginData);

            if (result.success) {
                const userData = authAPI.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            }

            setIsLoading(false);
            return result;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Hàm đăng xuất
    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    // Hàm gửi lại OTP
    const resendOTP = async (email) => {
        return await authAPI.resendOTP(email);
    };

    // Hàm đổi mật khẩu
    const changePassword = async (changePasswordData) => {
        return await authAPI.changePassword(changePasswordData);
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        register,
        verifyOTP,
        login,
        logout,
        resendOTP,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;