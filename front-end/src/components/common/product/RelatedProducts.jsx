import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../../../shared/services/api';
import ProductCard from './ProductCard';
import useCartStore from '../../../app/stores/cartStore';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RelatedProducts = ({ currentProductId, categoryId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await menuAPI.getMenuItems();
        
        // Handle Vietnamese schema response
        const allProducts = response.data?.items || response.data || [];
        
        // Filter products by same category, excluding current product
        let filtered = allProducts.filter(product => {
          const productId = product.MaMon || product.id;
          const productCategoryId = product.MaLoai || product.categoryId;
          
          return productId !== parseInt(currentProductId) && 
                 productCategoryId === categoryId &&
                 (product.TrangThai === 'Còn bán' || product.available !== false);
        });

        // If no products in same category, get random products
        if (filtered.length === 0) {
          filtered = allProducts
            .filter(product => {
              const productId = product.MaMon || product.id;
              return productId !== parseInt(currentProductId) &&
                     (product.TrangThai === 'Còn bán' || product.available !== false);
            })
            .slice(0, 8);
        }

        // Shuffle and limit to 8 products
        const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 8);
        setRelatedProducts(shuffled);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      fetchRelatedProducts();
    }
  }, [currentProductId, categoryId]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`Đã thêm ${product.TenMon || product.name} vào giỏ hàng`);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    // Scroll to top when navigating to new product
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const itemsPerPage = 4;
  const totalSlides = Math.ceil(relatedProducts.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentProducts = () => {
    const startIndex = currentSlide * itemsPerPage;
    return relatedProducts.slice(startIndex, startIndex + itemsPerPage);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-3 rounded mb-4"></div>
              <div className="bg-gray-300 h-6 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sản phẩm liên quan</h2>
        
        {totalSlides > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              {currentSlide + 1} / {totalSlides}
            </span>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getCurrentProducts().map((product) => {
          const productId = product.MaMon || product.id;
          const productName = product.TenMon || product.name;
          const productDescription = product.MoTa || product.description;
          const productPrice = product.DonGia || product.price;
          const productImage = product.HinhAnh || product.image;
          const isAvailable = product.TrangThai === 'Còn bán' || product.available !== false;
          const isFeatured = product.NoiBat || product.featured;
          const soldCount = product.DaBan || product.sold || 0;

          return (
            <div key={productId} className="group cursor-pointer">
              <div onClick={() => handleProductClick(productId)}>
                <ProductCard
                  id={productId}
                  img={productImage}
                  title={productName}
                  price={productPrice}
                  sold={soldCount}
                  description={productDescription}
                  onAddToCart={(e) => {
                    e.stopPropagation(); // Prevent navigation when clicking add to cart
                    handleAddToCart(product);
                  }}
                  isAvailable={isAvailable}
                  featured={isFeatured}
                  formatPrice={formatCurrency}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots indicator for mobile */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2 md:hidden">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-amber-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* View all products link */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/menu')}
          className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          Xem tất cả sản phẩm →
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;
