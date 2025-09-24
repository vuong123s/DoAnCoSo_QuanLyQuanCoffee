import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI } from '../../services/api';
import { FiCoffee, FiClock, FiStar, FiArrowRight, FiUsers, FiAward } from 'react-icons/fi';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await menuAPI.getFeaturedItems();
  
        // Support either featured endpoint or list fallback
        const items =
          response?.data?.featured_items ||
          response?.data?.menu_items ||
          response?.data?.items ||
          [];
  
        if (Array.isArray(items) && items.length > 0) {
          console.log('Featured items:', items);
        }
  
        setFeaturedItems(items);
      } catch (error) {
        console.error('Error fetching featured items:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchFeaturedItems();
  }, []);

  const stats = [
    { icon: FiCoffee, label: 'Ly cà phê phục vụ', value: '10,000+' },
    { icon: FiUsers, label: 'Khách hàng hài lòng', value: '5,000+' },
    { icon: FiAward, label: 'Năm kinh nghiệm', value: '15+' },
    { icon: FiStar, label: 'Đánh giá trung bình', value: '4.8/5' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Chào mừng đến với{' '}
                <span className="text-amber-600">Coffee Shop</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Nơi mang đến những trải nghiệm cà phê tuyệt vời nhất với hương vị đậm đà 
                và không gian ấm cúng. Hãy đến và cảm nhận sự khác biệt!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/menu"
                  className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium text-center"
                >
                  Xem thực đơn
                </Link>
                <Link
                  to="/reservations"
                  className="border border-amber-600 text-amber-600 px-8 py-3 rounded-lg hover:bg-amber-50 transition-colors font-medium text-center"
                >
                  Đặt bàn ngay
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Coffee Shop Interior"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Không gian ấm cúng</h3>
                  <p className="text-gray-600 text-sm">Thiết kế hiện đại, thoải mái</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá những món cà phê đặc biệt được yêu thích nhất tại Coffee Shop
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-3 rounded mb-4"></div>
                  <div className="bg-gray-300 h-6 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">
                        {item.price?.toLocaleString('vi-VN')}đ
                      </span>
                      <div className="flex items-center text-yellow-400">
                        <FiStar className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Xem tất cả sản phẩm
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Coffee beans"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Câu chuyện của chúng tôi
              </h2>
              <p className="text-gray-600 mb-6">
                Coffee Shop được thành lập với tình yêu dành cho cà phê và mong muốn mang đến 
                những trải nghiệm tuyệt vời cho khách hàng. Chúng tôi chọn lọc những hạt cà phê 
                chất lượng cao từ các vùng trồng nổi tiếng và rang xay theo phương pháp truyền thống.
              </p>
              <p className="text-gray-600 mb-8">
                Với không gian ấm cúng và đội ngũ barista chuyên nghiệp, chúng tôi cam kết mang đến 
                những ly cà phê hoàn hảo và dịch vụ tận tâm nhất.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <FiClock className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-gray-700">Mở cửa 6:00 - 22:00</span>
                </div>
                <Link
                  to="/about"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Tìm hiểu thêm →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng thưởng thức cà phê tuyệt vời?
          </h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
            Đặt bàn ngay hôm nay và trải nghiệm không gian cà phê độc đáo của chúng tôi
          </p>
          <Link
            to="/reservations"
            className="bg-white text-amber-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-block"
          >
            Đặt bàn ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
