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

const initialState: CartState = {
  sellerId: null,
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
};

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
    },
    clearCart: (state) => {
      state.sellerId = null;
      state.items = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
