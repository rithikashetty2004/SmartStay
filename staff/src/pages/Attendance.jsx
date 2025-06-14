import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Adjust path as needed

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const loggedInUser = user?.name || ""; // Get name dynamically

  const [presentDays, setPresentDays] = useState(new Set());
  const [absentDays, setAbsentDays] = useState(new Set());

  useEffect(() => {
    if (!loggedInUser) return; // Prevent fetching if user is not logged in

    axios
      .get("http://127.0.0.1:8000/attendance/")
      .then((response) => {
        const data = response.data;
        if (!data || !Array.isArray(data)) {
          console.error("Invalid API response:", data);
          return;
        }

        console.log("Fetched Attendance Data:", data); // Debugging

        // Filter attendance only for the logged-in user
        const userAttendance = data
          .filter(
            (entry) =>
              entry.name.trim().toLowerCase() === loggedInUser.trim().toLowerCase()
          )
          .map((entry) => entry.timestamp.split(" ")[0].trim()); // Extract "YYYY-MM-DD"

        console.log("User Attendance Dates:", userAttendance); // Debugging

        // Set of present days
        const presentSet = new Set(userAttendance);

        // Generate all days for the current month
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Set(
          Array.from({ length: today.getDate() }, (_, i) => {
            return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
              i + 1
            ).padStart(2, "0")}`;
          })
        );

        // Identify absent days
        const absentSet = new Set([...daysInMonth].filter((day) => !presentSet.has(day)));

        setPresentDays(presentSet);
        setAbsentDays(absentSet);
      })
      .catch((error) => console.error("Error fetching attendance:", error));
  }, [loggedInUser]); // Dependency on user name

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-lg transition hover:shadow-2xl">
      <h1 className="text-2xl font-bold text-center mb-6">📅 Attendance - {loggedInUser || "Guest"}</h1>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center bg-gray-100 p-4 rounded-lg shadow-md">
        {Array.from({ length: new Date().getDate() }, (_, i) => {
          const date = `2025-01-${String(i + 1).padStart(2, "0")}`;
          return (
            <div
              key={date}
              className={`p-4 rounded-lg shadow-md text-lg font-semibold transition ${
                presentDays.has(date)
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* Attendance Summary */}
      {/* <div className="mt-6 flex justify-around text-lg">
        <div className="flex items-center gap-2">
          <span className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold">Present</span>
          <span className="text-gray-800 font-semibold text-xl">{presentDays.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold">Absent</span>
          <span className="text-gray-800 font-semibold text-xl">{absentDays.size}</span>
        </div>
      </div> */}
    </div>
  );
};

export default Attendance;
