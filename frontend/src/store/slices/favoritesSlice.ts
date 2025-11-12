import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteProduct {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  seller_name: string;
  created_at: string;
}

interface FavoritesState {
  items: FavoriteProduct[];
  favoriteIds: Set<string>;
  loading: boolean;
  hasMore: boolean;
}

const initialState: FavoritesState = {
  items: [],
  favoriteIds: new Set(),
  loading: false,
  hasMore: true,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<FavoriteProduct[]>) => {
      state.items = action.payload;
      state.favoriteIds = new Set(action.payload.map(p => p.id));
      state.loading = false;
    },
    addFavorite: (state, action: PayloadAction<FavoriteProduct>) => {
      if (!state.favoriteIds.has(action.payload.id)) {
        state.items = [action.payload, ...state.items];
        state.favoriteIds.add(action.payload.id);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
      state.favoriteIds.delete(action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<{ id: string; product?: FavoriteProduct }>) => {
      const { id, product } = action.payload;
      if (state.favoriteIds.has(id)) {
        state.items = state.items.filter(p => p.id !== id);
        state.favoriteIds.delete(id);
      } else if (product) {
        state.items = [product, ...state.items];
        state.favoriteIds.add(id);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    clearFavorites: (state) => {
      state.items = [];
      state.favoriteIds.clear();
      state.hasMore = true;
    },
  },
});

export const {
  setFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  setLoading,
  setHasMore,
  clearFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
