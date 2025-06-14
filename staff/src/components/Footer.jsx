const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          {/* Left Side */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold">Hotel Manage</h2>
            <p className="text-gray-400">Enhancing hospitality management with AI & automation.</p>
          </div>
  
          {/* Center Links */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-400">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400">Terms of Service</a>
            <a href="#" className="hover:text-blue-400">Contact Us</a>
          </div>
  
          {/* Right Side */}
          <p className="text-gray-500 mt-4 md:mt-0">&copy; 2025 Hotel Manage. All rights reserved.</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  