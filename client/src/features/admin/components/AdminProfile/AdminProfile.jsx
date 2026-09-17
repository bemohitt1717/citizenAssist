import { useEffect, useState } from 'react';
import { Field, Panel, Panels, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { getAdminProfile, updateAdminProfile, getAdminDashboard } from '../../adminApi';
import { useAuth } from '../../../../context/authContext';

/**
 * Administrator profile with real data.
 */
const AdminProfile = () => {
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useAuth(); // Get auth context to update navbar

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('👤 [ADMIN-PROFILE] Fetching profile...');
      const [profileData, dashboardData] = await Promise.all([
        getAdminProfile(),
        getAdminDashboard(),
      ]);

      setProfile(profileData.data.profile);
      setName(profileData.data.profile.name);
      setCounts(dashboardData.data.counts);
      console.log('✅ [ADMIN-PROFILE] Profile loaded');
    } catch (error) {
      console.error('❌ [ADMIN-PROFILE] Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const save = async () => {
    if (!name || name.trim() === '') {
      alert('Name cannot be empty');
      return;
    }

    try {
      console.log('💾 [ADMIN-PROFILE] Updating name:', name);
      await updateAdminProfile(name.trim());
      setIsSaved(true);

      // Update auth context so navbar reflects new name immediately
      if (user) {
        setUser({ ...user, name: name.trim() });
      }

      // Update local profile state so UI reflects change
      setProfile((prev) => ({ ...prev, name: name.trim() }));

      console.log('✅ [ADMIN-PROFILE] Profile updated, UI synced');

      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('❌ [ADMIN-PROFILE] Update failed:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading profile...</div>;
  }

  if (!profile) {
    return <div style={{ padding: '2rem' }}>Failed to load profile.</div>;
  }

  return (
    <Panels split>
      <Panel title="Your account">
        <div className="ca-form">
          <Field
            id="admin-name"
            label="Display name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setIsSaved(false);
            }}
            hint="Shown on complaint resolutions and in the activity record."
          />

          <div className="ca-form__row">
            <Field
              id="admin-mobile"
              label="Mobile"
              value={profile.phone}
              disabled
              hint="A sign-in identity. Changed by another administrator."
              data-numeric
            />

            <Field
              id="admin-email"
              label="Google account"
              value={profile.email || 'Not set'}
              disabled
              hint="A sign-in identity. Changed by another administrator."
            />
          </div>

          <SaveRow onSave={save} isSaved={isSaved} />
        </div>
      </Panel>

      <Panel title="Access">
        <ul className="ca-rows">
          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Role</span>
              <span className="ca-row__meta">Full platform access</span>
            </span>
            <span className="ca-row__actions">
              <span className="ca-status ca-status--done">
                <span className="ca-status__dot" />
                Administrator
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Administrator since</span>
              <span className="ca-row__meta" data-numeric>
                {profile.since}
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Agents you have verified</span>
              <span className="ca-row__meta" data-numeric>
                {counts?.agents || 0}
              </span>
            </span>
          </li>
        </ul>

        <p className="ca-field__hint">
          New administrator accounts are created by an existing administrator, never by signing in.
        </p>
      </Panel>
    </Panels>
  );
};

export default AdminProfile;
