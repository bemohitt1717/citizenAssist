import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_PREFERENCES_EVENT,
} from "../../../utils/cookieConsent";
import "./CookieConsent.css";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      setIsVisible(!window.localStorage.getItem(COOKIE_CONSENT_KEY));
    } catch {
      setIsVisible(true);
    }

    const showPreferences = () => setIsVisible(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, showPreferences);

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, showPreferences);
    };
  }, []);

  const saveChoice = (optionalCookies) => {
    try {
      window.localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({ essential: true, optional: optionalCookies }),
      );
    } finally {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <section className="ca-cookie-consent" aria-label="Cookie consent">
      <div className="ca-cookie-consent__copy">
        <h2>Cookie preferences</h2>
        <p>
          Essential browser storage keeps sign-in working. Choose whether to allow optional
          cookies too. <Link to="/cookie-policy">Read the Cookie Policy</Link>.
        </p>
      </div>
      <div className="ca-cookie-consent__actions">
        <button
          className="ca-cookie-consent__button ca-cookie-consent__button--quiet"
          type="button"
          onClick={() => saveChoice(false)}
        >
          Essential only
        </button>
        <button
          className="ca-cookie-consent__button ca-cookie-consent__button--primary"
          type="button"
          onClick={() => saveChoice(true)}
        >
          Accept all
        </button>
      </div>
    </section>
  );
};

export default CookieConsent;