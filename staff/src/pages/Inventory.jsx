import { useState, useEffect } from "react";
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch inventory data from the JSON file in the public folder
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

  // Function to determine the color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500 text-white";
      case "Low Stock":
        return "bg-yellow-500 text-white";
      case "Critical":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200";
    }
  };

  // Find low stock or critical items to show in the notification
  const lowStockItems = inventory.filter(
    (item) => item.status === "Low Stock" || item.status === "Critical"
  );

  return (
    <div className="container mx-auto p-6">
      {/* Notification */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-400 text-black p-4 rounded-lg mb-6 flex items-center space-x-3">
          <FaExclamationTriangle className="text-2xl" />
          <span className="font-semibold">
            Attention: {lowStockItems.length} items are low in stock or
            critical! Please take action.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Inventory Management
        </h1>
        {/* <button
          onClick={openModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Add New Item
        </button> */}
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Item Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Quantity</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-100 transition duration-200"
              >
                <td className="px-6 py-4">{item.itemName}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block ${getStatusColor(
                      item.status
                    )} px-3 py-1 rounded-lg`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-6 py-4 flex space-x-2">
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
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
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

export default InventoryPage;
