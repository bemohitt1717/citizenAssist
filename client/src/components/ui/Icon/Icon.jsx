/**
 * Citizen Assist icon set — authored paths, one 24x24 grid, one 1.6 stroke
 * weight, round caps and joins throughout. Everything inherits currentColor
 * so an icon always matches the text it sits beside.
 *
 * Never substitute an emoji or a unicode glyph for one of these.
 */

const PATHS = {
  phone: (
    <path d="M6.6 3.5h2.2l1.4 3.5-1.9 1.4a10.6 10.6 0 0 0 5.3 5.3l1.4-1.9 3.5 1.4v2.2a2.1 2.1 0 0 1-2.3 2.1A14.9 14.9 0 0 1 4.5 5.8 2.1 2.1 0 0 1 6.6 3.5Z" />
  ),
  arrowUpRight: (
    <>
      <path d="M8 16 16 8" />
      <path d="M9.5 8H16v6.5" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 5.5v13" />
      <path d="M6.75 13.25 12 18.5l5.25-5.25" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h13" />
      <path d="M12.5 6.5 18 12l-5.5 5.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 8h16" />
      <path d="M4 14h11" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  check: <path d="M5 12.5 9.75 17 19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.6V12l3 1.9" />
    </>
  ),
  /* Google's mark is NOT here on purpose. It is filled, multi-colour and
     trademarked, so it cannot inherit this set's stroke and currentColor.
     Use <GoogleMark /> instead. */
  phoneDevice: (
    <>
      <rect x="6.6" y="2.9" width="10.8" height="18.2" rx="2.4" />
      <path d="M10.6 5.6h2.8" />
      <path d="M12 18.1h.01" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.4 12a7.4 7.4 0 1 1-2.3-5.35" />
      <path d="M19.6 4.6v3.9h-3.9" />
    </>
  ),
  /* Application tracking: a three-stop progress rail, two stops cleared and
     the last one still open. Citizen-facing status, not an admin glyph. */
  track: (
    <>
      <path d="M4.5 12h11.9" />
      <circle cx="4.9" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="11.7" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="18.9" cy="12" r="2.4" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3.25 19 6v5.4c0 4-2.8 7.4-7 9.35-4.2-1.95-7-5.35-7-9.35V6l7-2.75Z" />
      <path d="M8.9 11.9 11.3 14.3 15.4 10" />
    </>
  ),
  document: (
    <>
      <path d="M13.5 3.5H7.2A1.7 1.7 0 0 0 5.5 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V8.5l-5-5Z" />
      <path d="M13.5 3.5v5h5" />
    </>
  ),

  /* ---- Service marks -------------------------------------------------
     One page-or-card silhouette per family so the six read as a set, with
     a single distinguishing element inside each. Legible down to 20px. */

  /* Income: a page with a rising step figure. */
  income: (
    <>
      <path d="M5.75 4.4h12.5v15.2H5.75z" />
      <path d="M8.6 15.9v-2.6" />
      <path d="M12 15.9v-5.1" />
      <path d="M15.4 15.9V8.4" />
    </>
  ),

  /* Caste: a page carrying an attesting seal. */
  caste: (
    <>
      <path d="M5.75 4.4h12.5v15.2H5.75z" />
      <path d="M8.6 8.1h6.8" />
      <path d="M8.6 11.1h3.5" />
      <circle cx="14.9" cy="15.1" r="2.5" />
    </>
  ),

  /* Domicile: a roof over an address block. */
  domicile: (
    <>
      <path d="M4.4 10.6 12 4.4l7.6 6.2" />
      <path d="M6.5 12v7.6h11V12" />
      <path d="M9.4 15.4h5.2" />
      <path d="M9.4 18h3" />
    </>
  ),

  /* Birth: a page with a rosette — the record, awarded. */
  birth: (
    <>
      <path d="M5.75 4.4h12.5v15.2H5.75z" />
      <path d="M8.6 8h6.8" />
      <circle cx="12" cy="13.4" r="2.3" />
      <path d="M10.6 15.4 9.9 17.9l2.1-1.1 2.1 1.1-.7-2.5" />
    </>
  ),

  /* PAN: a card with a portrait panel. */
  pan: (
    <>
      <path d="M3.6 6.1h16.8v11.8H3.6z" />
      <path d="M6.6 9.1h3.6v5.1H6.6z" />
      <path d="M13.1 9.9h4.3" />
      <path d="M13.1 12.6h4.3" />
      <path d="M13.1 15.1h2.6" />
    </>
  ),

  /* Aadhaar: a card with a biometric arc set. */
  aadhaar: (
    <>
      <path d="M3.6 6.1h16.8v11.8H3.6z" />
      <path d="M9.1 15.6a4.1 4.1 0 0 1 0-7.2" />
      <path d="M12 14.4a2.7 2.7 0 0 1 0-4.8" />
      <path d="M15 16.4a5.6 5.6 0 0 0 0-8.8" />
    </>
  ),
};

/**
 * @param {object} props
 * @param {keyof typeof PATHS} props.name
 * @param {number} [props.size]     Rendered square size in px. Default 20.
 * @param {string} [props.className]
 * @param {string} [props.title]    Supply only for a standalone, meaningful
 *                                  icon. Omit when adjacent text already
 *                                  names the action, so it stays decorative.
 */
const Icon = ({ name, size = 20, className = '', title, ...rest }) => {
  const path = PATHS[name];

  if (!path) {
    if (import.meta.env.DEV) {
      console.warn(`<Icon> has no path named "${name}".`);
    }
    return null;
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  );
};

export default Icon;
