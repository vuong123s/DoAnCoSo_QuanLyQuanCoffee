import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Star, Users, Clock } from 'lucide-react';
import ReservationCTA from '../components/ReservationCTA';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chào Mừng Đến Coffee Shop
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Nơi hội tụ hương vị cà phê tuyệt vời và không gian ấm cúng. 
              Trải nghiệm những giây phút thư giãn tuyệt vời cùng chúng tôi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Xem Thực Đơn
              </Link>
              <Link
                to="/book-table"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-amber-600 transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Đặt Bàn Ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tại Sao Chọn Coffee Shop?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết mang đến cho bạn trải nghiệm cà phê tuyệt vời nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cà Phê Chất Lượng</h3>
              <p className="text-gray-600">
                Sử dụng hạt cà phê nguyên chất được chọn lọc kỹ càng từ những vùng trồng cà phê nổi tiếng
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Dịch Vụ Tuyệt Vời</h3>
              <p className="text-gray-600">
                Đội ngũ nhân viên chuyên nghiệp, nhiệt tình, luôn sẵn sàng phục vụ bạn một cách tốt nhất
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Mở Cửa Cả Ngày</h3>
              <p className="text-gray-600">
                Phục vụ từ 7:00 đến 22:00 hàng ngày, luôn sẵn sàng đón tiếp bạn bất cứ lúc nào
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <ReservationCTA />

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Về Coffee Shop
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Coffee Shop được thành lập với sứ mệnh mang đến những trải nghiệm cà phê tuyệt vời nhất 
                cho khách hàng. Chúng tôi tự hào về chất lượng sản phẩm và dịch vụ khách hàng xuất sắc.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Với không gian ấm cúng, thực đơn đa dạng và đội ngũ nhân viên chuyên nghiệp, 
                chúng tôi cam kết tạo ra một nơi lý tưởng để bạn thư giãn, làm việc và gặp gỡ bạn bè.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
              >
                Tìm Hiểu Thêm
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-96 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                  <Coffee className="w-24 h-24 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;