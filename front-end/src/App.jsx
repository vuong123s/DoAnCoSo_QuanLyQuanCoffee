import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProductSlider from "./components/ProductSlider";

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
            </div>
          }
        />
        <Route path="/thuc-don"/>
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
