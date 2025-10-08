
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./pages/Login/Login.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import HeaderApp from "./pages/Main/Header.jsx";
import HomePage from "./pages/Main/HomePage.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Signup from "./pages/Login/Signup.jsx";
import Otp from "./pages/Login/Otp.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import FooterApp from "./pages/Main/FooterApp.jsx"

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <HeaderApp />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <FooterApp />
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={4000}
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
