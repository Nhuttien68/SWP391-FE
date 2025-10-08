import { Layout, Row, Col } from "antd";

const { Footer } = Layout;

const FooterApp = () => {
  return (
    <Footer className="bg-gray-900 text-white p-10">
      <Row gutter={32} className="mb-8">
        <Col xs={24} sm={12} md={6} className="mb-6 md:mb-0">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-green-500 pb-2 inline-block">
              ⚡ EV Marketplace
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Nền tảng trao đổi xe điện và pin thông minh, kết nối người mua bán
              và đấu giá xe điện một cách hiệu quả và an toàn.
            </p>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} className="mb-6 md:mb-0">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-blue-500 pb-2 inline-block">
              Liên kết nhanh
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                🏠 Trang chủ
              </li>
              <li className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                🚗 Xe điện
              </li>
              <li className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                � Pin & Phụ kiện
              </li>
              <li className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                �️ Đấu giá
              </li>
            </ul>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6} className="mb-6 md:mb-0">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-green-500 pb-2 inline-block">
              Chính sách
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="text-gray-300 hover:text-green-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                📋 Điều khoản sử dụng
              </li>
              <li className="text-gray-300 hover:text-green-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                🔐 Chính sách bảo mật
              </li>
              <li className="text-gray-300 hover:text-green-400 transition-colors cursor-pointer transform hover:translate-x-1 duration-200">
                📖 Hướng dẫn giao dịch
              </li>
            </ul>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-yellow-500 pb-2 inline-block">
              Thông tin liên hệ
            </h4>
            <div className="space-y-3">
              <p className="text-gray-300 flex items-center hover:text-yellow-400 transition-colors">
                <span className="mr-2">📍</span>
                Hồ Chí Minh, Việt Nam
              </p>
              <p className="text-gray-300 flex items-center hover:text-yellow-400 transition-colors">
                <span className="mr-2">📞</span>
                0123 456 789
              </p>
              <p className="text-gray-300 flex items-center hover:text-yellow-400 transition-colors">
                <span className="mr-2">✉️</span>
                support@ev-exchange.vn
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <div className="text-center mt-8 pt-6 border-t border-gray-700">
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
          © 2025 EV Marketplace - Nền tảng trao đổi xe điện hàng đầu Việt Nam
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Được phát triển với ⚡ vì tương lai xanh
        </p>
      </div>
    </Footer>
  )
}

export default FooterApp