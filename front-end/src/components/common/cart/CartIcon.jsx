import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import useCartStore from '../../../app/stores/cartStore';

const CartIcon = ({ onClick, className = "" }) => {
  const { getCartItemCount } = useCartStore();
  const itemCount = getCartItemCount();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-700 hover:text-amber-600 transition-colors ${className}`}
    >
      <FiShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
