import './Logo.css';

/**
 * Citizen Assist mark — a perforated seal ring with a check inside.
 * The seal is the object a citizen actually waits for at the end of the
 * process; the perforation keeps it reading as a stamp rather than a
 * generic circle-tick. Drawn, not borrowed.
 *
 * @param {object} props
 * @param {boolean} [props.showWordmark]  Render the "Citizen Assist" lockup.
 * @param {number}  [props.size]          Mark size in px. Default 30.
 * @param {string}  [props.className]
 */
const Logo = ({ showWordmark = true, size = 30, className = '' }) => (
  <span className={`ca-logo ${className}`.trim()}>
    <svg
      className="ca-logo__mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={showWordmark ? undefined : 'Citizen Assist'}
      aria-hidden={showWordmark ? 'true' : undefined}
      focusable="false"
    >
      {/* Outer seal edge */}
      <circle cx="16" cy="16" r="14.1" stroke="currentColor" strokeWidth="1.7" />
      {/* Perforated inner ring — the stamp tell */}
      <circle
        className="ca-logo__ring"
        cx="16"
        cy="16"
        r="10.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1.4 3.5"
        opacity="0.55"
      />
      {/* Approval */}
      <path
        d="M11.1 16.35 14.55 19.8 21.1 12.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {showWordmark && (
      <span className="ca-logo__wordmark">
        Citizen<span className="ca-logo__wordmark-tail">Assist</span>
      </span>
    )}
  </span>
);

export default Logo;
