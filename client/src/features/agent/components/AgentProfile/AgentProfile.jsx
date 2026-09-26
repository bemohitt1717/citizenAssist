import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Field, Panel, Panels, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { EXPERIENCE_BANDS } from '../../../../constants/agent';
import { SERVICES } from '../../../../constants/services';
import { getAgentProfile, updateAgentProfile } from '../../agentApi';
import { useAuth } from '../../../../context/authContext';
import { SectionLoading } from '../../../../components/ui/LoadingStates/LoadingStates';

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
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', district: '', experience: '', services: [] });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const loadProfile = async () => {
      try {
        const response = await getAgentProfile();
        if (!isCurrent) return;
        const loadedProfile = response.data.profile;
        setProfile(loadedProfile);
        setForm({
          name: loadedProfile.name,
          district: loadedProfile.district,
          experience: loadedProfile.experience,
          services: loadedProfile.services,
        });
        console.info('[agent] profile loaded', loadedProfile.id);
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load your profile. Try again.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isCurrent = false;
    };
  }, []);

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

  const save = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      setError('');
      await updateAgentProfile(form);
      setProfile((current) => ({ ...current, ...form }));

      if (user) {
        setUser({ ...user, name: form.name.trim() });
      }

      setIsSaved(true);
      console.info('[agent] profile saved');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your profile. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <SectionLoading variant="profile" />;
  if (!profile) return <p role="alert">{error || 'Could not load your profile. Try again.'}</p>;

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
              value={profile.phone}
              disabled
              hint="Ask an admin to change this."
              data-numeric
            />

            <Field
              id="agent-email"
              label="Google account"
              value={profile.email}
              disabled
              hint="Ask an admin to change this."
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
              You will only get requests for these services.
            </span>
          </div>

          <SaveRow onSave={save} isSaved={isSaved} isSaving={isSaving} hint="Applies to new requests." />
        </div>
      </Panel>

      <Panel title="Application status">
        <ul className="ca-rows">
          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Status</span>
              <span className="ca-row__meta">
                {profile.verificationStatus === 'active'
                  ? 'Approved by an admin. You can receive requests.'
                  : 'Under review. You cannot receive requests yet.'}
              </span>
            </span>
            <span className="ca-row__actions">
              <span className={`ca-status ca-status--${profile.verificationStatus === 'active' ? 'done' : 'warn'}`}>
                <span className="ca-status__dot" />
                {profile.verificationStatus === 'active' ? 'Approved' : 'Waiting for approval'}
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Approved on</span>
              <span className="ca-row__meta" data-numeric>
                {profile.verifiedOn || 'Not approved yet'}
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Applied on</span>
              <span className="ca-row__meta" data-numeric>
                {profile.joinedOn}
              </span>
            </span>
          </li>
        </ul>

        <p className="ca-field__hint">
          Only an admin can change this status.
        </p>
      </Panel>
    </Panels>
  );
};

export default AgentProfile;
