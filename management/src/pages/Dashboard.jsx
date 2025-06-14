import { useEffect, useState } from "react";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [sentimentSummary, setSentimentSummary] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  useEffect(() => {
    // Fetch Bookings Data
    fetch("/data/bookings.json")
      .then((res) => res.json())
      .then((data) => setBookings(data));

    // Fetch Staff Data
    fetch("/data/staff.json")
      .then((res) => res.json())
      .then((data) => setStaff(data));

    // Fetch Sentiment Analysis Summary (Dummy Stats)
    setSentimentSummary({
      positive: 70,
      neutral: 20,
      negative: 10,
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Bookings Summary */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Bookings</h2>
          <p className="text-3xl">{bookings.length}</p>
        </div>

        {/* Staff Summary */}
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Staff</h2>
          <p className="text-3xl">{staff.length}</p>
        </div>

        {/* Sentiment Analysis Summary */}
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Review Sentiment</h2>
          <p className="text-lg">Positive: {sentimentSummary.positive}%</p>
          <p className="text-lg">Neutral: {sentimentSummary.neutral}%</p>
          <p className="text-lg">Negative: {sentimentSummary.negative}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
