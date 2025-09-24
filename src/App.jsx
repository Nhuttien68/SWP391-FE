
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import ForgotPassword from "./pages/Login/ForgotPassword.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
