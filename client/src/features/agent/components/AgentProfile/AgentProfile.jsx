import { useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Field, Panel, Panels, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { EXPERIENCE_BANDS } from '../../../../constants/agent';
import { SERVICES } from '../../../../constants/services';
import { AGENT_PROFILE } from '../../agentData';

/**
 * Agent profile.
 *
 * Editable: name, district, experience, which services you handle. Locked: the
 * mobile number and the Google email, because those are the two things you sign in
 * with — letting an agent change either from inside a session would be a way to
 * hand the account to someone else without re-verifying.
 *
 * Verification status is shown, never edited. Only an admin can move it.
 */
const AgentProfile = () => {
  const [form, setForm] = useState({
    name: AGENT_PROFILE.name,
    district: AGENT_PROFILE.district,
    experience: AGENT_PROFILE.experience,
    services: AGENT_PROFILE.services,
  });
  const [isSaved, setIsSaved] = useState(false);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setIsSaved(false);
  };

  const toggleService = (id) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(id)
        ? current.services.filter((item) => item !== id)
        : [...current.services, id],
    }));
    setIsSaved(false);
  };

  const save = () => {
    // TODO(api): PATCH /api/agent/profile  body: form
    setIsSaved(true);
  };

  return (
    <Panels split>
      <Panel title="Your details">
        <div className="ca-form">
          <Field
            id="agent-name"
            label="Full name"
            value={form.name}
            onChange={setField('name')}
            autoComplete="name"
          />

          <div className="ca-form__row">
            <Field
              id="agent-district"
              label="District you work in"
              value={form.district}
              onChange={setField('district')}
            />

            <Field
              id="agent-exp"
              label="Experience"
              as="select"
              value={form.experience}
              onChange={setField('experience')}
              options={EXPERIENCE_BANDS}
            />
          </div>

          <div className="ca-form__row">
            <Field
              id="agent-mobile"
              label="Mobile"
              value={AGENT_PROFILE.mobile}
              disabled
              hint="Used to sign in. Contact an admin to change it."
              data-numeric
            />

            <Field
              id="agent-email"
              label="Google account"
              value={AGENT_PROFILE.email}
              disabled
              hint="Used to sign in. Contact an admin to change it."
            />
          </div>

          <div className="ca-field">
            <span className="ca-field__label">Services you handle</span>

            <div className="ca-chips">
              {SERVICES.map((service) => {
                const isOn = form.services.includes(service.id);

                return (
                  <button
                    key={service.id}
                    type="button"
                    className={`ca-chip ${isOn ? 'is-on' : ''}`.trim()}
                    onClick={() => toggleService(service.id)}
                    aria-pressed={isOn}
                  >
                    <span className="ca-chip__box">{isOn && <Icon name="check" size={12} />}</span>
                    {service.name}
                  </button>
                );
              })}
            </div>

            <span className="ca-field__hint">
              Only requests for these services will be assigned to you.
            </span>
          </div>

          <SaveRow onSave={save} isSaved={isSaved} hint="Changes apply to new assignments." />
        </div>
      </Panel>

      <Panel title="Verification">
        <ul className="ca-rows">
          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Status</span>
              <span className="ca-row__meta">
                {AGENT_PROFILE.verified
                  ? 'Checked by an admin. You can receive requests.'
                  : 'Under review. You cannot receive requests yet.'}
              </span>
            </span>
            <span className="ca-row__actions">
              <span className={`ca-status ca-status--${AGENT_PROFILE.verified ? 'done' : 'warn'}`}>
                <span className="ca-status__dot" />
                {AGENT_PROFILE.verified ? 'Verified' : 'Pending'}
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Verified on</span>
              <span className="ca-row__meta" data-numeric>
                {AGENT_PROFILE.verifiedOn}
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Applied on</span>
              <span className="ca-row__meta" data-numeric>
                {AGENT_PROFILE.joinedOn}
              </span>
            </span>
          </li>
        </ul>

        <p className="ca-field__hint">
          Verification is set by an administrator and cannot be changed from here.
        </p>
      </Panel>
    </Panels>
  );
};

export default AgentProfile;
