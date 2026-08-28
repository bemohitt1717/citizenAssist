import Icon from '../../../../../components/ui/Icon/Icon';
import './Stage.css';

/**
 * The five scenes that illustrate the process.
 *
 * Authored from the product's own furniture — service tiles, a form, an agent
 * chip, a checklist, a seal — rather than from stock imagery, so each scene
 * shows the actual thing that happens at that step. Everything animates in
 * CSS off `.ca-stage`, and the parent remounts this component per step, which
 * replays the timeline cleanly without any imperative animation code.
 *
 * The whole panel is `aria-hidden`: it restates the step's text, which is
 * always present beside it, so a screen reader gets the meaning without
 * narrating a diagram.
 */

/* 1 — Six tiles, one chosen. */
const ChooseStage = () => (
  <div className="ca-stage__tiles">
    {Array.from({ length: 6 }, (_, index) => (
      <span
        key={index}
        className={`ca-stage__tile ${index === 0 ? 'is-picked' : ''}`.trim()}
        style={{ '--ca-t': index }}
      >
        <span className="ca-stage__tile-bar" />
        <span className="ca-stage__tile-bar ca-stage__tile-bar--short" />
      </span>
    ))}
  </div>
);

/* 2 — A form filling itself in, then the upload landing. */
const SubmitStage = () => (
  <div className="ca-stage__form">
    {['Full name', 'Address', 'Purpose'].map((label, index) => (
      <span key={label} className="ca-stage__field" style={{ '--ca-t': index }}>
        <span className="ca-stage__field-label">{label}</span>
        <span className="ca-stage__field-track">
          <span className="ca-stage__field-fill" />
        </span>
      </span>
    ))}

    <span className="ca-stage__upload" style={{ '--ca-t': 3 }}>
      <Icon name="document" size={16} />
      Documents attached
      <span className="ca-stage__upload-tick">
        <Icon name="check" size={13} />
      </span>
    </span>
  </div>
);

/* 3 — The agent chip arrives and the seal draws. */
const AssignStage = () => (
  <div className="ca-stage__agent">
    <span className="ca-stage__avatar">
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <circle cx="20" cy="15" r="6.4" fill="currentColor" opacity="0.9" />
        <path d="M6.5 37c1.6-7.6 7.1-11.6 13.5-11.6S32 29.4 33.5 37Z" fill="currentColor" opacity="0.9" />
      </svg>
    </span>

    <span className="ca-stage__agent-body">
      <span className="ca-stage__agent-name" />
      <span className="ca-stage__agent-meta" />
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
);

/* 4 — Documents ticking off against the office's list. */
const ReviewStage = () => (
  <div className="ca-stage__check">
    {['Aadhaar', 'Ration card', 'Salary slip', 'Declaration'].map((label, index) => (
      <span key={label} className="ca-stage__check-row" style={{ '--ca-t': index }}>
        <span className="ca-stage__check-box">
          <Icon name="check" size={13} />
        </span>
        <span className="ca-stage__check-label">{label}</span>
        <span className="ca-stage__check-rule" />
      </span>
    ))}

    <span className="ca-stage__check-progress">
      <span className="ca-stage__check-progress-fill" />
    </span>
  </div>
);

/* 5 — The certificate, stamped by the authority. */
const IssueStage = () => (
  <div className="ca-stage__cert">
    <span className="ca-stage__paper">
      <span className="ca-stage__paper-line ca-stage__paper-line--title" />
      <span className="ca-stage__paper-line" />
      <span className="ca-stage__paper-line" />
      <span className="ca-stage__paper-line ca-stage__paper-line--short" />
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
