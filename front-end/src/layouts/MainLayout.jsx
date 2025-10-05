import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/layout/Navbar';
import Footer from '../components/common/layout/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
