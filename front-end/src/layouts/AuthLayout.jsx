import React from 'react';
import { Outlet } from 'react-router-dom';
import   Logo from '../assets/logo2.png'

const AuthLayout = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src={Logo} className='w-[120px] !mx-auto' alt="" srcset="" />
          <p className="text-gray-600">Hệ thống quản lý quán cà phê</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
