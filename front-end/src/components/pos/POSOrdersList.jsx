import React from 'react';
import { FiPackage, FiClock } from 'react-icons/fi';

const POSOrdersList = ({ orders, viewingOrder, onViewOrder, formatCurrency, tables }) => {
  const getTableName = (tableId) => {
    const table = tables.find(t => (t.MaBan || t.id) === tableId);
    return table ? `Bàn ${table.TenBan || table.name || tableId}` : `Bàn ${tableId}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Đơn hàng đang xử lý ({orders.length})
      </h2>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          orders.map(order => (
            <button
              key={order.MaDH || order.id}
              onClick={() => onViewOrder(order)}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                viewingOrder && (viewingOrder.MaDH || viewingOrder.id) === (order.MaDH || order.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  Đơn #{order.MaDH || order.id} - {getTableName(order.MaBan)}
                </h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {order.TrangThai}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <FiClock className="inline mr-1" />
                  {new Date(order.NgayLap).toLocaleTimeString('vi-VN')}
                </span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(order.TongTien)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default POSOrdersList;
