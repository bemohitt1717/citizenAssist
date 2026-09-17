import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../ui/Icon/Icon";
import ConfirmDialog from "../../ui/ConfirmDialog/ConfirmDialog";
import { useAuth } from "../../../context/useAuth";
import "./UserMenu.css";

/**
 * The identity chip and its menu.
 *
 * Opens on hover for a mouse and on click for everything else. A click pins it
 * open so it stays usable from a keyboard or a touchscreen, where "hover" either
 * does not exist or never ends — a menu that vanished on mouse-out would be
 * unusable for both.
 *
 * Signing out goes through a confirmation, because it is the one item here that
 * throws away what you were doing.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.roleLabel
 * @param {string} props.profileTo  Route of this role's profile section.
 */
const UserMenu = ({ name, roleLabel, profileTo }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const wrapRef = useRef(null);

  // A click anywhere else closes and unpins.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onDocumentDown = (event) => {
      if (wrapRef.current?.contains(event.target)) return;
      setIsOpen(false);
      setIsPinned(false);
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      setIsPinned(false);
    };

    document.addEventListener("mousedown", onDocumentDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocumentDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const safeName = typeof name === "string" && name.trim() ? name.trim() : "User";
  const initials = safeName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "U";

  const signOut = () => {
    logout();
    setIsConfirming(false);
    navigate("/login");
  };

  return (
    <>
      <div
        className={`ca-usermenu ${isOpen ? "is-open" : ""}`.trim()}
        ref={wrapRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          if (!isPinned) setIsOpen(false);
        }}
      >
        <button
          type="button"
          className="ca-usermenu__chip"
          onClick={() => {
            setIsPinned((pinned) => !pinned);
            setIsOpen((open) => !isPinned || !open);
          }}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <span className="ca-usermenu__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="ca-usermenu__name">{safeName}</span>
          <Icon name="arrowDown" size={15} className="ca-usermenu__caret" />
        </button>

        {isOpen && (
          <div className="ca-usermenu__panel" role="menu">
            <div className="ca-usermenu__who">
              <span className="ca-usermenu__who-name">{safeName}</span>
              <span className="ca-usermenu__who-role">{roleLabel}</span>
            </div>

            <Link
              className="ca-usermenu__item"
              to={profileTo}
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsPinned(false);
              }}
            >
              <Icon name="shieldCheck" size={16} />
              Dashboard
            </Link>

            <button
              type="button"
              className="ca-usermenu__item ca-usermenu__item--out"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsPinned(false);
                setIsConfirming(true);
              }}
            >
              <Icon name="arrowRight" size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>

      {isConfirming && (
        <ConfirmDialog
          destructive
          icon="shieldCheck"
          title="Sign out of Citizen Assist?"
          text={`You will be returned to the sign-in screen and will need your code again to get back into the ${roleLabel.toLowerCase()} dashboard.`}
          confirmLabel="Sign out"
          onConfirm={signOut}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </>
  );
};

export default UserMenu;
