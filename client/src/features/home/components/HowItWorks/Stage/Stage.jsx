import Icon from '../../../../../components/ui/Icon/Icon';
import { SERVICES } from '../../../../../constants/services';
import './Stage.css';

/**
 * The five scenes that illustrate the process.
 *
 * Built from HTML rather than SVG so the text inherits the project's type, and
 * filled with real content rather than grey placeholder bars — a row of empty
 * rules reads as a half-loaded page, not as an illustration.
 *
 * Service names and charges come from constants/services.js, so the first scene
 * cannot drift out of step with the cards above it.
 *
 * The whole panel is `aria-hidden`: it restates the step's text, which is always
 * present beside it, so a screen reader gets the meaning without being walked
 * through a diagram.
 */

/* One worked example carried across the scenes, so the five read as one file
   moving rather than five unrelated pictures. */
const CASE = {
  citizen: 'A. Kumar',
  district: 'Karimnagar',
  purpose: 'College fee concession',
  service: 'Income Certificate',
  agent: 'R. Meena',
  charge: '₹650',
  income: '₹1,20,000',
  validUntil: '31 Mar 2027',
};

/* 1 — Six services, one chosen. */
const ChooseStage = () => (
  <div className="ca-stage__tiles">
    {SERVICES.map((service, index) => (
      <span
        key={service.id}
        className={`ca-stage__tile ${index === 0 ? 'is-picked' : ''}`.trim()}
        style={{ '--ca-t': index }}
      >
        <span className="ca-stage__tile-name">{service.name.split(' ')[0]}</span>
        <span className="ca-stage__tile-charge">{service.charge}</span>
      </span>
    ))}
  </div>
);

/* 2 — The form, filled in. */
const SubmitStage = () => (
  <div className="ca-stage__form">
    {[
      { label: 'Full name', value: CASE.citizen },
      { label: 'District', value: CASE.district },
      { label: 'Purpose', value: CASE.purpose },
    ].map((field, index) => (
      <span key={field.label} className="ca-stage__field" style={{ '--ca-t': index }}>
        <span className="ca-stage__field-label">{field.label}</span>
        <span className="ca-stage__field-value">{field.value}</span>
      </span>
    ))}

    <span className="ca-stage__upload" style={{ '--ca-t': 3 }}>
      <Icon name="document" size={15} />
      <span className="ca-stage__upload-text">5 documents attached</span>
      <span className="ca-stage__upload-tick">
        <Icon name="check" size={12} />
      </span>
    </span>
  </div>
);

/* 3 — The agent who takes it. */
const AssignStage = () => (
  <div className="ca-stage__agent">
    <div className="ca-stage__agent-top">
      <span className="ca-stage__avatar" aria-hidden="true">
        RM
      </span>

      <span className="ca-stage__agent-body">
        <span className="ca-stage__agent-name">{CASE.agent}</span>
        <span className="ca-stage__agent-meta">
          {CASE.district} · 34 completed
        </span>
      </span>

      <span className="ca-stage__seal">
        <svg viewBox="0 0 34 34" aria-hidden="true" focusable="false">
          <circle
            className="ca-stage__seal-ring"
            cx="17"
            cy="17"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            className="ca-stage__seal-tick"
            d="M10.6 17.4 15 21.8 23.6 12.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>

    <div className="ca-stage__agent-foot">
      <span className="ca-stage__pill">
        <Icon name="shieldCheck" size={12} />
        Verified by admin
      </span>
      <span className="ca-stage__agent-charge">
        Charge confirmed <strong>{CASE.charge}</strong>
      </span>
    </div>
  </div>
);

/* 4 — Documents ticked off against the office's list. */
const ReviewStage = () => {
  const documents = ['Aadhaar card', 'Ration card', 'Salary slip', 'Land record', 'Declaration'];

  return (
    <div className="ca-stage__check">
      <span className="ca-stage__check-head">
        <span className="ca-stage__check-title">{CASE.service}</span>
        <span className="ca-stage__check-count">5 of 5</span>
      </span>

      {documents.map((label, index) => (
        <span key={label} className="ca-stage__check-row" style={{ '--ca-t': index }}>
          <span className="ca-stage__check-box">
            <Icon name="check" size={12} />
          </span>
          <span className="ca-stage__check-label">{label}</span>
        </span>
      ))}

      <span className="ca-stage__check-progress">
        <span className="ca-stage__check-progress-fill" />
      </span>
    </div>
  );
};

/* 5 — The certificate, as the office issues it. */
const IssueStage = () => (
  <div className="ca-stage__cert">
    <span className="ca-stage__paper">
      <span className="ca-stage__cert-head">
        <span className="ca-stage__cert-office">Revenue Department</span>
        <span className="ca-stage__cert-title">{CASE.service}</span>
      </span>

      <span className="ca-stage__cert-rows">
        {[
          { key: 'Name', value: CASE.citizen },
          { key: 'Annual income', value: CASE.income },
          { key: 'Valid until', value: CASE.validUntil },
        ].map((row) => (
          <span key={row.key} className="ca-stage__cert-row">
            <span className="ca-stage__cert-key">{row.key}</span>
            <span className="ca-stage__cert-value">{row.value}</span>
          </span>
        ))}
      </span>
    </span>

    <span className="ca-stage__stamp">
      <span className="ca-stage__stamp-ripple" />
      <svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle
          cx="22"
          cy="22"
          r="15.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="1.8 4.4"
          opacity="0.6"
        />
        <path
          d="M15 22.4 19.6 27 29.4 16.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </div>
);

const SCENES = {
  choose: ChooseStage,
  submit: SubmitStage,
  assign: AssignStage,
  review: ReviewStage,
  issue: IssueStage,
};

const Stage = ({ id }) => {
  const Scene = SCENES[id];
  if (!Scene) return null;

  return (
    <div className={`ca-stage ca-stage--${id}`} aria-hidden="true">
      <Scene />
    </div>
  );
};

export default Stage;
