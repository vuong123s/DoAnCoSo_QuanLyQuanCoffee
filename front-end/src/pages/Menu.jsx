import React, { useState, useEffect } from 'react';
import ProductCard from "../components/ProductCard";
import { menuAPI } from '../services/api';
import toast from 'react-hot-toast';

function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories and menu items
        const [categoriesResponse, menuResponse] = await Promise.all([
          menuAPI.getCategories().catch((err) => {
            console.error('Categories API error:', err);
            return { data: { categories: [] } };
          }),
          menuAPI.getMenuItems({ is_available: true, limit: 50 }).catch((err) => {
            console.error('Menu API error:', err);
            return { data: { menu_items: [] } };
          })
        ]);

        console.log('Categories response:', categoriesResponse.data);
        console.log('Menu response:', menuResponse.data);

        setCategories(categoriesResponse.data.categories || []);
        
        // Transform Vietnamese schema to frontend format
        const menuItems = menuResponse.data.menu_items || [];
        const transformedProducts = menuItems.map(item => ({
          id: item?.MaMon || Math.random(),
          img: item?.HinhAnh || "./src/assets/products/product (1).jpg",
          title: item?.TenMon || "Sản phẩm",
          price: item?.DonGia ? Math.round(Number(item.DonGia) / 1000) : 0,
          sold: Math.floor(Math.random() * 300) + 50, // Mock sold count
          category: item?.MaLoai || 1,
          status: item?.TrangThai || "Còn bán"
        })).filter(item => item.title && item.title !== "Sản phẩm"); // Filter out invalid items

        // Use a fallback image for all products if no image is available
        const fallbackImage = "./src/assets/products/product (1).jpg";
        const productsWithFallback = transformedProducts.map(product => ({
          ...product,
          img: product.img || fallbackImage
        }));

        setProducts(productsWithFallback);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        toast.error('Không thể tải dữ liệu menu');
        
        // Fallback to static data
        setProducts([
          {id:1, img:fallbackImage, title:"Cà phê chồn", price:30, sold:200, category: 1},
          {id:2, img:fallbackImage, title:"Cà phê sữa đá", price:35, sold:150, category: 1},
          {id:3, img:fallbackImage, title:"Cà phê đen đá", price:15, sold:300, category: 1},
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Robust filtering: avoid parseInt on non-numeric values
  const selectedIsAll = selectedCategory === 'all';
  const selectedId = Number(selectedCategory);
  const filteredProducts = (selectedIsAll || Number.isNaN(selectedId))
    ? products
    : products.filter(p => Number(p?.category) === selectedId);

  // Normalize categories to robust shape (must be outside loading check)
  const categoriesNormalized = (Array.isArray(categories) ? categories : [])
    .filter(Boolean)
    .map((c) => {
      if (c && typeof c === 'object') return c;
      // c is a primitive, coerce to object
      return { MaLoai: c, TenLoai: String(c ?? 'Danh mục') };
    });

  if (loading) {
    return (
      <div className='flex justify-center items-center mt-20'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#38351f]'></div>
      </div>
    );
  }

  return (
    <div className='flex justify-center mt-10 mb-10'>
      <div className='w-[1024px] flex flex-col items-center'>
        <h3 className='text-[#38351f] text-5xl font-[700] tracking-wider capitalize my-3'>Menu</h3>
        
        {/* Category Filter */}
        {categoriesNormalized.length > 0 && (
          <div className='flex flex-wrap justify-center mb-6 gap-2'>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#38351f] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            {categoriesNormalized.map(category => {
              const catIdRaw = category?.MaLoai;
              const catIdStr = catIdRaw === null || catIdRaw === undefined ? '' : String(catIdRaw);
              return (
                <button
                  key={catIdStr || Math.random()}
                  onClick={() => setSelectedCategory(catIdStr)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedCategory === catIdStr
                      ? 'bg-[#38351f] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category?.TenLoai || 'Danh mục'}
                </button>
              );
            })}
          </div>
        )}

        <div className='flex flex-wrap justify-center'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))
          ) : (
            <div className='text-center text-gray-500 py-10'>
              <p>Không có sản phẩm nào trong danh mục này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Menu;


