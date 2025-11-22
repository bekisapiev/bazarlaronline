import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
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
import AdminPanelPage from './pages/AdminPanelPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ChatPage from './pages/ChatPage';
import PartnersPage from './pages/PartnersPage';
import TutorialsPage from './pages/TutorialsPage';
import ReferralProductsPage from './pages/ReferralProductsPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/add" element={<ProductFormPage />} />
          <Route path="/sellers" element={<SellersPage />} />
          <Route path="/sellers/:id" element={<SellerDetailPage />} />
          <Route path="/profile/*" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/referral-products" element={<ReferralProductsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="/admin/panel" element={<AdminPanelPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
