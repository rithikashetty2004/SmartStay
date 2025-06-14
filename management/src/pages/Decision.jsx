import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini AI SDK

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(""); // Replace with your actual API key

const Decision = () => {
  const [datasets, setDatasets] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const files = [
    "Hotel_Historic_Dataset.csv",
    "Updated_Hotel_Activities_Dataset.csv",
    "Updated_Hotel_List.csv",
    "staff.json",
    "inventory.json",
  ];

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const filePromises = files.map(async (file) => {
        if (file.endsWith(".csv")) {
          return { [file]: await d3.csv(`/data/${file}`) };
        } else {
          const response = await fetch(`/data/${file}`);
          return { [file]: await response.json() };
        }
      });

      const loadedDataArray = await Promise.all(filePromises);
      const loadedData = Object.assign({}, ...loadedDataArray);
      setDatasets(loadedData);
    } catch (error) {
      console.error("Error loading datasets:", error);
    }
  };

  const generateMarketingInsights = async () => {
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Construct prompt
      const prompt = `Analyze these datasets and provide AI-powered targeted marketing strategies to increase occupancy and revenue:

      - Hotel Historic Dataset: ${JSON.stringify(datasets["Hotel_Historic_Dataset.csv"]?.slice(0, 10))}
      - Activities Dataset: ${JSON.stringify(datasets["Updated_Hotel_Activities_Dataset.csv"]?.slice(0, 10))}
      - Hotel List: ${JSON.stringify(datasets["Updated_Hotel_List.csv"]?.slice(0, 10))}
      - Staff Details: ${JSON.stringify(datasets["staff.json"]?.slice(0, 10))}
      - Inventory Details: ${JSON.stringify(datasets["inventory.json"]?.slice(0, 10))}

      Format the response using proper HTML with headings (<h3>), bullet points (<ul><li>), and bold text (<b>) for readability.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      setAiResponse(text);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setAiResponse("Error occurred while generating insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        ✨ AI-Powered Hotel Marketing Insights ✨
      </h1>
      <p className="text-gray-700 mb-4">
        Analyze hotel occupancy, staff, and inventory data to optimize marketing strategies.
      </p>

      <button
        onClick={generateMarketingInsights}
        className={`bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Analyzing...</span>
          </div>
        ) : (
          "Generate Marketing Insights"
        )}
      </button>

      {aiResponse && (
        <div className="mt-6 p-5 bg-gray-100 border-l-4 border-blue-500 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            📊 AI-Generated Insights
          </h2>
          <div
            className="whitespace-pre-wrap text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: aiResponse }}
          />
        </div>
      )}
    </div>
  );
};

export default Decision;
