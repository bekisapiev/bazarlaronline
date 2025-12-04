import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  discountPrice?: number;
}

interface CartState {
  sellerId: string | null;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return {
    sellerId: null,
    items: [],
    totalAmount: 0,
    totalQuantity: 0,
  };
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem('cart', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ sellerId: string; item: CartItem }>) => {
      const { sellerId, item } = action.payload;

      // If cart is for different seller, clear it
      if (state.sellerId && state.sellerId !== sellerId) {
        state.items = [];
        state.totalAmount = 0;
        state.totalQuantity = 0;
      }

      state.sellerId = sellerId;

      // Check if item already in cart
      const existingItem = state.items.find(i => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }

      // Recalculate totals
      state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalAmount = state.items.reduce(
        (sum, i) => sum + (i.discountPrice || i.price) * i.quantity,
        0
      );

      // Save to localStorage
      saveCartToStorage(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.productId !== action.payload);

      // Recalculate totals
      state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalAmount = state.items.reduce(
        (sum, i) => sum + (i.discountPrice || i.price) * i.quantity,
        0
      );

      // Clear seller if cart is empty
      if (state.items.length === 0) {
        state.sellerId = null;
      }

      // Save to localStorage
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.sellerId = null;
      state.items = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;

      // Save to localStorage
      saveCartToStorage(state);
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.productId === action.payload);
      if (item) {
        item.quantity += 1;

        // Recalculate totals
        state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.totalAmount = state.items.reduce(
          (sum, i) => sum + (i.discountPrice || i.price) * i.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.productId === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;

        // Recalculate totals
        state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.totalAmount = state.items.reduce(
          (sum, i) => sum + (i.discountPrice || i.price) * i.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.productId === productId);
      if (item && quantity > 0) {
        item.quantity = quantity;

        // Recalculate totals
        state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.totalAmount = state.items.reduce(
          (sum, i) => sum + (i.discountPrice || i.price) * i.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, incrementQuantity, decrementQuantity, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
