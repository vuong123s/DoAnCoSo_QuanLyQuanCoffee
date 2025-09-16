import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold">Coffee Shop</span>
            </div>
            <p className="text-gray-400 mb-4">
              Chào mừng đến với Coffee Shop - nơi mang đến những trải nghiệm cà phê tuyệt vời nhất. 
              Chúng tôi phục vụ những ly cà phê chất lượng cao với không gian ấm cúng và dịch vụ tận tâm.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Thực đơn
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Đặt bàn
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FiMapPin className="w-4 h-4 text-amber-400" />
                <span className="text-gray-400 text-sm">
                  123 Đường ABC, Quận XYZ, TP.HCM
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-4 h-4 text-amber-400" />
                <span className="text-gray-400 text-sm">
                  (028) 1234 5678
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-4 h-4 text-amber-400" />
                <span className="text-gray-400 text-sm">
                  info@coffeeshop.com
                </span>
              </li>
            </ul>
            
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Giờ mở cửa</h4>
              <p className="text-gray-400 text-sm">
                Thứ 2 - Chủ nhật: 6:00 - 22:00
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Coffee Shop. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
