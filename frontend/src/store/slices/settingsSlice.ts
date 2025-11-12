import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationSettings {
  order_updates: boolean;
  new_reviews: boolean;
  new_messages: boolean;
  promotions: boolean;
  email_notifications: boolean;
}

export interface PrivacySettings {
  show_phone: boolean;
  show_email: boolean;
  show_last_seen: boolean;
  allow_messages: boolean;
}

export interface UserSettings {
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSettings: (state) => {
      state.settings = null;
      state.error = null;
    },
  },
});

export const {
  setSettings,
  updateSettings,
  setLoading,
  setError,
  clearSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
