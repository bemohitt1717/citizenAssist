import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Logo from "../components/common/Logo/Logo";
import Icon from "../components/ui/Icon/Icon";
import LoginForm from "../features/auth/components/LoginForm/LoginForm";
import LoginShowcase from "../features/auth/components/LoginShowcase/LoginShowcase";
import RoleChooser from "../features/auth/components/RoleChooser/RoleChooser";
import { getRole } from "../constants/roles";
import { GOOGLE_CLIENT_ID } from "../config/google";
import "./Login.css";

/**
 * Sign in.
 *
 * Two halves: the form on the left, a rotating panel on the right. No navbar or
 * footer — an auth screen with a full site header invites wandering off mid
 * sign-in, so the only ways out are the mark and the back link.
 *
 * Asks for the role first. That choice only changes the wording and which
 * dashboard the session lands on: all three roles use the same mobile-and-PIN or
 * Google account, against the same endpoints. Signing in or signing up is chosen
 * inside the form, not here — the role is the same either way.
 */
const Login = () => {
  const location = useLocation();
  const requestedRoleId =
    location.state && typeof location.state === "object"
      ? location.state.roleId
      : null;

  // null until a role is picked, which is what shows the chooser.
  const [roleId, setRoleId] = useState(() => {
    if (!requestedRoleId || !getRole(requestedRoleId)?.id) {
      return null;
    }

    return getRole(requestedRoleId).id === requestedRoleId
      ? requestedRoleId
      : null;
  });
  const role = roleId ? getRole(roleId) : null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="ca-login">
        <div className="ca-login__bar">
          <Link to="/" aria-label="Citizen Assist, home">
            <Logo size={28} />
          </Link>

          <Link className="ca-login__back" to="/">
            <Icon name="arrowRight" size={15} />
            Back to site
          </Link>
        </div>

        <div className="ca-login__grid">
          <div className="ca-login__pane">
            {role ? (
              <LoginForm role={role} onChangeRole={() => setRoleId(null)} />
            ) : (
              <RoleChooser onPick={setRoleId} />
            )}
          </div>

          <LoginShowcase />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
