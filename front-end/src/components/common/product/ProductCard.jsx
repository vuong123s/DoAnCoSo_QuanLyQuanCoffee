import { LuShoppingCart } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddToCartModal from "../modal/AddToCartModal";

function ProductCard({ 
  id, 
  img, 
  title, 
  price, 
  sold, 
  description,
  onAddToCart,
  isAvailable = true,
  featured = false,
  formatPrice,
  onClick,
  product // Add product prop for modal
}) {
  const navigate = useNavigate();
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  // Safe data handling
  const safeTitle = title || 'Sản phẩm';
  const safePrice = price || 0;
  const safeSold = sold || 0;
  const safeImg = img || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
  const safeDescription = description || '';

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click when clicking add to cart
    if (isAvailable) {
      if (product) {
        // Show modal for detailed add to cart
        setShowAddToCartModal(true);
      } else if (onAddToCart) {
        // Fallback to simple add to cart
        onAddToCart();
      }
    }
  };

  const handleCardClick = () => {
    console.log('Card clicked - Product ID:', id, 'Type:', typeof id);
    if (onClick) {
      onClick();
    } else if (id) {
      console.log('Navigating to product detail:', `/product/${id}`);
      navigate(`/product/${id}`);
    } else {
      console.warn('No ID provided for navigation');
    }
  };

  const displayPrice = formatPrice ? formatPrice(safePrice) : `${safePrice}k`;

  return (
    <div 
      className='group text-[#27272f] mx-2 my-5 relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer'
      onClick={handleCardClick}
    >
      <div className='relative rounded-t-lg overflow-hidden bg-[#beb996]'>
        <img 
          className='w-full h-48 object-cover group-hover:scale-105 transition-all duration-700 ease-in-out' 
          src={safeImg} 
          alt={safeTitle}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
          }}
        />
        {featured && (
          <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Nổi bật
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Hết hàng</span>
          </div>
        )}
      </div>
      
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h2 className='text-lg font-semibold text-gray-900 line-clamp-1'>
            {safeTitle}
          </h2>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 relative"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        
        {safeDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {safeDescription}
          </p>
        )}
        
        <div className='flex justify-between items-center text-sm'>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-amber-600">
              {displayPrice}
            </span>
            {safeSold > 0 && (
              <span className="text-gray-500 text-xs">
                {safeSold} đã bán
              </span>
            )}
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
}

export default ProductCard;


