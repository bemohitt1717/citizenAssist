import Icon from '../Icon/Icon';
import { Button } from '../button';
import { Spinner } from '../spinner';
import './DataKit.css';

/**
 * Design-system atoms for showing records.
 *
 * The agent and admin dashboards are separate features with their own shells,
 * sections, data and routes. They both draw from this kit the same way they both
 * use Icon — sharing an atom is not sharing a dashboard, and duplicating a stat
 * card would mean fixing every spacing bug twice.
 */

/** A single figure. `attention` marks the number that means someone is waiting. */
export const Stat = ({ icon, label, value, note, attention = false }) => (
  <div className={`ca-stat ${attention ? 'ca-stat--attention' : ''}`.trim()}>
    <span className="ca-label ca-stat__key">
      {icon && <Icon name={icon} size={14} />}
      {label}
    </span>
    <span className="ca-stat__value" data-numeric>
      {value}
    </span>
    {note && <span className="ca-stat__note">{note}</span>}
  </div>
);

export const Stats = ({ children }) => <div className="ca-stats">{children}</div>;

/** A titled block, optionally with a control or link on the right. */
export const Panel = ({ title, action, children }) => (
  <section className="ca-panel">
    <div className="ca-panel__head">
      <h2 className="ca-panel__title">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export const Panels = ({ split = false, children }) => (
  <div className={`ca-panels ${split ? 'ca-panels--split' : ''}`.trim()}>{children}</div>
);

/**
 * Filter tabs.
 *
 * @param {object} props
 * @param {Array<{id: string, label: string, count?: number}>} props.tabs
 * @param {string} props.activeId
 * @param {Function} props.onPick
 */
export const Tabs = ({ tabs, activeId, onPick, label }) => (
  <div className="ca-tabs" role="tablist" aria-label={label}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === activeId}
        className={`ca-tab ${tab.id === activeId ? 'is-active' : ''}`.trim()}
        onClick={() => onPick(tab.id)}
      >
        {tab.label}
        {typeof tab.count === 'number' && (
          <span className="ca-tab__count" data-numeric>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/** "3 of 5 docs", with a bar. Short of the full set turns clay. */
export const Readiness = ({ attached, required }) => {
  const isShort = attached < required;
  const percent = required === 0 ? 0 : Math.round((attached / required) * 100);

  return (
    <span className="ca-ready">
      <span className="ca-ready__bar" aria-hidden="true">
        <span
          className={`ca-ready__fill ${isShort ? 'ca-ready__fill--short' : ''}`.trim()}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span data-numeric>
        {attached} of {required} docs
      </span>
    </span>
  );
};

/** Horizontal share bars. */
export const Distribution = ({ items }) => (
  <ul className="ca-dist">
    {items.map((item) => (
      <li className="ca-dist__row" key={item.name}>
        <span className="ca-dist__top">
          <span className="ca-dist__name">{item.name}</span>
          <span className="ca-dist__count" data-numeric>
            {item.count} · {item.share}%
          </span>
        </span>
        <span className="ca-dist__track" aria-hidden="true">
          <span className="ca-dist__fill" style={{ width: `${item.share}%` }} />
        </span>
      </li>
    ))}
  </ul>
);

/** A labelled input, select or textarea. */
export const Field = ({
  id,
  label,
  hint,
  as = 'input',
  options,
  ...rest
}) => (
  <div className="ca-field">
    <label className="ca-field__label" htmlFor={id}>
      {label}
    </label>

    {as === 'select' ? (
      <select id={id} className="ca-field__select" {...rest}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    ) : as === 'textarea' ? (
      <textarea id={id} className="ca-field__area" {...rest} />
    ) : (
      <input id={id} className="ca-field__input" {...rest} />
    )}

    {hint && <span className="ca-field__hint">{hint}</span>}
  </div>
);

/** Save row with a transient confirmation. */
export const SaveRow = ({ onSave, isSaved, isSaving = false, label = 'Save changes', hint }) => (
  <div className="ca-form__actions">
    <Button
      type="button"
      variant="unstyled"
      className="ca-pill ca-pill--solid ca-form__save"
      onClick={onSave}
      disabled={isSaving}
      aria-busy={isSaving}
    >
      {isSaving && <Spinner data-icon="inline-start" />}
      {isSaving ? 'Saving…' : label}
      <span className="ca-pill__disc">
        {isSaved ? <Icon name="check" size={15} /> : <Icon name="arrowRight" size={15} />}
      </span>
    </Button>

    {isSaved && (
      <span className="ca-form__saved">
        <Icon name="check" size={15} />
        Saved
      </span>
    )}

    {hint && !isSaved && <span className="ca-field__hint">{hint}</span>}
  </div>
);

export const Empty = ({ icon = 'document', title, text, children }) => (
  <div className="ca-empty">
    <span className="ca-empty__mark">
      <Icon name={icon} size={20} />
    </span>
    <h2 className="ca-empty__title">{title}</h2>
    <p className="ca-empty__text">{text}</p>
    {children}
  </div>
);
