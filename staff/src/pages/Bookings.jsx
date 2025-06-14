import { useState, useEffect } from "react";
import axios from "axios";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Load bookings data (Assuming it's stored in a JSON file)
    fetch("/data/bookings.json")
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error loading bookings:", err));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setUploadedFile(file);
      setError("");
    } else {
      setError("Invalid file format. Upload PNG, JPG, or JPEG.");
    }
  };

  const handleOCRUpload = async () => {
    if (!uploadedFile) {
      setError("Please upload an Aadhaar image first.");
      return;
    }

    setError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/extract-aadhar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.status === "success") {
        setOcrData(response.data.data);
        checkBooking(response.data.data.aadhar_number);
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setError("Failed to extract Aadhaar details. Try again.");
    }
  };

  const checkBooking = (aadharNumber) => {
    const matchingBooking = bookings.find(
      (booking) => booking.aadhaarNumber === aadharNumber
    );

    if (matchingBooking) {
      const updatedBookings = bookings.map((booking) =>
        booking.aadhaarNumber === aadharNumber
          ? { ...booking, checked_in: true, roomNumber: generateRoomNumber() }
          : booking
      );

      setBookings(updatedBookings);
      setSuccessMessage(`Check-in successful! Room assigned: ${updatedBookings.find(b => b.aadhaarNumber === aadharNumber).roomNumber}`);
    } else {
      setError("No booking found for this Aadhaar number.");
    }
  };

  const generateRoomNumber = () => {
    return Math.floor(100 + Math.random() * 900); // Generates a 3-digit room number
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Booking Management</h2>

      {/* Aadhar Upload */}
      <div className="flex flex-col items-center bg-gray-100 p-4 rounded mb-6">
        <label className="font-semibold mb-2">Upload Aadhaar Image:</label>
        <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
        {uploadedFile && <p className="text-green-500 mt-2">{uploadedFile.name} selected</p>}
        <button
          onClick={handleOCRUpload}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Extract Aadhaar Details
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      </div>

      {/* OCR Result */}
      {ocrData && (
        <div className="bg-white p-4 shadow rounded mb-6">
          <h3 className="text-lg font-semibold">Extracted Aadhaar Details</h3>
          <p><strong>Name:</strong> {ocrData.name}</p>
          <p><strong>Aadhaar Number:</strong> {ocrData.aadhar_number}</p>
          <p><strong>Gender:</strong> {ocrData.gender}</p>
          <p><strong>DOB:</strong> {ocrData.dob}</p>
        </div>
      )}

      {/* Bookings Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Name</th>
              <th className="p-2">Aadhaar Number</th>
              <th className="p-2">Check-in Date</th>
              <th className="p-2">Room Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Room Number</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{booking.clientName}</td>
                <td className="p-2">{booking.aadhaarNumber}</td>
                <td className="p-2">{booking.checkInDate}</td>
                <td className="p-2">{booking.roomType}</td>
                <td className={`p-2 font-semibold ${booking.checked_in ? "text-green-500" : "text-red-500"}`}>
                  {booking.checked_in ? "Checked-In" : "Pending"}
                </td>
                <td className="p-2">{booking.checked_in ? booking.roomNumber : "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingPage;
