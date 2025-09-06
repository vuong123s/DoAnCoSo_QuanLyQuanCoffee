import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Thực đơn", path: "/thuc-don" },
    { label: "Cửa hàng", path: "/cua-hang" },
    { label: "Giới thiệu", path: "/gioi-thieu" },
    { label: "Bài viết", path: "/bai-viet" },
  ];

  return (
    <nav className="mt-6 mx-[160px] flex items-center justify-between h-20">
      <Link to="/">
      <img className="w-[160px]" src="./src/assets/img/logo3.png" alt="logo" />
      </Link>

      <ul className="flex space-x-4 px-[24px] py-[8px] text-sm montserrat-600 text-[#0F4026] rounded-full bg-[#EEEEEE] justify-between items-center">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`cursor-pointer transition-all duration-300 ease-in-out ${
                location.pathname === item.path
                  ? "px-[16px] py-[4px] bg-[#FEFEFE] rounded-full scale-105 shadow-md"
                  : "px-[16px] py-[4px]"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        {/* <Link
          to="/wishlist"
          className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#EEEEEE] hover:shadow-lg transition"
        >
          <img src="./src/assets/img/whitelist-nav.svg" alt="whitelist" />
        </Link> */}

        <Link
          to="/gio-hang"
          className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#EEEEEE] hover:shadow-lg transition"
        >
          <img className="w-[20px] h-[20px]" src="./src/assets/img/cart-nav.svg" alt="cart" />
        </Link>

        <Link
          to="/tai-khoan"
          className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#EEEEEE] hover:shadow-lg transition"
        >
          <img className="w-[24px] h-[24px]" src="./src/assets/img/user-nav.png" alt="user" />
        </Link>
      </div>
    </nav>
  );
};

export default Header;
