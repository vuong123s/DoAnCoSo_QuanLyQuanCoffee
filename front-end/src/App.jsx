import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProductSlider from "./components/ProductSlider";
import Product from "./components/Product";
import BestSeller from "./components/BestSeller";


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <ProductSlider />
              <BestSeller />
            </div>
          }
        />
        <Route path="/thuc-don" element = {
          <div>
            <Product />
          </div>
        }/>
        <Route path="/cua-hang"/>
        <Route path="/gioi-thieu"/>
        <Route path="/bai-viet"/>
        {/* <Route path="/wishlist"/> */}
        <Route path="/gio-hang"/>
        <Route path="/dang-nhap"/>
      </Routes>
    </Router>
  );
}

export default App;
