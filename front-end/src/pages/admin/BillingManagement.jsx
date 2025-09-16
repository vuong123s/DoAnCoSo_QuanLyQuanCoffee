import React, { useState, useEffect } from 'react';
import { billingAPI, userAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { FiDollarSign, FiCalendar, FiUser, FiCreditCard, FiFilter, FiDownload, FiEye, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0
  });

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
    calculateStats();
  }, [bills, statusFilter, paymentMethodFilter, dateFilter]);

  const fetchBills = async () => {
    try {
      const response = await billingAPI.getBills();
      setBills(response.data.bills || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = bills;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(bill => bill.paymentMethod === paymentMethodFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(bill => 
        bill.createdAt.startsWith(dateFilter)
      );
    }

    setFilteredBills(filtered);
  };

  const calculateStats = () => {
    const totalRevenue = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalBills = filteredBills.length;
    const paidBills = filteredBills.filter(bill => bill.status === 'paid').length;
    const pendingBills = filteredBills.filter(bill => bill.status === 'pending').length;

    setStats({
      totalRevenue,
      totalBills,
      paidBills,
      pendingBills
    });
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await billingAPI.updateBill(id, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchBills();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'card':
        return 'Thẻ';
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'e_wallet':
        return 'Ví điện tử';
      default:
        return method;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Mã hóa đơn', 'Khách hàng', 'Tổng tiền', 'Phương thức', 'Trạng thái', 'Ngày tạo'],
      ...filteredBills.map(bill => [
        bill.id,
        bill.customerName || 'Khách vãng lai',
        bill.totalAmount,
        getPaymentMethodText(bill.paymentMethod),
        getStatusText(bill.status),
        new Date(bill.createdAt).toLocaleDateString('vi-VN')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bills_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
          <div className="bg-gray-300 h-8 w-48 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <FiDownload className="w-4 h-4" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paidBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBills}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="e_wallet">Ví điện tử</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hóa đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{bill.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {bill.customerName || 'Khách vãng lai'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiDollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {bill.totalAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiCreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {getPaymentMethodText(bill.paymentMethod)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bill.status}
                      onChange={(e) => handleUpdateStatus(bill.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 ${getStatusColor(bill.status)}`}
                    >
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="cancelled">Đã hủy</option>
                      <option value="refunded">Đã hoàn tiền</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(bill)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hóa đơn nào</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc để xem kết quả khác</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết hóa đơn #{selectedBill.id}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin hóa đơn</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Mã hóa đơn:</span> #{selectedBill.id}</p>
                    <p><span className="font-medium">Thời gian:</span> {new Date(selectedBill.createdAt).toLocaleString('vi-VN')}</p>
                    <p><span className="font-medium">Khách hàng:</span> {selectedBill.customerName || 'Khách vãng lai'}</p>
                    <p><span className="font-medium">Phương thức:</span> {getPaymentMethodText(selectedBill.paymentMethod)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Trạng thái</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBill.status)}`}>
                    {getStatusText(selectedBill.status)}
                  </span>
                </div>
              </div>

              {/* Bill Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Chi tiết thanh toán</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">Tổng tiền hàng</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {selectedBill.subtotal?.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                      {selectedBill.tax > 0 && (
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Thuế ({selectedBill.taxRate}%)</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {selectedBill.tax?.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      )}
                      {selectedBill.discount > 0 && (
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Giảm giá</td>
                          <td className="px-4 py-2 text-sm text-red-600">
                            -{selectedBill.discount?.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">Tổng cộng</td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">
                          {selectedBill.totalAmount?.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedBill.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ghi chú</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBill.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  In hóa đơn
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
