import { LuShoppingCart } from "react-icons/lu";

function ProductCard({ id, img, title, price, sold }) {
  // Safe data handling
  const safeTitle = title || 'Sản phẩm';
  const safePrice = price || 0;
  const safeSold = sold || 0;
  const safeImg = img || "./src/assets/products/product (1).jpg";

  return (
    <div className='group text-[#27272f] mx-5 my-5 relative'>
      <div className=' rounded-lg overflow-hidden bg-[#beb996]'>
        <img 
          className='group-hover:scale-105 group-hover:opacity-50 group-hover:rotate-1 transition-all duration-700 ease-in-out' 
          src={safeImg} 
          alt={safeTitle}
          onError={(e) => {
            e.target.src = "./src/assets/products/product (1).jpg";
          }}
        />
      </div>
      <div className=''>
        <div className=' flex px-3 group-hover:text-[#de9190] transition-all duration-700 ease-in-out ' >
          <h2 className='regular-20 tracking-wider capitalize my-3 mr-auto'>
            <a className='no-underline' href="/">{safeTitle}</a>
          </h2>
          <LuShoppingCart className='regular-20 tracking-wider capitalize my-auto' />
        </div>
        <div className=' flex text-[#777777] regular-16 tracking-wider px-3'>
          <p className='mr-auto'>{safeSold} đã bán</p>
          <p>{safePrice}k</p>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;


