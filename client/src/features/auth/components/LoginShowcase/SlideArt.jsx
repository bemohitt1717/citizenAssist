/**
 * The three drawings that rotate beside the sign-in form.
 *
 * Drawn here rather than sourced as stock vectors: stock illustration licences
 * do not cover redistribution inside a repository, and a bought vector would
 * arrive in someone else's palette and line weight.
 *
 * COLOUR
 * These use the four-hue illustration palette declared on `.ca-showcase` in
 * LoginShowcase.css. Those tokens are scoped to that panel on purpose, so this
 * is the one place in the product with four colours and the interface keeps its
 * two-primary discipline everywhere else.
 *
 * Status is never carried by colour alone — a cleared checkbox is filled and
 * ticked, an open one is outlined and empty, so the difference survives both
 * greyscale and colour-blind vision.
 *
 * This file exports components only, so Fast Refresh keeps working on it and on
 * LoginShowcase, which holds the slide data. Every scene draws on 300x240.
 */

/* Cycled through the cleared checklist rows. */
const ROW_HUES = ['ca-art-blue', 'ca-art-green', 'ca-art-red', 'ca-art-blue'];

/* 1 — Requirements listed before you begin. */
export const RequirementsArt = () => (
  <svg viewBox="0 0 300 240" className="ca-slide__art" role="presentation">
    {/* A second sheet behind, tilted, so it reads as a set of papers */}
    <rect
      x="188"
      y="50"
      width="60"
      height="138"
      rx="11"
      className="ca-art-amber-soft"
      transform="rotate(8 218 119)"
    />

    {/* Front sheet with a blue header band */}
    <rect x="50" y="22" width="148" height="196" rx="14" className="ca-art-paper" />
    <path
      d="M50 36a14 14 0 0 1 14-14h120a14 14 0 0 1 14 14v20H50Z"
      className="ca-art-blue"
    />
    <rect x="68" y="33" width="58" height="8" rx="4" className="ca-art-on-blue" />
    <circle cx="180" cy="37" r="5.5" className="ca-art-amber" />

    {/* Checklist. Four cleared and filled, the fifth outlined and empty. */}
    {[0, 1, 2, 3, 4].map((row) => {
      const isOpen = row === 4;

      return (
        <g key={row} transform={`translate(70 ${76 + row * 25})`}>
          <rect
            x="0"
            y="0"
            width="17"
            height="17"
            rx="5.5"
            className={isOpen ? 'ca-art-amber-open' : ROW_HUES[row]}
          />
          {!isOpen && <path d="M4.6 8.7 7.6 11.7 12.8 5.4" className="ca-art-tick" />}
          <rect
            x="27"
            y="5"
            width={86 - row * 11}
            height="7"
            rx="3.5"
            className="ca-art-line"
          />
        </g>
      );
    })}

    {/* Charge line at the foot */}
    <path d="M70 196h108" className="ca-art-hairline" />
    <rect x="70" y="204" width="48" height="8" rx="4" className="ca-art-green" />
    <rect x="140" y="204" width="38" height="8" rx="4" className="ca-art-line" />
  </svg>
);

/* 2 — A verified person on the file. */
export const VerifiedAgentArt = () => (
  <svg viewBox="0 0 300 240" className="ca-slide__art" role="presentation">
    {/* Seal rings behind the figure */}
    <circle cx="150" cy="110" r="86" className="ca-art-blue-soft" />
    <circle cx="150" cy="110" r="68" className="ca-art-ring-dashed" />

    {/* Figure */}
    <circle cx="150" cy="88" r="31" className="ca-art-blue" />
    <path d="M94 176c6-35 27-54 56-54s50 19 56 54Z" className="ca-art-blue" />
    {/* Collar, so the silhouette is not one flat mass */}
    <path d="M132 126c5.5 9 12.5 13 18 13s12.5-4 18-13" className="ca-art-collar" />

    {/* Verification badge, green */}
    <circle cx="209" cy="156" r="27" className="ca-art-paper" />
    <circle cx="209" cy="156" r="22" className="ca-art-green" />
    <path
      d="M198.6 156.8 206 164.4 220 147.6"
      className="ca-art-tick"
      strokeWidth="3.4"
    />

    {/* Ground */}
    <rect x="100" y="200" width="100" height="8" rx="4" className="ca-art-line" />
    <rect x="126" y="216" width="48" height="7" rx="3.5" className="ca-art-red" />
  </svg>
);

/* 3 — Status you can follow to the counter. */
export const TrackingArt = () => (
  <svg viewBox="0 0 300 240" className="ca-slide__art" role="presentation">
    {/* Rail, with the cleared portion laid over it */}
    <path d="M62 134h176" className="ca-art-rail" />
    <path d="M62 134h88" className="ca-art-rail-done" />

    {/* Two stops cleared — filled and ticked */}
    <g>
      <circle cx="62" cy="134" r="18" className="ca-art-blue" />
      <path d="M54.6 134.6 60.4 140.4 70.4 128" className="ca-art-tick" />
    </g>
    <g>
      <circle cx="150" cy="134" r="18" className="ca-art-green" />
      <path d="M142.6 134.6 148.4 140.4 158.4 128" className="ca-art-tick" />
    </g>

    {/* One still running — outlined and open */}
    <circle cx="238" cy="134" r="20" className="ca-art-paper" />
    <circle cx="238" cy="134" r="20" className="ca-art-amber-ring" />
    <circle cx="238" cy="134" r="7" className="ca-art-amber" />

    {/* Stop labels */}
    <rect x="44" y="166" width="38" height="7" rx="3.5" className="ca-art-line" />
    <rect x="132" y="166" width="38" height="7" rx="3.5" className="ca-art-line" />
    <rect x="216" y="166" width="44" height="7" rx="3.5" className="ca-art-amber" />

    {/* The file being carried along the rail */}
    <rect x="102" y="26" width="94" height="68" rx="12" className="ca-art-paper" />
    <path
      d="M102 38a12 12 0 0 1 12-12h70a12 12 0 0 1 12 12v8h-94Z"
      className="ca-art-red"
    />
    <rect x="116" y="58" width="46" height="7" rx="3.5" className="ca-art-blue" />
    <rect x="116" y="71" width="62" height="6" rx="3" className="ca-art-line" />
    <rect x="116" y="82" width="34" height="6" rx="3" className="ca-art-line" />

    {/* Connector from the file down to the live stop */}
    <path d="M196 78c26 6 40 24 42 36" className="ca-art-connector" />
  </svg>
);
