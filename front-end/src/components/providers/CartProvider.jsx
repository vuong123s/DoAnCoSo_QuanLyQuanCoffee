import { useEffect } from 'react';
import useCartStore from '../../app/stores/cartStore';

const CartProvider = ({ children }) => {
  const { initializeCart } = useCartStore();

  useEffect(() => {
    // Initialize cart when app starts
    initializeCart();
  }, [initializeCart]);

  return children;
};

export default CartProvider;
