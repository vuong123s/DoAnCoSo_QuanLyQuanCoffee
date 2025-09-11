import { useState } from "react";
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiCheck, 
  FiX,
  FiClock,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail
} from "react-icons/fi";

function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API
  const orders = [
    {
      id: "#001",
      customer: {
        name: "Nguyễn Văn A",
        phone: "0123456789",
        email: "nguyenvana@email.com",
        address: "123 Đường ABC, Quận 1, TP.HCM"
      },
      items: [
        { name: "Cà phê đen", quantity: 2, price: 15000 },
        { name: "Bánh mì sandwich", quantity: 1, price: 18000 }
      ],
      total: 48000,
      status: "completed",
      paymentMethod: "Tiền mặt",
      orderDate: "2024-01-15 10:30",
      deliveryDate: "2024-01-15 11:00",
      notes: "Không đường"
    },
    {
      id: "#002",
      customer: {
        name: "Trần Thị B",
        phone: "0987654321",
        email: "tranthib@email.com",
        address: "456 Đường XYZ, Quận 2, TP.HCM"
      },
      items: [
        { name: "Cappuccino", quantity: 1, price: 25000 },
        { name: "Latte", quantity: 1, price: 28000 }
      ],
      total: 53000,
      status: "pending",
      paymentMethod: "Chuyển khoản",
      orderDate: "2024-01-15 10:25",
      deliveryDate: null,
      notes: "Ít đá"
    },
    {
      id: "#003",
      customer: {
        name: "Lê Văn C",
        phone: "0369852147",
        email: "levanc@email.com",
        address: "789 Đường DEF, Quận 3, TP.HCM"
      },
      items: [
        { name: "Trà sữa trân châu", quantity: 1, price: 22000 },
        { name: "Bánh mì sandwich", quantity: 2, price: 18000 }
      ],
      total: 58000,
      status: "processing",
      paymentMethod: "Tiền mặt",
      orderDate: "2024-01-15 10:20",
      deliveryDate: null,
      notes: "Thêm trân châu"
    },
    {
      id: "#004",
      customer: {
        name: "Phạm Thị D",
        phone: "0741852963",
        email: "phamthid@email.com",
        address: "321 Đường GHI, Quận 4, TP.HCM"
      },
      items: [
        { name: "Espresso", quantity: 1, price: 12000 },
        { name: "Mocha", quantity: 1, price: 30000 }
      ],
      total: 42000,
      status: "cancelled",
      paymentMethod: "Thẻ",
      orderDate: "2024-01-15 10:15",
      deliveryDate: null,
      notes: "Hủy do khách hàng"
    },
    {
      id: "#005",
      customer: {
        name: "Hoàng Văn E",
        phone: "0527419638",
        email: "hoangvane@email.com",
        address: "654 Đường JKL, Quận 5, TP.HCM"
      },
      items: [
        { name: "Cà phê đen", quantity: 3, price: 15000 },
        { name: "Cappuccino", quantity: 2, price: 25000 }
      ],
      total: 95000,
      status: "completed",
      paymentMethod: "Chuyển khoản",
      orderDate: "2024-01-15 10:10",
      deliveryDate: "2024-01-15 10:45",
      notes: "Đóng gói cẩn thận"
    }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "processing", label: "Đang xử lý" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheck className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'processing': return <FiPackage className="w-4 h-4" />;
      case 'cancelled': return <FiX className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    // Logic cập nhật trạng thái đơn hàng
    console.log(`Update order ${orderId} to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi đơn hàng cà phê</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiTruck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'completed').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiFilter className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Mã đơn</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Món đã đặt</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Thời gian</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-sm text-gray-500">{order.customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{order.items.length} món</p>
                      <p className="text-xs text-gray-500">{order.items[0]?.name}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{formatPrice(order.total)} VNĐ</p>
                    <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{formatDate(order.orderDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'processing')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredOrders.length}</span> trong tổng số <span className="font-medium">{orders.length}</span> đơn
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Trước
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-amber-600 border border-amber-600 rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Chi tiết đơn hàng {selectedOrder.id}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                  </span>
                </div>
                
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <FiUser className="w-5 h-5 mr-2" />
                      Thông tin khách hàng
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedOrder.customer.name}</span>
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedOrder.customer.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <FiMail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedOrder.customer.email}</span>
                      </div>
                      <div className="flex items-start">
                        <FiMapPin className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                        <span className="text-gray-900">{selectedOrder.customer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <FiPackage className="w-5 h-5 mr-2" />
                      Món đã đặt
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)} VNĐ</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <FiDollarSign className="w-5 h-5 mr-2" />
                      Tổng kết đơn hàng
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span className="font-medium">{formatPrice(selectedOrder.total)} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày đặt hàng:</span>
                        <span className="font-medium">{formatDate(selectedOrder.orderDate)}</span>
                      </div>
                      {selectedOrder.deliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày giao hàng:</span>
                          <span className="font-medium">{formatDate(selectedOrder.deliveryDate)}</span>
                        </div>
                      )}
                      {selectedOrder.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-600">Ghi chú:</span>
                          <p className="text-gray-900 mt-1">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
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
}

export default Orders;


