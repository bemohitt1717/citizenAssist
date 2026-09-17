import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const HOME_BY_ROLE = {
  citizen: "/track",
  agent: "/agent/dashboard",
  admin: "/admin/dashboard",
};

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] ?? "/"} replace />;
  }

  return children;
};
