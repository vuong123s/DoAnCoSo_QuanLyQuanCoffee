import React from 'react'

import { LuShoppingCart } from "react-icons/lu";


const Product = () => {

    const products = [
        {id:1, img:"./src/assets/products/product (1).jpg", title:"Cà phê chồn", price:30, sold:200},
        {id:2, img:"./src/assets/products/product (2).jpg", title:"Cà phê sữa đá", price:35, sold:150},
        {id:3, img:"./src/assets/products/product (3).jpg", title:"Cà phê đen đá", price:15, sold:300},
        {id:4, img:"./src/assets/products/product (1).jpg", title:"Cà phê chồn", price:30, sold:200},
        {id:5, img:"./src/assets/products/product (2).jpg", title:"Cà phê sữa đá", price:35, sold:150},
        {id:6, img:"./src/assets/products/product (3).jpg", title:"Cà phê đen đá", price:15, sold:300},
    ]
  return (
      <div className='flex flex-wrap justify-center mt-20 mb-20'>
            {products.map(({id, img, title, price, sold}) => (
                <div key={id} className='group text-[#27272f] mx-5 my-5 relative'>
                    <div className=' rounded-lg overflow-hidden bg-[#beb996]'>
                        <img className='group-hover:scale-105 group-hover:opacity-50 group-hover:rotate-1 transition-all duration-700 ease-in-out' src={img} alt="" />
                    </div>
                    <div className=''>
                        <div className=' flex px-3 group-hover:text-[#de9190] transition-all duration-700 ease-in-out ' >
                            <h2 className='regular-20 tracking-wider capitalize my-3 mr-auto'><a className='no-underline  ' href="/">{title}</a></h2>
                            <LuShoppingCart  className='regular-20 tracking-wider capitalize my-auto ' />
                        </div>
                        <div className=' flex text-[#777777] regular-16 tracking-wider px-3'>
                            <p className='mr-auto'>{sold} đã bán</p> 
                            <p>{price}k</p> 
                        </div>
                    </div>
                </div>  
            ))}
      </div>
    )
}

export default Product