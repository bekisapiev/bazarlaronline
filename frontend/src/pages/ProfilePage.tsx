import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfileMainPage from './profile/ProfileMainPage';
import SellerSettingsSubPage from './profile/SellerSettingsSubPage';
import MyProductsSubPage from './profile/MyProductsSubPage';
import MyOrdersSubPage from './profile/MyOrdersSubPage';
import OrderedFromMeSubPage from './profile/OrderedFromMeSubPage';
import WalletSubPage from './profile/WalletSubPage';
import ReservedProductsSubPage from './profile/ReservedProductsSubPage';

const ProfilePage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ProfileMainPage />} />
      <Route path="seller-settings" element={<SellerSettingsSubPage />} />
      <Route path="my-products" element={<MyProductsSubPage />} />
      <Route path="my-orders" element={<MyOrdersSubPage />} />
      <Route path="ordered-from-me" element={<OrderedFromMeSubPage />} />
      <Route path="wallet" element={<WalletSubPage />} />
      <Route path="reserved-products" element={<ReservedProductsSubPage />} />
    </Routes>
  );
};

export default ProfilePage;
