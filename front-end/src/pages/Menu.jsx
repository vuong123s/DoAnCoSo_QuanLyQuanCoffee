import ProductCard from "../components/ProductCard";

const products = [
  {id:1, img:"./src/assets/products/product (1).jpg", title:"Cà phê chồn", price:30, sold:200},
  {id:2, img:"./src/assets/products/product (2).jpg", title:"Cà phê sữa đá", price:35, sold:150},
  {id:3, img:"./src/assets/products/product (3).jpg", title:"Cà phê đen đá", price:15, sold:300},
  {id:4, img:"./src/assets/products/product (1).jpg", title:"Cà phê chồn", price:30, sold:200},
  {id:5, img:"./src/assets/products/product (2).jpg", title:"Cà phê sữa đá", price:35, sold:150},
  {id:6, img:"./src/assets/products/product (3).jpg", title:"Cà phê đen đá", price:15, sold:300},
];

function Menu() {
  return (
    <div className='flex justify-center mt-10 mb-10'>
      <div className='w-[1024px] flex flex-col items-center'>
        <h3 className='text-[#38351f] text-5xl font-[700] tracking-wider capitalize my-3'>Menu</h3>
        <div className='flex flex-wrap justify-center'>
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu;


