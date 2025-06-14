import React from 'react';

const AboutUs = () => {
  return (
    <div className="relative w-full min-h-screen bg-white py-16 px-6 text-gray-900 flex justify-center">
      <div className="container mx-auto bg-gray-100 shadow-xl rounded-2xl p-10 max-w-4xl border border-gray-300">
        
        {/* Header Section */}
        <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-6">About Us</h1>
        <p className="text-lg text-center max-w-3xl mx-auto mb-8">
          Welcome to <span className="text-blue-600 font-semibold">STAY BOOKER</span>, your ultimate solution for **seamless hotel management**. Our platform is built to **streamline operations, enhance guest experiences, and improve efficiency** for hospitality professionals.
        </p>

        {/* Vision Section */}
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Our Vision</h2>
        <p className="text-lg mb-8 text-gray-700">
          We believe in **leveraging technology** to create smooth workflows for hotel staff and managers. Our mission is to provide **simplified hotel booking, scheduling, and inventory management** that makes hospitality operations stress-free.
        </p>

        {/* Why Choose Us Section */}
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-300">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Efficient Management</h3>
            <p className="text-lg text-gray-700">Easily **track schedules, bookings, and inventory** all in one place.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-300">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">User-Friendly Interface</h3>
            <p className="text-lg text-gray-700">Intuitive design ensures **staff can handle bookings and check-ins effortlessly.**</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-300">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Secure Transactions</h3>
            <p className="text-lg text-gray-700">Your **data and payments are protected** with industry-grade security measures.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-300">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">24/7 Support</h3>
            <p className="text-lg text-gray-700">Our **dedicated support team is available anytime** to assist your hotel staff.</p>
          </div>
        </div>

        {/* Contact Section */}
        <h2 className="text-3xl font-bold text-blue-600 mt-12 mb-4">Contact Us</h2>
        <p className="text-lg mb-4 text-gray-700">
          Have any questions? Reach out to us at{' '}
          <a className="text-blue-600 hover:underline" href="mailto:info@staybooker.com">
            info@staybooker.com
          </a>.
        </p>
        <p className="text-lg text-gray-700">Thank you for choosing <span className="text-blue-600 font-semibold">STAY BOOKER</span>. Together, let’s redefine hospitality!</p>
      </div>
    </div>
  );
};

export default AboutUs;
