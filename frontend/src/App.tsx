import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import SellersPage from './pages/SellersPage';
import SellerDetailPage from './pages/SellerDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationsPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerSettingsPage from './pages/SellerSettingsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import OrdersPage from './pages/OrdersPage';
import ChatPage from './pages/ChatPage';
import PartnersPage from './pages/PartnersPage';
import TutorialsPage from './pages/TutorialsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ReferralProductsPage from './pages/ReferralProductsPage';
import TariffsPage from './pages/TariffsPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { authAPI } from './services/api';
import { setUser } from './store/slices/authSlice';
import { handleReferralCode, getRefCodeFromUrl } from './utils/referral';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle referral code from URL and save to cookies
    const refCode = handleReferralCode();

    // Check for existing tokens and restore auth state
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      let isAuthenticated = false;

      if (accessToken && refreshToken) {
        try {
          // Try to get current user
          const response = await authAPI.getCurrentUser();
          dispatch(setUser(response.data));
          isAuthenticated = true;
        } catch (error) {
          // If token is invalid, clear it
          console.error('Failed to restore auth:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }

      // If user has referral code but not authenticated, redirect to login
      if (refCode && !isAuthenticated && location.pathname !== '/login') {
        navigate('/login');
      }

      setLoading(false);
    };

    initAuth();
  }, [dispatch, navigate, location.pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="App">
      <Header />
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        <Routes>
          {/* Публичные роуты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/sellers" element={<SellersPage />} />
          <Route path="/sellers/:id" element={<SellerDetailPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Защищенные роуты - требуют авторизации */}
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral-products"
            element={
              <ProtectedRoute>
                <ReferralProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tariffs"
            element={
              <ProtectedRoute>
                <TariffsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-settings"
            element={
              <ProtectedRoute>
                <SellerSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/panel"
            element={
              <ProtectedRoute>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default App;
