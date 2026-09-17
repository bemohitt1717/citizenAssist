import { useEffect, useState } from 'react';
import { Field, Panel, Panels, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { useAuth } from '../../../../context/authContext';
import { getProfile, updateProfile } from '../../../auth/authApi';

/**
 * Citizen profile - manage the stored user details in MongoDB.
 */
const CitizenProfile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response.data.profile;
        setName(profile.name || '');
        setEmail(profile.email || '');

        if (user) {
          setUser({ ...user, name: profile.name || '', email: profile.email || '' });
        }
      } catch (requestError) {
        console.error('[citizen] profile load failed', requestError);
        setError(requestError.response?.data?.message || 'Could not load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const save = async () => {
    if (!name || name.trim() === '') {
      alert('Name cannot be empty');
      return;
    }

    try {
      console.log('💾 [PROFILE] Updating citizen profile:', { name, email });
      const response = await updateProfile({ name: name.trim(), email: email.trim() });
      const updatedUser = response.data.user;

      setUser((current) => ({
        ...(current || {}),
        ...updatedUser,
      }));

      setName(updatedUser.name || '');
      setEmail(updatedUser.email || '');
      setIsSaved(true);
      setError('');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (requestError) {
      console.error('[citizen] profile save failed', requestError);
      setError(requestError.response?.data?.message || 'Could not save profile.');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading profile...</div>;
  }

  return (
    <Panels split>
      <Panel title="Your account">
        <div className="ca-form">
          <Field
            id="citizen-name"
            label="Display name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsSaved(false);
            }}
            hint="Shown in your dashboard and communications."
          />

          <div className="ca-form__row">
            <Field
              id="citizen-mobile"
              label="Mobile number"
              value={user?.phone || 'Not set'}
              disabled
              hint="Your primary sign-in method."
              data-numeric
            />

            <Field
              id="citizen-email"
              label="Google account"
              value={email || 'Not set'}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsSaved(false);
              }}
              hint="Optional sign-in method."
            />
          </div>

          {error && <p role="alert" style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>}

          <SaveRow onSave={save} isSaved={isSaved} />
        </div>
      </Panel>

      <Panel title="Link accounts">
        <p style={{ marginBottom: '1rem', color: 'var(--color-ink-muted)' }}>
          {user?.phone && !email && 'Link your Google account for easier sign-in.'}
          {email && !user?.phone && 'Link your mobile number for SMS notifications.'}
          {user?.phone && email && 'Both accounts are linked. You can sign in with either.'}
        </p>

        <button
          type="button"
          style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--color-indigo)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={() => alert('Account linking coming soon!')}
        >
          {email ? 'Manage Linked Accounts' : 'Link Google Account'}
        </button>
      </Panel>
    </Panels>
  );
};

export default CitizenProfile;
