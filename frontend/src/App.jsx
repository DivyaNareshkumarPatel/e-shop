import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your page components
import HomePage from './pages/Home.jsx'; 
import ProductList from './pages/ProductList.jsx'; 
import CartPage from './pages/Cart.jsx'; 
import ProductDetail from './pages/ProductDetail.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CheckoutPage from './pages/Checkout.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} /> 
        
        {/* New Route for Cart Page */}
        <Route path="/cart" element={<CartPage />} /> 
        
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<div className="text-center p-20 text-gray-800">404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;