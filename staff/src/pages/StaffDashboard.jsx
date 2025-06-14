import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [workLog, setWorkLog] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Fetch Work Log Data
  useEffect(() => {
    if (user) {
      fetch("/data/worklog.json")
        .then((res) => res.json())
        .then((data) => {
          const staffWork = data.find((log) => log.staffEmail === user.email);
          if (staffWork) setWorkLog(staffWork.tasks);
        });
    }
  }, [user]);

  // Add a new task to the To-Do list
  const addTask = () => {
    if (newTask.trim()) {
      setTodoList([...todoList, newTask]);
      setNewTask("");
    }
  };

  // Remove a task from the To-Do list
  const removeTask = (index) => {
    setTodoList(todoList.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800">Staff Dashboard</h1>
        <p className="text-lg text-gray-600 mt-2">
          Welcome, <span className="font-semibold text-blue-600">{user?.name}</span>
        </p>

        {/* Dashboard Layout */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section - Work Log */}
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Daily Work Log</h2>
            {workLog.length > 0 ? (
              <ul className="space-y-2">
                {workLog.map((task, index) => (
                  <li
                    key={index}
                    className="bg-blue-100 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-3">No work log available.</p>
            )}
          </div>

          {/* Right Section - To-Do List */}
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">To-Do List</h2>
            <div className="flex">
              <input
                type="text"
                placeholder="Add new task..."
                className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-5 rounded-r-lg transition-all hover:bg-blue-700"
                onClick={addTask}
              >
                Add
              </button>
            </div>
            {/* List of tasks */}
            {todoList.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {todoList.map((task, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm"
                  >
                    <span className="text-gray-700">{task}</span>
                    <button
                      className="text-red-500 hover:text-red-700 transition-all"
                      onClick={() => removeTask(index)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-3">No tasks added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
