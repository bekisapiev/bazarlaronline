import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  hasMore: true,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = [...state.items, ...action.payload];
      state.loading = false;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items = [action.payload, ...state.items];
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => {
        if (!n.is_read) {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter(n => n.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.hasMore = true;
    },
  },
});

export const {
  setNotifications,
  addNotifications,
  addNotification,
  setUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  setLoading,
  setHasMore,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
