import { useState } from 'react';
import { Field, Panel, Panels, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { ADMIN_COUNTS, ADMIN_PROFILE } from '../../adminData';

/**
 * Administrator profile.
 *
 * Only the display name is editable. The mobile and email are the two sign-in
 * identities, and an admin who could change either from inside a session could
 * hand the whole platform to someone else without re-verifying — so those are
 * changed by another administrator, out of band.
 *
 * There is deliberately no "create admin" control here. New admins are created by
 * an existing one through a route that is not part of this dashboard, which keeps
 * the most privileged action in the product out of a settings page.
 */
const AdminProfile = () => {
  const [name, setName] = useState(ADMIN_PROFILE.name);
  const [isSaved, setIsSaved] = useState(false);

  const save = () => {
    // TODO(api): PATCH /api/admin/profile  body: { name }
    setIsSaved(true);
  };

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
              value={ADMIN_PROFILE.mobile}
              disabled
              hint="A sign-in identity. Changed by another administrator."
              data-numeric
            />

            <Field
              id="admin-email"
              label="Google account"
              value={ADMIN_PROFILE.email}
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
                {ADMIN_PROFILE.since}
              </span>
            </span>
          </li>

          <li className="ca-row">
            <span className="ca-row__body">
              <span className="ca-row__title">Agents you have verified</span>
              <span className="ca-row__meta" data-numeric>
                {ADMIN_COUNTS.agents}
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
