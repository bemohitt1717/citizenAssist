import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { ROLES } from '../../../../constants/roles';
import './RoleChooser.css';

/**
 * Asks which role is signing in, before showing the form.
 *
 * The role does not change how sign-in works — every role uses the same mobile
 * number and PIN, or the same Google account. It only selects the wording, and
 * tells the backend which dashboard to send the session to.
 */
const RoleChooser = ({ onPick }) => (
  <div className="ca-roles">
    <div className="ca-roles__main">
      <h1 className="ca-roles__title">Who is signing in?</h1>

      <p className="ca-roles__lede">
        Choose your role. Sign in with your mobile number and PIN, or Google account.
      </p>

      <ul className="ca-roles__list">
        {ROLES.map((role) => (
          <li key={role.id}>
            <button type="button" className="ca-roles__option" onClick={() => onPick(role.id)}>
              <span className="ca-roles__mark">
                <Icon name={role.icon} size={19} />
              </span>

              <span className="ca-roles__body">
                <span className="ca-roles__label">{role.label}</span>
                <span className="ca-roles__blurb">{role.blurb}</span>
              </span>

              <Icon name="arrowRight" size={18} className="ca-roles__go" />
            </button>
          </li>
        ))}
      </ul>
    </div>

    <p className="ca-roles__foot">
      Want to work as an agent?{' '}
      <Link className="ca-roles__link" to="/become-an-agent">
        Apply here
      </Link>{' '}
      — an admin verifies you before your first file.
    </p>
  </div>
);

export default RoleChooser;
