import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Icon from '../../ui/Icon/Icon';
import './PageShell.css';

/**
 * The frame for surfaces that are not the landing page: a mark, a way back, and
 * the content. No navigation and no footer — these are surfaces you are part way
 * through something on, and a full site header invites wandering off mid task.
 *
 * @param {object} props
 * @param {string} [props.backTo]    Route the back control goes to.
 * @param {string} [props.backLabel] Text on the back control.
 */
const PageShell = ({ backTo = '/', backLabel = 'Back to site', children }) => (
  <div className="ca-shell">
    <div className="ca-shell__bar">
      <Link to="/" aria-label="Citizen Assist, home">
        <Logo size={28} />
      </Link>

      <Link className="ca-shell__back" to={backTo}>
        <Icon name="arrowRight" size={15} />
        {backLabel}
      </Link>
    </div>

    <div className="ca-shell__body">{children}</div>
  </div>
);

export default PageShell;
