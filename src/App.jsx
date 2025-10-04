
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./pages/Login/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import HeaderApp from "./pages/Main/Header.jsx";
import HomePage from "./pages/Main/HomePage.jsx";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <FooterApp />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
