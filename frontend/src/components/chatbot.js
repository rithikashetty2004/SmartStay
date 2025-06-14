import React, { useState, useRef, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = { role: "user", content: input };
      setChat((prevChat) => [...prevChat, userMessage]);
      setInput("");
      generateBotResponse(input);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const generateBotResponse = async (userInput) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();

      if (data.policy) {
        const formattedResponse = formatResponse(data.policy);
        const botMessage = { role: "bot", content: formattedResponse };
        setChat((prevChat) => [...prevChat, botMessage]);
      } else if (data.error) {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
    }
  };

  const formatResponse = (response) => {
    return response
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
      .replace(/(\d+\.)/g, "<br><strong>$1</strong>") // Numbered list
      .replace(/\n/g, "<br>"); // New lines
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition focus:outline-none absolute bottom-0 right-0"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal (Above Chat Icon) */}
      {isOpen && (
        <div className="w-80 h-[450px] bg-white shadow-lg rounded-lg p-4 mb-16 border border-gray-300 flex flex-col absolute bottom-14 right-0">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              AI Assistant
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pb-3 px-2">
            {chat.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs text-sm ${
                    message.role === "user"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                  dangerouslySetInnerHTML={{ __html: message.content }} // Proper formatting applied here
                />
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center border-t pt-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask your queries here..."
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
