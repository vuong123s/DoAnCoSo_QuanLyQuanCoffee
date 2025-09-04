import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

const slides = [
  {
    title: "Cà phê Trung Nguyên – Khởi đầu tỉnh thức",
    desc: "Đậm đà hương vị truyền thống, mang đến nguồn năng lượng tích cực để bắt đầu ngày mới đầy hứng khởi.",
    image: "./src/assets/img/coffee-trungnguyen.png",
    rating: 5,
    reviews: "12,382",
    label: "Tinh hoa cà phê Việt",
  },
  {
    title: "Hương vị sáng tạo – Trải nghiệm khác biệt",
    desc: "Mỗi giọt cà phê là sự kết hợp hoàn hảo giữa hương thơm nồng nàn và vị đắng nhẹ, khơi nguồn cảm hứng sáng tạo.",
    image: "./src/assets/img/coffee-trungnguyen2.png",
    rating: 4,
    reviews: "8,524",
    label: "Sáng tạo cùng Trung Nguyên",
  },
  {
    title: "Năng lượng bền vững – Sống khỏe mỗi ngày",
    desc: "Cà phê Trung Nguyên không chỉ giúp bạn tỉnh táo mà còn nuôi dưỡng sức khỏe tinh thần và thể chất lâu dài.",
    image: "./src/assets/img/coffee-trungnguyen.png",
    rating: 5,
    reviews: "15,987",
    label: "Năng lượng tích cực",
  },
  {
    title: "Cà phê Trung Nguyên Legend – Hành trình vươn xa",
    desc: "Mang hương vị cà phê Việt Nam ra thế giới, kết nối hàng triệu tín đồ cà phê bằng sự đam mê và khát vọng.",
    image: "./src/assets/img/coffee-trungnguyen.png",
    rating: 5,
    reviews: "20,456",
    label: "Khát vọng toàn cầu",
  },
];

const ProductSlider = () => {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      autoplay={{ delay: 4000 }}
      pagination={{ clickable: true }}
      loop
      className="w-full h-[600px]"
    >
      {slides.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="grid grid-cols-12 montserrat items-center justify-center gap-6 px-16 h-full">
            {/* Left Text */}
            <div className="col-span-5 flex flex-col space-y-4 pl-20">
              <span className="px-4 py-1 bg-gray-100 text-sm rounded-full self-start">
                {item.label}
              </span>
              <h2 className="text-4xl font-bold text-green-800 leading-snug">
                {item.title}
              </h2>
              <p className="text-gray-600">{item.desc}</p>
            </div>

           {/* Center Image */}
            <div className="col-span-4 flex justify-center relative">
            {/* Text Background */}
                <div className="absolute text-[180px] font-extrabold tracking-[0.2em] select-none -z-10
                                text-transparent stroke-text uppercase">
                    Trung Nguyên
                </div>

                {/* Product Image */}
                <img
                    src={item.image}    
                    alt={item.title}
                    className="h-[500px] object-contain drop-shadow-2xl relative z-10"
                />
            </div>

            {/* Right Review */}
            <div className="col-span-3 flex flex-col items-start space-y-4">
              <div className="bg-gray-100 p-4 rounded-xl flex items-center space-x-4 shadow">
                <img
                  src={item.image}
                  alt="thumb"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.reviews} Reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductSlider;
