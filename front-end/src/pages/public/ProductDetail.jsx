import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuAPI } from '../../shared/services/api';
import useCartStore from '../../app/stores/cartStore';
import RelatedProducts from '../../components/common/product/RelatedProducts';
import ProductReviews from '../../components/common/product/ProductReviews';
import { 
  FiShoppingCart, 
  FiMinus, 
  FiPlus, 
  FiStar, 
  FiHeart, 
  FiShare2, 
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItemCount } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await menuAPI.getMenuItem(id);
        
        // Handle Vietnamese schema response
        const productData = response.data?.item || response.data;
        setProduct(productData);
        
        // Fetch category information if available
        if (productData?.MaLoai || productData?.categoryId) {
          try {
            const categoriesResponse = await menuAPI.getCategories();
            const categories = categoriesResponse.data?.categories || categoriesResponse.data || [];
            const productCategory = categories.find(cat => 
              (cat.MaLoai || cat.id) === (productData.MaLoai || productData.categoryId)
            );
            setCategory(productCategory);
          } catch (error) {
            console.error('Error fetching category:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      toast.success(`Đã thêm ${quantity} ${product.TenMon || product.name} vào giỏ hàng`);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.TenMon || product.name,
          text: product.MoTa || product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy sản phẩm
            </h2>
            <button
              onClick={() => navigate('/menu')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Quay lại thực đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  const productName = product.TenMon || product.name;
  const productDescription = product.MoTa || product.description;
  const productPrice = product.DonGia || product.price;
  const productImage = product.HinhAnh || product.image;
  const isAvailable = product.TrangThai === 'Còn bán' || product.available !== false;
  const categoryName = category?.TenLoai || category?.name;

  // Mock additional product images (in real app, these would come from API)
  const productImages = [
    productImage,
    productImage, // Placeholder for additional images
    productImage,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {categoryName && `${categoryName} / `}{productName}
          </span>
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
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={productImages[selectedImage] || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"}
                  alt={productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500";
                  }}
                />
              </div>
              
              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-amber-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Title */}
              <div>
                {categoryName && (
                  <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {categoryName}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {productName}
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
                  <span className="text-gray-600">156 đánh giá</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-amber-600">
                  {formatCurrency(productPrice)}
                </span>
                {!isAvailable && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Hết hàng
                  </span>
                )}
              </div>

              {/* Description */}
              {productDescription && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {productDescription}
                  </p>
                </div>
              )}

              {/* Product Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Đặc điểm</h3>
                <div className="grid grid-cols-2 gap-4">
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

              {/* Quantity & Add to Cart */}
              {isAvailable && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-lg font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 99}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span>Thêm vào giỏ hàng</span>
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
                </div>
              )}

              {!isAvailable && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiX className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      Sản phẩm hiện tại không có sẵn
                    </span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">
                    Vui lòng chọn sản phẩm khác hoặc quay lại sau.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="mt-12">
          <ProductReviews productId={id} />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts 
            currentProductId={id} 
            categoryId={product.MaLoai || product.categoryId} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
