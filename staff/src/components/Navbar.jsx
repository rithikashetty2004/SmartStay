import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-white font-bold text-2xl tracking-wide">
            Stay Booker
          </Link>
          <div className="hidden md:flex space-x-6">
            {user ? (
              <>
                <Link className="text-white hover:text-gray-300" to="/staff">Dashboard</Link>
                <Link className="text-white hover:text-gray-300" to="/bookings">Bookings</Link>
                <Link className="text-white hover:text-gray-300" to="/inventory">Inventory</Link>
                <Link className="text-white hover:text-gray-300" to="/attendance">Attendance</Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link className="text-white hover:text-gray-300" to="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;