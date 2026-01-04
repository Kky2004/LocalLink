import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { authService } = await import("../Service/authService");
      const response = await authService.login({ email, password });
      setUser(response.user);
      setToken(response.token);

       localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { authService } = await import("../Service/authService");

      const userTypeUpper = (userData.userType || "consumer").toUpperCase();

      const response = await authService.register({
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password,
        phone: userData.phone || "",
        userType: userTypeUpper,
        address: userData.location?.address || "",
        city: userData.location?.city || "",
        state: userData.location?.state || "",
        zipCode: userData.location?.zipCode || "",
      });

      setUser(response.user);
      setToken(response.token);

       localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const { authService } = await import("../Service/authService");
    authService.logout();
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
