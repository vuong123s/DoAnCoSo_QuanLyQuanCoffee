import React from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../app/stores/cartStore';
import { FiShoppingCart } from 'react-icons/fi';

const CartIcon = () => {
  const navigate = useNavigate();
  const { getCartItemCount } = useCartStore();
  const itemCount = getCartItemCount();

  const handleCartClick = () => {
    navigate('/customer/cart');
  };

  return (
    <button
      onClick={handleCartClick}
      className="relative p-2 text-gray-600 hover:text-amber-600 transition-colors"
      title="Giỏ hàng"
    >
      <FiShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
