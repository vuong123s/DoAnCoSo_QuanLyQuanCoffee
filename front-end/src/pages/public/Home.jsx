import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI } from '../../shared/services/api';
import { FiCoffee, FiClock, FiStar, FiArrowRight, FiUsers, FiAward, FiCalendar, FiMapPin, FiPhone, FiMail, FiCheck } from 'react-icons/fi';
import Product from '../../components/common/product/Product';
import Slider from '../../components/Slider'

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
      {/* Hero Section - Enhanced */}
      
      <Slider />
      {/* Stats Section - Enhanced */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-green-700" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mb-4">
              <FiStar className="w-4 h-4 text-green-700 mr-2" />
              <span className="text-sm font-semibold text-green-900">Thực đơn hôm nay</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Sản phẩm <span className="text-green-700">nổi bật</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những món cà phê và thức uống đặc biệt được yêu thích nhất
            </p>
          </div>
          <Product />


          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="group inline-flex items-center bg-gradient-to-r from-green-700 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              Xem tất cả sản phẩm
              <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white rounded-full px-4 py-2 mb-4 shadow-sm">
              <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Khách hàng nói gì</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Đánh giá từ <span className="text-green-700">khách hàng</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hàng nghìn khách hàng hài lòng với dịch vụ và chất lượng cà phê của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Nguyễn Văn A',
                role: 'Doanh nhân',
                image: 'https://randomuser.me/api/portraits/men/1.jpg',
                content: 'Cà phê ở đây thật sự tuyệt vời! Hương vị đậm đà, không gian yen tĩnh, phù hợp cho công việc và gặp gỡ đối tác.',
                rating: 5
              },
              {
                name: 'Trần Thị B',
                role: 'Nhà thiết kế',
                image: 'https://randomuser.me/api/portraits/women/2.jpg',
                content: 'Mình rất thích không gian của quán, thiết kế hiện đại nhưng vẫn rất ấm cúng. Nhân viên phục vụ nhiệt tình!',
                rating: 5
              },
              {
                name: 'Lê Minh C',
                role: 'Sinh viên',
                image: 'https://randomuser.me/api/portraits/men/3.jpg',
                content: 'Giá cả hợp lý, chất lượng tốt. Wi-Fi nhanh, phù hợp cho học tập và làm việc nhóm. Chắc chắn sẽ quay lại!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <FiCheck className="w-5 h-5 text-green-600" />
              <span className="font-medium">Hơn 5,000+ đánh giá 5 sao trên Google & Facebook</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section id="about" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Coffee beans"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">15+</p>
                        <p className="text-sm text-gray-600">Năm kinh nghiệm</p>
                      </div>
                      <div className="w-px h-12 bg-gray-300"></div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">100%</p>
                        <p className="text-sm text-gray-600">Hạt cà phê nguyên chất</p>
                      </div>
                      <div className="w-px h-12 bg-gray-300"></div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">4.8/5</p>
                        <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mb-4">
                <FiCoffee className="w-4 h-4 text-green-700 mr-2" />
                <span className="text-sm font-semibold text-green-900">Về chúng tôi</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Câu chuyện <span className="text-green-700">của chúng tôi</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Coffee Shop được thành lập với tình yêu dành cho cà phê và mong muốn mang đến 
                những trải nghiệm tuyệt vời cho khách hàng.
              </p>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Chúng tôi chọn lọc những hạt cà phê chất lượng cao từ các vùng trồng nổi tiếng, 
                rang xay thủ công và pha chế bởi đội ngũ barista giàu kinh nghiệm.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: FiCheck, text: 'Hạt cà phê 100% Arabica & Robusta nguyên chất' },
                  { icon: FiCheck, text: 'Rang xay thủ công hàng ngày' },
                  { icon: FiCheck, text: 'Barista chuyên nghiệp với chứng chỉ quốc tế' },
                  { icon: FiCheck, text: 'Không gian hiện đại, ấm cúng, Wi-Fi miễn phí' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <feature.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/about"
                  className="group inline-flex items-center justify-center bg-green-700 text-white px-8 py-4 rounded-xl hover:bg-green-800 hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  Tìm hiểu thêm
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                  <FiClock className="w-5 h-5 text-green-700" />
                  <span className="font-medium">Mở cửa: 6:00 - 22:00 hàng ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section id="contact" className="relative py-24 bg-gradient-to-br from-green-700 via-emerald-600 to-green-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - CTA */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Sẵn sàng thưởng thức?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Ghé thăm chúng tôi hôm nay hoặc đặt hàng online để trải nghiệm 
                hương vị cà phê đặc biệt!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/menu"
                  className="group bg-white text-white px-8 py-4 rounded-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 font-semibold inline-flex items-center justify-center"
                >
                  Đặt hàng ngay
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/book-table"
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-green-700 transition-all duration-300 font-semibold inline-flex items-center justify-center"
                >
                  <FiCalendar className="mr-2 w-5 h-5" />
                  Đặt bàn
                </Link>
              </div>
            </div>

            {/* Right side - Newsletter */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Nhận ưu đãi đặc biệt</h3>
                  <p className="text-white/80 text-sm">Đăng ký nhận tin tức & khuyến mãi</p>
                </div>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-green-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  Đăng ký ngay
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </button>
              </form>
              
              <p className="text-white/60 text-xs mt-4 text-center">
                Bằng việc đăng ký, bạn đồng ý nhận email từ chúng tôi
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="flex items-center justify-center md:justify-start">
              <FiMapPin className="w-5 h-5 mr-3" />
              <span>123 Đường ABC, Quận 1, TP.HCM</span>
            </div>
            <div className="flex items-center justify-center">
              <FiPhone className="w-5 h-5 mr-3" />
              <span>0123 456 789</span>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <FiMail className="w-5 h-5 mr-3" />
              <span>contact@coffeeshop.vn</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
