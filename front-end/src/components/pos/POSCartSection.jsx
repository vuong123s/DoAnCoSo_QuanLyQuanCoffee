import React from 'react';
import { FiShoppingCart, FiTrash2, FiCheck } from 'react-icons/fi';

const POSCartSection = ({ 
  cart, 
  tables,
  customers = [],
  selectedTable,
  selectedCustomer,
  cartTotal,
  cartSubtotal,
  pointsUsed = 0,
  onPointsChange,
  onTableSelect,
  onCustomerSelect,
  onUpdateQuantity, 
  onUpdateNote, 
  onRemove, 
  onClear, 
  onCreateOrder,
  formatCurrency 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <FiShoppingCart className="mr-2" />
        Giỏ hàng ({cart.length})
      </h2>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn bàn *
          </label>
          <select
            value={selectedTable?.MaBan || selectedTable?.id || ''}
            onChange={(e) => {
              const table = tables.find(t => (t.MaBan || t.id) == e.target.value);
              onTableSelect(table);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Chọn bàn --</option>
            {tables.filter(t => t.TrangThai === 'Trống').map(table => (
              <option key={table.MaBan || table.id} value={table.MaBan || table.id}>
                Bàn {table.TenBan || table.name} ({table.SoChoNgoi || table.capacity} chỗ)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khách hàng
          </label>
          <select
            value={selectedCustomer?.MaKH || selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => (c.MaKH || c.id) == e.target.value);
              onCustomerSelect(customer);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Khách vãng lai --</option>
            {customers.map(customer => (
              <option key={customer.MaKH || customer.id} value={customer.MaKH || customer.id}>
                {customer.HoTen || customer.TenKH || customer.name} - {customer.SDT || customer.phone || 'N/A'}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Chọn khách hàng để tích điểm thưởng</p>
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Chưa có món nào</p>
            <p className="text-sm">Chọn món từ menu</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 flex-1">{item.TenMon}</h4>
                <button
                  onClick={() => onRemove(item.MaMon)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.MaMon, item.SoLuong - 1)}
                    className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    -
                  </button>
                  <span className="font-medium w-8 text-center">{item.SoLuong}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.MaMon, item.SoLuong + 1)}
                    className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold text-blue-600">
                  {formatCurrency(item.DonGia * item.SoLuong)}
                </span>
              </div>

              <input
                type="text"
                placeholder="Ghi chú (vd: ít đá, thêm đường...)"
                value={item.GhiChu}
                onChange={(e) => onUpdateNote(item.MaMon, e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <>
          <div className="pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Tổng tiền:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>

          <div className="space-y-2 flex">
            <button
              onClick={onCreateOrder}
              disabled={!selectedTable}
              className="w-full py-3 px-4 !mr-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              <FiCheck className="mr-2" />
              Tạo đơn hàng
            </button>

            <button
              onClick={onClear}
              className="w-full py-2 px-4 !ml-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Hủy
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default POSCartSection;
