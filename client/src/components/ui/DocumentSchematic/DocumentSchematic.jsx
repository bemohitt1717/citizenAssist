import './DocumentSchematic.css';

/**
 * Abstract layout diagrams for the document types a citizen has to gather.
 *
 * These are schematics on purpose — see the header of constants/documents.js
 * for why photographs of real certificates are not used. Each one shows the
 * shape of the document and where its important fields sit, so a citizen can
 * recognise the right piece of paper without us reproducing anyone's data or
 * anyone's artwork.
 *
 * Drawn on a 200x140 landscape or 160x210 portrait field, one stroke language
 * throughout, inheriting the surrounding ink.
 */

const Emblem = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} opacity="0.75">
    <circle cx="0" cy="0" r="5.4" className="ds-fill-soft" />
    <path d="M-2.6 2.4h5.2" className="ds-stroke" strokeWidth="1.2" />
  </g>
);

/* Landscape plastic card: Aadhaar, PAN, a parent's ID. */
const IdCard = () => (
  <svg viewBox="0 0 200 140" className="ds-svg" role="presentation">
    <rect x="4" y="4" width="192" height="132" rx="12" className="ds-card" />

    {/* Header band */}
    <rect x="4" y="4" width="192" height="26" rx="12" className="ds-band" />
    <Emblem x={22} y={17} />
    <rect x="36" y="12" width="62" height="5" rx="2.5" className="ds-fill-band" />
    <rect x="36" y="21" width="44" height="4" rx="2" className="ds-fill-band-soft" />

    {/* Photograph */}
    <rect x="18" y="42" width="42" height="52" rx="5" className="ds-slot" />
    <circle cx="39" cy="60" r="9" className="ds-fill-soft" />
    <path d="M25 88c2.6-9 7.8-13.4 14-13.4S51 79 53.6 88Z" className="ds-fill-soft" />

    {/* Field lines */}
    <rect x="70" y="44" width="52" height="4.5" rx="2.25" className="ds-fill-soft" />
    <rect x="70" y="55" width="76" height="6" rx="3" className="ds-fill-strong" />
    <rect x="70" y="68" width="40" height="4.5" rx="2.25" className="ds-fill-soft" />
    <rect x="70" y="79" width="60" height="5" rx="2.5" className="ds-fill" />

    {/* Machine-readable block */}
    <rect x="150" y="42" width="32" height="32" rx="4" className="ds-slot" />
    <g className="ds-fill-soft">
      {Array.from({ length: 16 }, (_, index) => (
        <rect
          key={index}
          x={154 + (index % 4) * 7}
          y={46 + Math.floor(index / 4) * 7}
          width="4.5"
          height="4.5"
          rx="1"
          opacity={index % 3 === 0 ? 0.35 : 0.85}
        />
      ))}
    </g>

    {/* The number, called out — the field an office asks for first */}
    <rect x="18" y="106" width="96" height="9" rx="4.5" className="ds-fill-accent" />
    <path d="M18 122h164" className="ds-stroke-soft" />
  </svg>
);

/* Portrait certificate: caste record, land extract, school leaving. */
const Certificate = () => (
  <svg viewBox="0 0 160 210" className="ds-svg" role="presentation">
    <rect x="4" y="4" width="152" height="202" rx="8" className="ds-card" />
    <rect x="12" y="12" width="136" height="186" rx="4" className="ds-frame" />

    <Emblem x={80} y={32} />

    {/* Title band */}
    <rect x="38" y="46" width="84" height="10" rx="3" className="ds-fill-strong" />
    <rect x="52" y="61" width="56" height="4.5" rx="2.25" className="ds-fill-soft" />

    {/* Body lines */}
    <g className="ds-fill-soft">
      <rect x="26" y="82" width="108" height="4" rx="2" />
      <rect x="26" y="93" width="108" height="4" rx="2" />
      <rect x="26" y="104" width="86" height="4" rx="2" />
      <rect x="26" y="115" width="98" height="4" rx="2" />
    </g>

    {/* Named subject field — the line that must match your other papers */}
    <rect x="26" y="132" width="72" height="7" rx="3.5" className="ds-fill-accent" />

    {/* Seal and signature */}
    <circle cx="46" cy="170" r="17" className="ds-stroke" strokeWidth="1.6" fill="none" />
    <circle
      cx="46"
      cy="170"
      r="12"
      className="ds-stroke"
      strokeWidth="1.2"
      strokeDasharray="1.6 3.4"
      fill="none"
      opacity="0.6"
    />
    <rect x="86" y="176" width="48" height="4" rx="2" className="ds-fill" />
    <rect x="92" y="186" width="36" height="3.5" rx="1.75" className="ds-fill-soft" />
  </svg>
);

