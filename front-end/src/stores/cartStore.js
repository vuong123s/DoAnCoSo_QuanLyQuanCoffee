import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onlineOrderAPI } from '../services/api';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      sessionId: null,
      loading: false,
      
      // Actions
      initializeCart: async () => {
        const { sessionId } = get();
        try {
          set({ loading: true });
          
          // Generate session ID if not exists
          let currentSessionId = sessionId;
          if (!currentSessionId) {
            currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            set({ sessionId: currentSessionId });
          }
          
          // Load cart from server
          const response = await onlineOrderAPI.getCart(currentSessionId);
          set({ items: response.data || [] });
        } catch (error) {
          console.error('Initialize cart error:', error);
          // If server error, keep local cart
        } finally {
          set({ loading: false });
        }
      },
      
      addToCart: async (item, quantity = 1) => {
        const { items, sessionId } = get();
        
        try {
          set({ loading: true });
          
          // Check if item already exists
          const existingItem = items.find(cartItem => cartItem.MaMon === item.MaMon);
          
          if (existingItem) {
            // Update quantity
            await get().updateQuantity(item.MaMon, existingItem.SoLuong + quantity);
          } else {
            // Add new item
            const cartData = {
              MaMon: item.MaMon,
              SoLuong: quantity,
              GhiChu: '',
              sessionId: sessionId
            };
            
            await onlineOrderAPI.addToCart(cartData);
            
            // Update local state
            const newItem = {
              ...item,
              SoLuong: quantity,
              GhiChu: ''
            };
            
            set({ items: [...items, newItem] });
            toast.success(`Đã thêm ${item.TenMon} vào giỏ hàng`);
          }
        } catch (error) {
          console.error('Add to cart error:', error);
          toast.error('Có lỗi khi thêm vào giỏ hàng');
        } finally {
          set({ loading: false });
        }
      },
      
      updateQuantity: async (itemId, newQuantity) => {
        const { items } = get();
        
        if (newQuantity <= 0) {
          await get().removeFromCart(itemId);
          return;
        }
        
        try {
          set({ loading: true });
          
          const item = items.find(item => item.MaMon === itemId);
          if (!item) return;
          
          await onlineOrderAPI.updateCartItem(item.MaGioHang, {
            SoLuong: newQuantity
          });
          
          // Update local state
          const updatedItems = items.map(item =>
            item.MaMon === itemId ? { ...item, SoLuong: newQuantity } : item
          );
          
          set({ items: updatedItems });
        } catch (error) {
          console.error('Update quantity error:', error);
          toast.error('Có lỗi khi cập nhật số lượng');
        } finally {
          set({ loading: false });
        }
      },
      
      removeFromCart: async (itemId) => {
        const { items } = get();
        
        try {
          set({ loading: true });
          
          const item = items.find(item => item.MaMon === itemId);
          if (!item) return;
          
          await onlineOrderAPI.removeFromCart(item.MaGioHang);
          
          // Update local state
          const updatedItems = items.filter(item => item.MaMon !== itemId);
          set({ items: updatedItems });
          
          toast.success('Đã xóa món khỏi giỏ hàng');
        } catch (error) {
          console.error('Remove from cart error:', error);
          toast.error('Có lỗi khi xóa khỏi giỏ hàng');
        } finally {
          set({ loading: false });
        }
      },
      
      clearCart: async () => {
        const { sessionId } = get();
        
        try {
          set({ loading: true });
          
          await onlineOrderAPI.clearCart(sessionId);
          set({ items: [] });
          
          toast.success('Đã xóa tất cả món khỏi giỏ hàng');
        } catch (error) {
          console.error('Clear cart error:', error);
          toast.error('Có lỗi khi xóa giỏ hàng');
        } finally {
          set({ loading: false });
        }
      },
      
      updateItemNote: async (itemId, note) => {
        const { items } = get();
        
        try {
          const item = items.find(item => item.MaMon === itemId);
          if (!item) return;
          
          await onlineOrderAPI.updateCartItem(item.MaGioHang, {
            GhiChu: note
          });
          
          // Update local state
          const updatedItems = items.map(item =>
            item.MaMon === itemId ? { ...item, GhiChu: note } : item
          );
          
          set({ items: updatedItems });
        } catch (error) {
          console.error('Update note error:', error);
          toast.error('Có lỗi khi cập nhật ghi chú');
        }
      },
      
      // Getters
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.DonGia * item.SoLuong), 0);
      },
      
      getCartItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.SoLuong, 0);
      },
      
      getCartItem: (itemId) => {
        const { items } = get();
        return items.find(item => item.MaMon === itemId);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        sessionId: state.sessionId
      })
    }
  )
);

export default useCartStore;
