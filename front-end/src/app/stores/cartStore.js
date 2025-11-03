import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { onlineOrderAPI } from '../../shared/services/api';

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
          
          // Try to load cart from server, but don't fail if server is down
          try {
            const response = await onlineOrderAPI.getCart(currentSessionId);
            
            if (response.data && Array.isArray(response.data)) {
              set({ items: response.data });
            }
          } catch (serverError) {
            console.warn('Could not load cart from server, using local storage:', serverError.message);
            // Keep existing local items
          }
        } catch (error) {
          console.error('Initialize cart error:', error);
          // If any error, keep local cart
        } finally {
          set({ loading: false });
        }
      },
      
      addToCart: async (item, quantity = 1) => {
        const { items, sessionId } = get();
        
        try {
          set({ loading: true });
          
          // Ensure session ID exists
          let currentSessionId = sessionId;
          if (!currentSessionId) {
            currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            set({ sessionId: currentSessionId });
          }
          
          // Check if item already exists
          const existingItem = items.find(cartItem => cartItem.MaMon === item.MaMon);
          
          if (existingItem) {
            // Update quantity
            await get().updateQuantity(item.MaMon, existingItem.SoLuong + quantity);
          } else {
            // Add new item to local state first for immediate UI feedback
            const newItem = {
              ...item,
              SoLuong: quantity,
              GhiChu: ''
            };
            
            set({ items: [...items, newItem] });
            
            // Try to sync with server (optional - can work offline)
            try {
              const cartData = {
                MaMon: item.MaMon,
                SoLuong: quantity,
                GhiChu: '',
                sessionId: currentSessionId
              };
              
              await onlineOrderAPI.addToCart(cartData);
            } catch (serverError) {
              console.warn('Failed to sync with server, keeping local cart:', serverError);
            }
            
            const itemName = item.TenMon || item.name || 'sản phẩm';
            toast.success(`Đã thêm ${itemName} vào giỏ hàng`);
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
          
          // Update local state first for immediate UI feedback
          const updatedItems = items.map(item =>
            item.MaMon === itemId ? { ...item, SoLuong: newQuantity } : item
          );
          set({ items: updatedItems });
          
          // Try to sync with server
          try {
            if (item.MaGioHang) {
              await onlineOrderAPI.updateCartItem(item.MaGioHang, {
                SoLuong: newQuantity
              });
            }
          } catch (serverError) {
            console.warn('Failed to sync quantity update with server:', serverError.message);
            // Keep local changes even if server sync fails
          }
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
          
          // Update local state first
          const updatedItems = items.filter(item => item.MaMon !== itemId);
          set({ items: updatedItems });
          
          // Try to sync with server
          try {
            if (item.MaGioHang) {
              await onlineOrderAPI.removeFromCart(item.MaGioHang);
            }
          } catch (serverError) {
            console.warn('Failed to sync item removal with server:', serverError.message);
            // Keep local changes even if server sync fails
          }
          
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
          
          // Clear local state first
          set({ items: [] });
          
          // Try to sync with server
          try {
            if (sessionId) {
              await onlineOrderAPI.clearCart(sessionId);
            }
          } catch (serverError) {
            console.warn('Failed to sync cart clear with server:', serverError.message);
            // Keep local changes even if server sync fails
          }
          
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
          
          // Update local state first
          const updatedItems = items.map(item =>
            item.MaMon === itemId ? { ...item, GhiChu: note } : item
          );
          set({ items: updatedItems });
          
          // Try to sync with server
          try {
            if (item.MaGioHang) {
              await onlineOrderAPI.updateCartItem(item.MaGioHang, {
                GhiChu: note
              });
            }
          } catch (serverError) {
            console.warn('Failed to sync note update with server:', serverError.message);
            // Keep local changes even if server sync fails
          }
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
