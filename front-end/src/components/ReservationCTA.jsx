import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Phone } from 'lucide-react';

const ReservationCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Đặt Bàn Trước - Trải Nghiệm Tốt Nhất
          </h2>
          <p className="text-xl text-amber-100 max-w-3xl mx-auto">
            Đảm bảo có chỗ ngồi thoải mái cho bạn và người thân. Đặt bàn dễ dàng chỉ với vài click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Chọn Ngày</h3>
            <p className="text-amber-100">Chọn ngày bạn muốn đến Coffee Shop</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Chọn Giờ</h3>
            <p className="text-amber-100">Chọn thời gian phù hợp với lịch trình</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Số Người</h3>
            <p className="text-amber-100">Cho chúng tôi biết có bao nhiêu người</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Xác Nhận</h3>
            <p className="text-amber-100">Chúng tôi sẽ liên hệ xác nhận đặt bàn</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/book-table"
            className="inline-flex items-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Đặt Bàn Ngay
          </Link>
        </div>

        <div className="mt-12 bg-white bg-opacity-10 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Thông Tin Liên Hệ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-amber-100">
              <div>
                <p className="font-medium">Điện thoại</p>
                <p>0123 456 789</p>
              </div>
              <div>
                <p className="font-medium">Giờ mở cửa</p>
                <p>7:00 - 22:00 hàng ngày</p>
              </div>
              <div>
                <p className="font-medium">Địa chỉ</p>
                <p>123 Đường ABC, Quận XYZ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReservationCTA;
