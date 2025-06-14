import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Bookings from "./pages/Bookings";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";
import Reviews from "./pages/Reviews";
import Decision from "./pages/Decision";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/decision" element={<Decision />} />
        <Route path="*" element={<Bookings />} /> {/* Redirect unknown routes */}
      </Routes>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
