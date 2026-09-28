export const COOKIE_CONSENT_KEY = "citizenAssistCookieConsent";
export const COOKIE_PREFERENCES_EVENT = "citizenAssist:open-cookie-preferences";

export const openCookiePreferences = () => {
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
};