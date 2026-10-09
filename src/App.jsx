import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/Mainlayout";
import ScrollToTop from "./components/layout/ScrollToTop";
import CartWidget from "./components/cart/CartWidget";
import Home from "./pages/home/Home";
import ShopPage from "./pages/home/ShopPage";
import ProductDetailPage from "./pages/home/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AuthPage from "./pages/AuthPage";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="login" element={<AuthPage />} />
            <Route path="product/:slug" element={<ProductDetailPage />} />
          </Route>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Routes>
        <CartWidget />
      </Router>
    </CartProvider>
  );
}
export default App;
