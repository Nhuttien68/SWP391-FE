
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./context/AuthContext.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import AdminRedirect from "./components/AdminRedirect.jsx";
import Login from "./pages/Login/Login.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import HeaderApp from "./pages/Main/Header.jsx";
import HomePage from "./pages/Main/HomePage.jsx";
import MarketPage from "./pages/Post/MarketPage.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import ProfileInfo from "./pages/Profile/ProfileInfo.jsx";
import ProfilePosts from "./pages/Profile/ProfilePosts.jsx";
import SellerProfile from "./pages/Profile/SellerProfile.jsx";
import Register from "./pages/Login/Register.jsx";
import VerifyOTP from "./pages/Login/VerifyOTP.jsx";
import Otp from "./pages/Login/Otp.jsx";
import PostDetail from "./pages/Post/PostDetail.jsx";
import CreatePost from "./pages/Post/CreatePost.jsx";
import Compare from "./pages/Post/Compare.jsx";
import CartPage from "./pages/Cart/CartPage.jsx";
import CheckoutPage from "./pages/Cart/CheckoutPage.jsx";
import OrdersPage from "./pages/Transaction/OrdersPage.jsx";
import WalletManagement from "./pages/Transaction/WalletManagement.jsx";
import FavoritesPage from "./pages/Post/FavoritesPage.jsx";
import AuctionList from "./pages/Auction/AuctionList.jsx";
import AuctionDetail from "./pages/Auction/AuctionDetail.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import FooterApp from "./pages/Main/FooterApp.jsx"
import PaymentReturn from "./pages/Transaction/PaymentReturn.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function AppContent() {
  const { isAdmin } = useAuth();

  return (
    <>
      {!isAdmin && <HeaderApp />}
      <Routes>
        {/* Public Routes - Chỉ truy cập khi chưa đăng nhập */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
        <Route path="/register" element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } />
        <Route path="/verify-otp" element={
          <VerifyOTP />
        } />
        <Route path="/otp" element={
          <PublicOnlyRoute>
            <Otp />
          </PublicOnlyRoute>
        } />
        <Route path="/reset-password" element={
          <PublicOnlyRoute>
            <ResetPassword />
          </PublicOnlyRoute>
        } />

        {/* Public Routes - Ai cũng có thể truy cập */}
        <Route path="/" element={<AdminRedirect><HomePage /></AdminRedirect>} />
        <Route path="/home" element={<AdminRedirect><HomePage /></AdminRedirect>} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/seller" element={<SellerProfile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auction" element={<AuctionList />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />


        {/* Payment return/callback route */}
        <Route path="/payment-return" element={<PaymentReturn />} />

        {/* Protected Routes - Chỉ truy cập khi đã đăng nhập */}
        <Route path="/createPost" element={<CreatePost />} />
        <Route path="/profile" element={<ProfileInfo />} />
        <Route path="/posts" element={<ProfilePosts />} />
        <Route path="/wallet" element={<WalletManagement />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<Profile />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminLayout />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <FooterApp />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
