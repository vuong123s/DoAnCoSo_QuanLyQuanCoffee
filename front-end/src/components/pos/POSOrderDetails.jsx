import React from 'react';
import { FiX, FiCheck } from 'react-icons/fi';

const POSOrderDetails = ({ order, orderItems, tables, onClose, onUpdateStatus, formatCurrency }) => {
  const getTableName = (tableId) => {
    const table = tables.find(t => (t.MaBan || t.id) === tableId);
    return table ? `Bàn ${table.TenBan || table.name || tableId}` : `Bàn ${tableId}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Chi tiết đơn #{order.MaDH || order.id}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Bàn</p>
          <p className="font-medium">{getTableName(order.MaBan)}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Thời gian</p>
          <p className="font-medium">
            {new Date(order.NgayLap).toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Nhân viên</p>
          <p className="font-medium">NV #{order.MaNV}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Trạng thái</p>
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mt-1">
            {order.TrangThai}
          </span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-3">
          Món trong đơn ({orderItems.length})
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {orderItems.map((item, index) => (
            <div key={index} className="flex justify-between items-start py-2 border-b">
              <div className="flex-1">
                <p className="font-medium">{item.TenMon || `Món #${item.MaMon}`}</p>
                <p className="text-sm text-gray-600">
                  {item.SoLuong} x {formatCurrency(item.DonGia)}
                </p>
                {item.GhiChu && (
                  <p className="text-xs text-amber-600 mt-1">📝 {item.GhiChu}</p>
                )}
              </div>
              <span className="font-bold text-blue-600">
                {formatCurrency(item.DonGia * item.SoLuong)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Tổng tiền:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(order.TongTien)}
          </span>
        </div>
      </div>

      {order.TrangThai === 'Đang xử lý' && (
        <div className="space-y-2">
          <button
            onClick={() => onUpdateStatus(order.MaDH || order.id, 'Hoàn thành')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
          >
            <FiCheck className="mr-2" />
            Hoàn thành
          </button>

          <button
            onClick={() => onUpdateStatus(order.MaDH || order.id, 'Đã hủy')}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center"
          >
            <FiX className="mr-2" />
            Hủy đơn
          </button>
        </div>
      )}
    </div>
  );
};

export default POSOrderDetails;
