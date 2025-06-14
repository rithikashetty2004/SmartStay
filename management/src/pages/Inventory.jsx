import { useState, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/data/inventory.json")
      .then((response) => response.json())
      .then((data) => setInventory(data))
      .catch((error) => console.error("Error fetching inventory data:", error));
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddItem = (newItem) => {
    setInventory([...inventory, newItem]);
    closeModal();
  };

  // Function to determine row styling based on status
  const getStatusClass = (status) => {
    switch (status) {
      case "Available":
        return "text-green-600";
      case "Low Stock":
        return "text-yellow-600";
      case "Critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Find low stock or critical items
  const lowStockItems = inventory.filter(
    (item) => item.status === "Low Stock" || item.status === "Critical"
  );

  return (
    <div className="p-6">
      {/* Low Stock Notification */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-400 text-black p-4 rounded-lg mb-4 flex items-center space-x-3">
          <FaExclamationTriangle className="text-2xl" />
          <span className="font-semibold">
            Warning: {lowStockItems.length} items are low in stock or critical.
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Add New Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">Item Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-100 transition duration-200">
                <td className="p-3">{item.itemName}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{item.quantity}</td>
                <td className={`p-3 font-semibold ${getStatusClass(item.status)}`}>
                  {item.status}
                </td>
                <td className="p-3 flex space-x-2">
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200">
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding New Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-1/3 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Add New Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newItem = {
                  id: inventory.length + 1,
                  itemName: e.target.name.value,
                  category: e.target.category.value,
                  quantity: parseInt(e.target.quantity.value),
                  status: "Available", // Default status
                };
                handleAddItem(newItem);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
