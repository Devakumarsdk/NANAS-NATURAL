import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, cartAPI, wishlistAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          localStorage.setItem('devcare_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          toast.success(`Welcome back, ${data.user.name}!`);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          const msg = err.response?.data?.message || 'Login failed';
          const isInvalidCredentials = /invalid.*(email|password|credentials)|email or password/i.test(msg);
          toast.error(
            msg,
            isInvalidCredentials
              ? { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } }
              : undefined
          );
          return { success: false, message: msg };
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register({ name, email, password, phone });
          localStorage.setItem('devcare_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          toast.success('Account created successfully!');
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          const msg = err.response?.data?.message || 'Registration failed';
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      logout: () => {
        localStorage.removeItem('devcare_token');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      fetchUser: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
        }
      },
    }),
    { name: 'devcare-auth', partialize: (state) => ({ token: state.token, user: state.user }) }
  )
);

// Cart Store
export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  isOpen: false,

  setOpen: (open) => set({ isOpen: open }),

  fetchCart: async () => {
    try {
      const { data } = await cartAPI.get();
      set({ items: data.cart?.items || [] });
    } catch {}
  },

  addToCart: async (productId, quantity = 1, variant = '') => {
    set({ isLoading: true });
    try {
      const { data } = await cartAPI.add({ productId, quantity, variant: variant || '' });
      set({ items: data.cart?.items || [], isLoading: false, isOpen: true });
      toast.success('Added to cart!');
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  },

  updateQuantity: async (productId, quantity, variant) => {
    try {
      const { data } = await cartAPI.update({ productId, quantity, variant: variant || '' });
      set({ items: data.cart?.items || [] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  },

  removeFromCart: async (productId) => {
    try {
      const { data } = await cartAPI.remove(productId);
      set({ items: data.cart?.items || [] });
      toast.error('Removed from cart', {
        style: { border: '1px solid #fecaca' },
        iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
      });
    } catch {}
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ items: [] });
    } catch {}
  },

  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  get count() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// Wishlist Store
export const useWishlistStore = create((set, get) => ({
  items: [],

  fetchWishlist: async () => {
    try {
      const { data } = await wishlistAPI.get();
      set({ items: data.wishlist?.products || [] });
    } catch {}
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await wishlistAPI.toggle(productId);
      get().fetchWishlist();
      toast.success(data.inWishlist ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {}
  },

  isInWishlist: (productId) => {
    return get().items.some(p => p._id === productId || p === productId);
  }
}));
