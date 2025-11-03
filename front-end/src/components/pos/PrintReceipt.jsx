import React from 'react';

const PrintReceipt = ({ order, items, table, customer, formatCurrency }) => {
  const today = new Date();
  
  return (
    <div id="print-receipt" className="print-receipt p-8 max-w-[80mm] mx-auto bg-white text-black font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">QUÁN COFFEE</h1>
        <p className="text-sm">123 Nguyễn Huệ, Q1, TP.HCM</p>
        <p className="text-sm">ĐT: 0901234567</p>
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <h2 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h2>
      </div>

      {/* Order Info */}
      <div className="text-sm mb-4">
        <div className="flex justify-between">
          <span>Số HĐ:</span>
          <span className="font-bold">#{order.MaDH || order.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Bàn:</span>
          <span className="font-bold">{table || `Bàn ${order.MaBan}`}</span>
        </div>
        {customer && (
          <div className="flex justify-between">
            <span>Khách hàng:</span>
            <span className="font-bold">{customer}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Ngày:</span>
          <span>{new Date(order.NgayLap || today).toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Thu ngân:</span>
          <span>NV #{order.MaNV || '01'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Items */}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1">Món</th>
            <th className="text-center py-1">SL</th>
            <th className="text-right py-1">Đơn giá</th>
            <th className="text-right py-1">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items && items.length > 0 ? items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2">{item.TenMon || item.name || `Món #${item.MaMon}`}</td>
              <td className="text-center">{item.SoLuong}</td>
              <td className="text-right">{formatCurrency(item.DonGia)}</td>
              <td className="text-right font-semibold">{formatCurrency(item.ThanhTien || item.SoLuong * item.DonGia)}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="text-center py-2 text-gray-500">Chưa có món nào</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Total */}
      <div className="text-sm space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Tổng cộng:</span>
          <span className="font-bold text-lg">{formatCurrency(order.TongTien || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Trạng thái:</span>
          <span className={`font-semibold ${
            order.TrangThai === 'Hoàn thành' ? 'text-green-600' : 
            order.TrangThai === 'Đã hủy' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {order.TrangThai}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Footer */}
      <div className="text-center text-sm mt-4">
        <p className="font-bold">CẢM ƠN QUÝ KHÁCH!</p>
        <p>Hẹn gặp lại!</p>
        <p className="text-xs mt-2">Hotline: 0901234567</p>
      </div>
    </div>
  );
};

export default PrintReceipt;
