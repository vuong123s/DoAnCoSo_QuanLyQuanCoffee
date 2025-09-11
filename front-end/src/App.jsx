import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProductSlider from "./components/ProductSlider";
import Menu from "./pages/Menu";
import BestSeller from "./components/BestSeller";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";


function App() {
  return (
    <Router>
     
      <Routes>
        
        <Route
          path="/"
          element={
            <div>
              <Header />
              <div>
                <ProductSlider />
                <Menu />
                <BestSeller />
              </div>
            </div>
          }
        />
        <Route path="/thuc-don" element = {<Menu />}/>
        <Route path="/cua-hang"/>
        <Route path="/gioi-thieu"/>
        <Route path="/bai-viet"/>
        {/* <Route path="/wishlist"/> */}
        <Route path="/gio-hang"/>
        <Route path="/dang-nhap"/>
      </Routes>
      {/* Admin routes */}
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
