import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default MainLayout;
