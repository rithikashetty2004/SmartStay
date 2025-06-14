import { useEffect, useState } from "react";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");

  useEffect(() => {
    fetch("/data/staff.json")
      .then((res) => res.json())
      .then((staffData) => {
        fetch("http://127.0.0.1:8000/attendance/")
          .then((res) => res.json())
          .then((attendanceData) => {
            console.log("Attendance API Response:", attendanceData);
            console.log("Staff Data:", staffData);

            if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
              console.error("Attendance API returned empty or invalid data:", attendanceData);
              return;
            }

            const formatDate = (timestamp) => timestamp.split(" ")[0];
            const allDates = new Set(
              attendanceData.map((record) => formatDate(record.timestamp))
            );

            const updatedStaff = staffData.map((employee) => {
              if (!employee.name) {
                console.warn(`Missing name for staff:`, employee);
                return { ...employee, presentees: 0, absentees: allDates.size };
              }

              const employeeRecords = attendanceData.filter(
                (record) => record.name.trim().toLowerCase() === employee.name.trim().toLowerCase()
              );

              const presentDays = new Set(employeeRecords.map((rec) => formatDate(rec.timestamp)));

              console.log(`Attendance for ${employee.name}:`, presentDays);

              return {
                ...employee,
                presentees: presentDays.size,
                absentees: allDates.size - presentDays.size,
              };
            });

            console.log("Updated Staff Data:", updatedStaff);
            setStaff(updatedStaff);
          })
          .catch((error) => console.error("Error fetching attendance data:", error));
      })
      .catch((error) => console.error("Error fetching staff data:", error));
  }, []);

  // Function to start attendance recognition
  const takeAttendance = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/start-recognition/", {
        method: "POST",
      });
      if (response.ok) {
        alert("Attendance process started successfully!");
      } else {
        alert("Failed to start attendance process.");
      }
    } catch (error) {
      console.error("Error starting attendance process:", error);
    }
  };

  // Function to capture face for a staff member
  const captureFace = async () => {
    if (!newStaffName.trim()) {
      alert("Please enter a valid staff name.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/add-face/${newStaffName.trim()}/`, {
        method: "POST",
      });
      if (response.ok) {
        alert(`Face captured for ${newStaffName}!`);
        setShowModal(false);
        setNewStaffName(""); // Reset input
      } else {
        alert("Failed to capture face.");
      }
    } catch (error) {
      console.error("Error capturing face:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Staff Management</h1>

      {/* Buttons for Attendance and Adding Staff */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={takeAttendance}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Take Attendance
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Presentees</th>
            <th className="p-3">Absentees</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((employee, index) => (
            <tr key={index} className="border-b">
              <td className="p-3">{employee.name}</td>
              <td className="p-3">{employee.email || "N/A"}</td>
              <td className="p-3">{employee.presentees}</td>
              <td className="p-3">{employee.absentees}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add Staff</h2>
            <input
              type="text"
              placeholder="Enter Staff Name"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={captureFace}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Face
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
