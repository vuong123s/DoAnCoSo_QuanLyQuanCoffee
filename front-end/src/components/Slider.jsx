import React from 'react'
import { Navigation, Autoplay, Pagination, Scrollbar, A11y } from 'swiper/modules';
import {Link} from 'react-router-dom'

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';


import ContentImg1 from '../assets/hero-slider/content-image-1.png'
import ContentImg2 from '../assets/hero-slider/content-image-2.png'
import ContentImg3 from '../assets/hero-slider/content-image-3.png'
import Icon1 from '../assets/hero-slider/icon-1.png'
import Icon2 from '../assets/hero-slider/icon-2.png'
import Icon3 from '../assets/hero-slider/icon-3.png'

import Icon6 from '../assets/hero-slider/icon-6.png'
import Icon7 from '../assets/hero-slider/icon-7.png'
import Pattern1 from '../assets/hero-slider/pattern-1.png'
import BtnIcon from '../assets/hero-slider/btn-icon.png'


const data = [
  {
      content_img: ContentImg1,
      icon_1: Icon2,
      bg: "bg-[#beb996]"
  },
  {
    content_img: ContentImg3,
    icon_1: Icon7,
    bg: "bg-[#a79bac]"
  },
  {
      content_img: ContentImg2,
      icon_1: Icon6,
      bg: "bg-[#beb996]"
  },
  
]

const Slider = () => {
  return (
    <Swiper
      // install Swiper modules
      modules={[Pagination, A11y, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      
      pagination={{ clickable: true }}
      
      loop={true}
      autoplay={{
        delay: 50000,
        disableOnInteraction: false
      }}
      className='relative transition-all duration-200 h-screen'
      
    >
    
        {
          data.map((x, index) => {
            return (
              <SwiperSlide key={index} className={`${x.bg} min-h-screen`}>
                <div className='slide relative flex items-center justify-between p-8 md:p-16 lg:p-20 min-h-screen'>
                  <div className='z-10 flex items-start justify-center flex-col mx-4 md:mx-8 lg:mx-14 flex-1 -mt-16 md:-mt-20'>
                    <div className='flex items-start flex-col text-white slide_content px-4 md:px-8 lg:px-12 opacity-100 translate-y-0 transition-all duration-1000'>
                     <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                         Hương vị đích thực
                    </h1>
                      <p className="leading-6 md:leading-7 lg:leading-8 text-left text-sm md:text-base lg:text-lg mb-6 md:mb-8 max-w-sm md:max-w-md lg:max-w-lg">
                        Khám phá thế giới cà phê đặc biệt với những hạt cà phê rang xay thủ công và không gian hiện đại, ấm cúng. Mỗi ly cà phê là một câu chuyện.
                      </p>
                      <Link to='/menu'>
                      <div className='inline-flex items-center justify-center rounded-full px-3 md:px-4 py-2 md:py-3 pr-4 md:pr-6 text-white bg-[#de9190] hover:bg-[#91ad41] transition-all duration-400 ease-in-out cursor-pointer'>
                        <div className='rounded-full bg-white flex items-center justify-center mx-1 md:mx-2 w-8 md:w-10 h-8 md:h-10'>
                          <img className='w-4 md:w-6 h-4 md:h-6' src={BtnIcon} alt="" />
                        </div>
                        <p className='px-2 md:px-3 tracking-wider font-semibold text-sm md:text-base'>Mua Ngay</p>
                      </div></Link>
                    </div>
                    
                  </div>
                  <div className='relative flex-1 flex items-center justify-center px-4 md:px-8 lg:px-10'>             
                    <img className='w-full absolute -left-20 -bottom-64  max-w-3xl h-auto object-contain z-20' src={x.content_img} alt="" />
                  </div>
                  <img className='absolute bottom-0 opacity-70  animate-pulse' src={Icon3} alt="" />
                  <img className='max-w-3xl top-0 right-0 absolute opacity-50  animate-spin-slow' src={Icon1} alt="" />
                  <img className='absolute -top-24 opacity-70 animate-bounce z-30' src={x.icon_1} alt="" />
                </div>
              </SwiperSlide>
            )
          })
        }
      
      <img src={Pattern1} alt="" className='absolute z-10 bottom-0 w-full'/>
    </Swiper>
  )
}

export default Slider