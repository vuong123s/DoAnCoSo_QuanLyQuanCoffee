import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuAPI } from '../../shared/services/api';
import useCartStore from '../../app/stores/cartStore';
import AddToCartModal from '../../components/common/modal/AddToCartModal';
import { 
  FiArrowLeft,
  FiStar,
  FiHeart,
  FiShare2,
  FiClock,
  FiCheck,
  FiX,
  FiTag,
  FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCartItemCount } = useCartStore();
  
  // State theo schema database
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', id);
        
        // Fetch product by MaMon
        const productResponse = await menuAPI.getMenuItem(id);
        console.log('Full API response:', productResponse);
        console.log('Response data:', productResponse.data);
        
        // Try different response structures
        let productData = null;
        if (productResponse.data?.menu_item) {
          productData = productResponse.data.menu_item;
          console.log('Using data.menu_item structure (backend format)');
        } else if (productResponse.data?.product) {
          productData = productResponse.data.product;
          console.log('Using data.product structure');
        } else if (productResponse.data?.success && productResponse.data?.data) {
          productData = productResponse.data.data;
          console.log('Using data.data structure');
        } else if (productResponse.data && !productResponse.data.success) {
          productData = productResponse.data;
          console.log('Using direct data structure');
        }
        
        console.log('Final product data:', productData);
        
        if (!productData) {
          console.error('No product data found in response');
          toast.error('Không tìm thấy sản phẩm');
          navigate('/menu');
          return;
        }
        
        setProduct(productData);
        console.log('Product set successfully:', {
          TenMon: productData.TenMon,
          DonGia: productData.DonGia,
          HinhAnh: productData.HinhAnh,
          TrangThai: productData.TrangThai,
          MoTa: productData.MoTa
        });
        
        // Fetch category by MaLoai
        if (productData.MaLoai) {
          try {
            const categoriesResponse = await menuAPI.getCategories();
            const categories = categoriesResponse.data?.categories || categoriesResponse.data || [];
            const productCategory = categories.find(cat => cat.MaLoai === productData.MaLoai);
            console.log('Category data:', productCategory);
            setCategory(productCategory);
          } catch (error) {
            console.warn('Could not fetch category:', error);
          }
        }
        
      } catch (error) {
        console.error('Error fetching product:', error);
        
        // Fallback: Try to get product from menu items list
        try {
          console.log('Trying fallback: fetching from menu items');
          const menuResponse = await menuAPI.getMenuItems();
          const menuItems = menuResponse.data?.menus || menuResponse.data?.menu_items || menuResponse.data?.items || menuResponse.data || [];
          console.log('Menu items for fallback:', menuItems);
          
          const foundProduct = menuItems.find(item => 
            (item.MaMon && item.MaMon.toString() === id.toString()) ||
            (item.id && item.id.toString() === id.toString())
          );
          
          if (foundProduct) {
            console.log('Found product via fallback:', foundProduct);
            setProduct(foundProduct);
            toast.success('Đã tải thông tin sản phẩm');
          } else {
            console.error('Product not found in menu items either');
            toast.error('Không thể tải thông tin sản phẩm');
            navigate('/menu');
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          toast.error('Không thể tải thông tin sản phẩm');
          navigate('/menu');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id, navigate]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.TenMon,
          text: product.MoTa,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 w-3/4 rounded"></div>
                <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
                <div className="bg-gray-300 h-6 w-1/4 rounded"></div>
                <div className="bg-gray-300 h-20 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FiX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-600 mb-6">
              Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Quay lại thực đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra trạng thái sản phẩm theo database schema
  const isAvailable = product.TrangThai === 'Có sẵn' || product.TrangThai === 'Còn bán' || product.available !== false;
  const isOutOfStock = product.TrangThai === 'Hết hàng' || product.TrangThai === 'Ngừng bán';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate('/')}
            className="hover:text-gray-900 transition-colors"
          >
            Trang chủ
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/menu')}
            className="hover:text-gray-900 transition-colors"
          >
            Thực đơn
          </button>
          {category && (
            <>
              <span>/</span>
              <span className="text-gray-700">{category.TenLoai}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.TenMon}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Quay lại thực đơn
        </button>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                <img
                  src={product.HinhAnh || product.image || product.img || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"}
                  alt={product.TenMon || product.name || 'Sản phẩm'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500";
                  }}
                />
                
                {/* Status Badge */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                      {isOutOfStock ? 'Hết hàng' : 'Không có sẵn'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Title */}
              <div>
                {category && (
                  <div className="flex items-center space-x-2 mb-3">
                    <FiTag className="w-4 h-4 text-amber-600" />
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      {category.TenLoai}
                    </span>
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.TenMon || product.name || product.title || 'Sản phẩm'}
                </h1>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600">(4.0)</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">Mã: {product.MaMon || product.id || '#'}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-amber-600">
                  {formatCurrency(product.DonGia || product.price || 0)}
                </span>
                
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAvailable ? 'Có sẵn' : (isOutOfStock ? 'Hết hàng' : 'Không có sẵn')}
                </span>
              </div>

              {/* Description */}
              {(product.MoTa || product.description) && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <FiInfo className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Mô tả sản phẩm</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {product.MoTa || product.description || 'Không có mô tả'}
                  </p>
                </div>
              )}

              {/* Product Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Đặc điểm</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-600">Chuẩn bị: 5-10 phút</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Tươi ngon</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Nguyên liệu tự nhiên</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Phục vụ nóng</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {isAvailable ? (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowAddToCartModal(true)}
                      className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                    >
                      Thêm vào giỏ hàng
                    </button>
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`px-4 py-3 rounded-lg border transition-colors ${
                        isFavorite
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <FiX className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">
                        Sản phẩm hiện tại không có sẵn
                      </span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                      {isOutOfStock 
                        ? 'Sản phẩm đã hết hàng. Vui lòng chọn sản phẩm khác.'
                        : 'Vui lòng chọn sản phẩm khác hoặc quay lại sau.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Product Info Table */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã sản phẩm:</span>
                    <span className="font-medium">#{product.MaMon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">{category?.TenLoai || 'Chưa phân loại'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`font-medium ${
                      isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.TrangThai}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá bán:</span>
                    <span className="font-medium text-amber-600">
                      {formatCurrency(product.DonGia)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetail;
