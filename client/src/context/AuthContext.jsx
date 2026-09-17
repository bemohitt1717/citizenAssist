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
        console.info("[auth debug] session restore: no token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getMe();
        setUser(response.data.user);
        console.info("[auth debug] session restored", {
          role: response.data.user.role,
        });
      } catch (error) {
        if (error.response?.status === 401) {
          removeToken();
          console.info(
            "[auth debug] session expired or rejected: token removed",
          );
        } else {
          console.info(
            "[auth debug] session restore failed",
            error.response?.status,
          );
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
    console.info("[auth debug] session stored", { role: loggedInUser.role });
  };

  const logout = () => {
    removeToken();
    setUser(null);
    console.info("[auth debug] session cleared");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
