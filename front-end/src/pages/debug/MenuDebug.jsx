import React, { useEffect, useState } from 'react';
import { menuAPI } from '../../shared/services/api';

const MenuDebug = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Fetching menu data...');
        
        const [categoriesResponse, menuResponse] = await Promise.all([
          menuAPI.getCategories(),
          menuAPI.getMenuItems()
        ]);
        
        console.log('📊 Raw Categories Response:', categoriesResponse);
        console.log('📊 Raw Menu Response:', menuResponse);
        
        setData({
          categories: categoriesResponse.data,
          menu: menuResponse.data
        });
        
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Menu Debug Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Categories Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(data?.categories, null, 2)}
          </pre>
        </div>
        
        {/* Menu Items Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Menu Items Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(data?.menu, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Processed Data */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Processed Data Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Categories Analysis:</h3>
            <ul className="text-sm space-y-1">
              <li>Type: {Array.isArray(data?.categories?.categories) ? 'Array in categories property' : 
                         Array.isArray(data?.categories) ? 'Direct array' : 'Other'}</li>
              <li>Count: {
                Array.isArray(data?.categories?.categories) ? data.categories.categories.length :
                Array.isArray(data?.categories) ? data.categories.length : 0
              }</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Menu Items Analysis:</h3>
            <ul className="text-sm space-y-1">
              <li>Type: {
                Array.isArray(data?.menu?.menus) ? 'Array in menus property' :
                Array.isArray(data?.menu?.menu_items) ? 'Array in menu_items property' :
                Array.isArray(data?.menu?.items) ? 'Array in items property' :
                Array.isArray(data?.menu) ? 'Direct array' : 'Other'
              }</li>
              <li>Count: {
                Array.isArray(data?.menu?.menus) ? data.menu.menus.length :
                Array.isArray(data?.menu?.menu_items) ? data.menu.menu_items.length :
                Array.isArray(data?.menu?.items) ? data.menu.items.length :
                Array.isArray(data?.menu) ? data.menu.length : 0
              }</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Sample Items Display */}
      {data?.menu?.menus && data.menu.menus.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sample Menu Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.menu.menus.slice(0, 6).map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium">{item.TenMon || item.name || 'No name'}</h3>
                <p className="text-sm text-gray-600">{item.MoTa || item.description || 'No description'}</p>
                <p className="text-lg font-bold text-amber-600">
                  {item.DonGia || item.price || 0} VND
                </p>
                <p className="text-xs text-gray-500">
                  Status: {item.TrangThai || item.status || 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuDebug;
