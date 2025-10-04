import React from 'react';
import { useForm } from 'react-hook-form';
import { FiPhone, FiMail, FiMapPin, FiClock, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Tin nhắn đã được gửi thành công!');
      reset();
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const contactInfo = [
    {
      icon: FiPhone,
      title: 'Điện thoại',
      details: ['(028) 1234 5678', '0901 234 567'],
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: FiMail,
      title: 'Email',
      details: ['info@coffeeshop.com', 'support@coffeeshop.com'],
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: FiMapPin,
      title: 'Địa chỉ',
      details: ['123 Đường ABC, Quận 1', 'TP. Hồ Chí Minh'],
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: FiClock,
      title: 'Giờ mở cửa',
      details: ['T2-CN: 6:00 - 22:00'],
      color: 'text-amber-600 bg-amber-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Liên hệ với <span className="text-amber-600">chúng tôi</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${info.color}`}>
                  <info.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      {...register('name', { required: 'Họ và tên là bắt buộc' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email là bắt buộc',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ'
                        }
                      })}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Nhập email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <select
                    {...register('subject', { required: 'Vui lòng chọn chủ đề' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="general">Thông tin chung</option>
                    <option value="order">Đặt hàng</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="suggestion">Góp ý</option>
                    <option value="partnership">Hợp tác</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Tin nhắn *
                  </label>
                  <textarea
                    {...register('message', { required: 'Tin nhắn là bắt buộc' })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nhập tin nhắn của bạn..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vị trí của chúng tôi</h3>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Bản đồ Google Maps sẽ được tích hợp ở đây</p>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiFacebook className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <FiInstagram className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center w-12 h-12 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <FiTwitter className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Câu hỏi thường gặp</h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Có cần đặt bàn trước không?</h4>
                    <p className="text-gray-600 text-sm">
                      Chúng tôi khuyến khích đặt bàn trước, đặc biệt vào cuối tuần và giờ cao điểm.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Có giao hàng tận nơi không?</h4>
                    <p className="text-gray-600 text-sm">
                      Hiện tại chúng tôi chưa có dịch vụ giao hàng, nhưng sẽ sớm triển khai trong tương lai.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Có chỗ đậu xe không?</h4>
                    <p className="text-gray-600 text-sm">
                      Có, chúng tôi có bãi đậu xe miễn phí cho khách hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
