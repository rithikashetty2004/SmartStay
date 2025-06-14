import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Persistent login check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch("/data/staff.json");
      const staff = await response.json();

      console.log("Fetched Staff Data:", staff); // Debugging

      const foundUser = staff.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser)); // Store user for persistence
        console.log("Login Successful:", foundUser); // Debugging
        return true;
      } else {
        console.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
