import React from 'react';
import { Alert, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Cập nhật state để hiển thị fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log lỗi để debug
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleRefresh = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f0f2f5",
                    padding: "20px"
                }}>
                    <div style={{
                        width: "500px",
                        background: "#fff",
                        padding: "40px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                    }}>
                        <Alert
                            message="Có lỗi xảy ra!"
                            description="Ứng dụng gặp lỗi không mong muốn. Vui lòng thử tải lại trang."
                            type="error"
                            showIcon
                            style={{ marginBottom: "20px" }}
                        />

                        <Button
                            type="primary"
                            onClick={this.handleRefresh}
                            block
                            style={{ marginBottom: "20px" }}
                        >
                            Tải lại trang
                        </Button>

                        {/* Hiển thị chi tiết lỗi trong development mode */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{ whiteSpace: 'pre-wrap' }}>
                                <summary>Chi tiết lỗi (Development mode)</summary>
                                <div style={{
                                    background: "#f5f5f5",
                                    padding: "10px",
                                    margin: "10px 0",
                                    fontSize: "12px",
                                    fontFamily: "monospace",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "4px"
                                }}>
                                    <strong>Error:</strong> {this.state.error.toString()}
                                    <br />
                                    <strong>Stack:</strong> {this.state.error.stack}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;