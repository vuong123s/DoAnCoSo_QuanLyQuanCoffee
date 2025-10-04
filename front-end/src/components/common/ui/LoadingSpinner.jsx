import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-amber-600 ${sizeClasses[size]}`}></div>
      <p className="mt-4 text-gray-600 text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