/* Multi-page booklet: ration card, family register, utility record. */
const Booklet = () => (
  <svg viewBox="0 0 200 140" className="ds-svg" role="presentation">
    {/* Pages behind, so it reads as a booklet rather than a sheet */}
    <rect x="14" y="12" width="176" height="118" rx="9" className="ds-card-back" />
    <rect x="9" y="8" width="176" height="122" rx="9" className="ds-card-back" opacity="0.55" />
    <rect x="4" y="4" width="176" height="126" rx="9" className="ds-card" />

    <Emblem x={24} y={22} />
    <rect x="38" y="17" width="58" height="5" rx="2.5" className="ds-fill-strong" />
    <rect x="38" y="26" width="38" height="4" rx="2" className="ds-fill-soft" />

    {/* The card number, called out */}
    <rect x="120" y="18" width="46" height="8" rx="4" className="ds-fill-accent" />

    <path d="M16 42h148" className="ds-stroke-soft" />

    {/* Household table */}
    {[0, 1, 2, 3].map((row) => (
      <g key={row} transform={`translate(0 ${52 + row * 18})`}>
        <circle cx="24" cy="4" r="4.6" className="ds-fill-soft" />
        <rect x="36" y="1" width={68 - row * 8} height="5" rx="2.5" className="ds-fill" />
        <rect x="122" y="1.5" width="34" height="4" rx="2" className="ds-fill-soft" />
        <path d="M16 12h148" className="ds-stroke-soft" opacity="0.5" />
      </g>
    ))}
  </svg>
);

/* Printed slip: salary statement, hospital discharge record. */
const Slip = () => (
  <svg viewBox="0 0 160 210" className="ds-svg" role="presentation">
    <path
      d="M8 6h144v186l-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6Z"
      className="ds-card"
    />

    <rect x="24" y="22" width="68" height="7" rx="3" className="ds-fill-strong" />
    <rect x="24" y="35" width="44" height="4" rx="2" className="ds-fill-soft" />
    <path d="M24 50h112" className="ds-stroke-soft" />

    {/* Line items */}
    {[0, 1, 2, 3].map((row) => (
      <g key={row} transform={`translate(0 ${62 + row * 17})`}>
        <rect x="24" y="0" width={54 - row * 6} height="4.5" rx="2.25" className="ds-fill-soft" />
        <rect x="104" y="0" width="32" height="4.5" rx="2.25" className="ds-fill" />
      </g>
    ))}

    <path d="M24 138h112" className="ds-stroke" strokeWidth="1.4" />

    {/* Total — the figure the office reads */}
    <rect x="24" y="150" width="40" height="5" rx="2.5" className="ds-fill-soft" />
    <rect x="94" y="147" width="42" height="9" rx="4.5" className="ds-fill-accent" />

    <rect x="24" y="176" width="52" height="4" rx="2" className="ds-fill-soft" />
  </svg>
);

/* Handwritten declaration on plain paper. */
const Declaration = () => (
  <svg viewBox="0 0 160 210" className="ds-svg" role="presentation">
    <rect x="8" y="6" width="144" height="198" rx="6" className="ds-card" />

    <rect x="48" y="26" width="64" height="7" rx="3" className="ds-fill-strong" />

    <g className="ds-fill-soft">
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <rect
          key={row}
          x="26"
          y={54 + row * 15}
          width={row === 5 ? 62 : 108}
          height="4"
          rx="2"
        />
      ))}
    </g>

    {/* Signature block — the part people forget */}
    <path d="M92 168c6-9 11 7 17-2s10 5 17-3" className="ds-stroke-accent" fill="none" />
    <path d="M88 178h50" className="ds-stroke" strokeWidth="1.3" />
    <rect x="96" y="184" width="34" height="3.5" rx="1.75" className="ds-fill-soft" />

    <rect x="26" y="176" width="30" height="4" rx="2" className="ds-fill-soft" />
    <rect x="26" y="186" width="42" height="3.5" rx="1.75" className="ds-fill-soft" />
  </svg>
);

/* Passport photograph. */
const Photo = () => (
  <svg viewBox="0 0 160 210" className="ds-svg" role="presentation">
    <rect x="30" y="16" width="100" height="126" rx="5" className="ds-slot" />

    {/* Head and shoulders, framed the way a passport crop wants it */}
    <circle cx="80" cy="66" r="24" className="ds-fill-soft" />
    <path d="M42 142c4-26 19-38 38-38s34 12 38 38Z" className="ds-fill-soft" />

    {/* Crop guides */}
    <path d="M30 52h100" className="ds-stroke-accent" strokeDasharray="4 4" opacity="0.7" />
    <path d="M30 112h100" className="ds-stroke-accent" strokeDasharray="4 4" opacity="0.7" />

    <rect x="46" y="160" width="68" height="5" rx="2.5" className="ds-fill" />
    <rect x="58" y="173" width="44" height="4" rx="2" className="ds-fill-soft" />
  </svg>
);

const SCHEMATICS = {
  idCard: IdCard,
  certificate: Certificate,
  booklet: Booklet,
  slip: Slip,
  declaration: Declaration,
  photo: Photo,
};

/**
 * @param {object} props
 * @param {'idCard'|'certificate'|'booklet'|'slip'|'declaration'|'photo'} props.type
 * @param {string} [props.className]
 */
const DocumentSchematic = ({ type, className = '' }) => {
  const Drawing = SCHEMATICS[type] ?? SCHEMATICS.certificate;

  return (
    <div className={`ds ${className}`.trim()} aria-hidden="true">
      <Drawing />
    </div>
  );
};

export default DocumentSchematic;
