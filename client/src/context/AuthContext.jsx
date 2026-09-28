import { useEffect, useState } from "react";
import { getMe } from "../features/auth/authApi";
import { getToken, removeToken, setToken } from "../utils/storage";
import AuthContext from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getMe();
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          removeToken();
        } else {
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (token, loggedInUser) => {
    setToken(token);
    setUser(loggedInUser);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
