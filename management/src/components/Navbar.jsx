import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/bookings" className="text-white font-bold text-2xl tracking-wide">
            Stay Booker
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link className="text-white hover:text-gray-300" to="/bookings">Bookings</Link>
            <Link className="text-white hover:text-gray-300" to="/staff">Staff</Link>
            <Link className="text-white hover:text-gray-300" to="/inventory">Inventory</Link>
            <Link className="text-white hover:text-gray-300" to="/decision">Decision</Link>
            {/* <Link className="text-white hover:text-gray-300" to="/reviews">Reviews</Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
