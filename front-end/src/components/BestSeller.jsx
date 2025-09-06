import React from 'react'
import ProductSeller from '../components/ProductSeller'
import Separate from "../assets/img/separate.png"
const BestSeller = () => {
  return (
       <div className="flex justify-center" >
         <div className='flexCenter flex-col relative'>
            <div className='flex flex-col items-center '>
                <div class="text-[#38351f] text-5xl font-[700] tracking-wider capitalize my-3">Danh mục bán chạy</div>
                <img className='my-3' src={Separate} alt="" />
            </div>
            {/* <img className=' absolute h-full left-0' src="https://preview.designtone.xyz/html/foodily/images/background/pattern-5.png" alt="" /> */}
            <div className='max_padd_container flex '>
                <ProductSeller img="https://preview.designtone.xyz/html/foodily/images/resource/news-1.jpg"
                                title="Broad bean and goats’ cheese bruschetta"
                                top={1}
                                quantity={50}
                /> 
                <ProductSeller img="https://preview.designtone.xyz/html/foodily/images/resource/news-2.jpg"
                                title="Broad bean and goats’ cheese bruschetta"
                                top={2}
                                quantity={50}
                />   
                <ProductSeller img="https://preview.designtone.xyz/html/foodily/images/resource/news-3.jpg"
                                title="Broad bean and goats’ cheese bruschetta"
                                top={3}
                                quantity={50}
                /> 
            </div>
        </div>
    </div>
  )
}

export default BestSeller