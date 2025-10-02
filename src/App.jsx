
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import ForgotPassword from "./pages/Login/ForgotPassword.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import HeaderApp from "./pages/Main/Header.jsx";
import HomePage from "./pages/Main/HomePage.jsx";
import Signup from "./pages/Login/Signup.jsx";
import Otp from "./pages/Login/Otp.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import { Footer } from "antd/es/layout/layout.js";

function App() {
  return (
    <ErrorBoundary>
      {/* <HeaderApp /> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<AdminLayout />}></Route>
      </Routes>
      {/* <Footer/> */}
    </ErrorBoundary>
  );
}

export default App;
