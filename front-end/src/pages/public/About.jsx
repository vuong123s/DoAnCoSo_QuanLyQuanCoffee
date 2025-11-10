import React from 'react';
import { FiCoffee, FiHeart, FiUsers, FiAward, FiClock, FiMapPin } from 'react-icons/fi';

const About = () => {
  const values = [
    {
      icon: FiCoffee,
      title: 'Chất lượng cao',
      description: 'Chúng tôi chỉ sử dụng những hạt cà phê chất lượng cao nhất từ các vùng trồng nổi tiếng.'
    },
    {
      icon: FiHeart,
      title: 'Tình yêu cà phê',
      description: 'Mỗi ly cà phê được pha chế với tình yêu và sự tận tâm của đội ngũ barista.'
    },
    {
      icon: FiUsers,
      title: 'Cộng đồng',
      description: 'Tạo ra một không gian gặp gỡ, kết nối và chia sẻ cho mọi người.'
    },
    {
      icon: FiAward,
      title: 'Xuất sắc',
      description: 'Cam kết mang đến dịch vụ và sản phẩm xuất sắc nhất cho khách hàng.'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      role: 'Quản lý',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Với 10 năm kinh nghiệm trong ngành F&B'
    },
    {
      name: 'Trần Thị B',
      role: 'Head Barista',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Chuyên gia pha chế với nhiều chứng chỉ quốc tế'
    },
    {
      name: 'Lê Văn C',
      role: 'Đầu bếp',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Sáng tạo những món ăn kèm hoàn hảo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Về <span className="text-green-700">Coffee Shop</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Câu chuyện về tình yêu cà phê và hành trình mang đến những trải nghiệm tuyệt vời nhất
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Coffee Shop được thành lập vào năm 2009 với một ước mơ đơn giản: mang đến những ly cà phê 
                  tuyệt vời nhất cho cộng đồng. Bắt đầu từ một quán cà phê nhỏ với chỉ 4 bàn, chúng tôi đã 
                  phát triển thành một thương hiệu được yêu thích.
                </p>
                <p>
                  Chúng tôi tin rằng cà phê không chỉ là một thức uống, mà là cầu nối kết nối con người với nhau. 
                  Mỗi hạt cà phê được chúng tôi chọn lọc kỹ càng từ các vùng trồng nổi tiếng như Đà Lạt, 
                  Buôn Ma Thuột, và cả những vùng đất xa xôi trên thế giới.
                </p>
                <p>
                  Với đội ngũ barista chuyên nghiệp và không gian ấm cúng, chúng tôi cam kết mang đến 
                  những trải nghiệm khó quên cho mỗi khách hàng ghé thăm.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Coffee beans"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Coffee shop interior"
                className="w-full h-48 object-cover rounded-lg shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <value.icon className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gặp gỡ những người đam mê tạo nên sự khác biệt tại Coffee Shop
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-green-700 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Location */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vị trí</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <FiMapPin className="w-6 h-6 text-green-700 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Coffee Shop - Cơ sở chính</h3>
                    <p className="text-gray-600">123 Đường ABC, Quận 1, TP.HCM</p>
                  </div>
                </div>
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Bản đồ sẽ được hiển thị ở đây</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Giờ mở cửa</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FiClock className="w-6 h-6 text-green-700" />
                  <span className="text-lg font-semibold text-gray-900">Lịch hoạt động</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { day: 'Thứ Hai - Chủ Nhật', hours: '6:00 - 22:00' }
                  ].map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{schedule.day}</span>
                      <span className="font-medium text-gray-900">{schedule.hours}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Lưu ý:</strong> Giờ mở cửa có thể thay đổi vào các ngày lễ. 
                    Vui lòng liên hệ trước khi đến.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
