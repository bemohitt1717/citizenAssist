import { Link, NavLink } from 'react-router-dom';
import Logo from '../../../../components/common/Logo/Logo';
import UserMenu from '../../../../components/common/UserMenu/UserMenu';
import Icon from '../../../../components/ui/Icon/Icon';
import { CITIZEN_SECTIONS } from '../../citizenData';
import { useAuth } from '../../../../context/authContext';
import './CitizenShell.css';

/**
 * Citizen dashboard frame matching admin/agent layout.
 * Simple sidebar with Dashboard, Track Request, and Profile.
 */
const CitizenShell = ({ activeId, children }) => {
  const { user } = useAuth();
  const section = CITIZEN_SECTIONS.find((item) => item.id === activeId) ?? CITIZEN_SECTIONS[0];

  const isHome = section.id === 'dashboard';
  const userName = user?.name || 'User';
  const title = isHome ? `Welcome back, ${userName}` : section.label;

  return (
    <div className="ca-citizendash">
      <nav className="ca-citizendash__rail" aria-label="Citizen sections">
        <div className="ca-citizendash__rail-top">
          <Link className="ca-citizendash__brand" to="/" aria-label="Citizen Assist, home">
            <Logo size={26} />
          </Link>

          <div className="ca-citizendash__rail-menu">
            <UserMenu
              name={userName}
              roleLabel="Citizen"
              profileTo="/citizen"
            />
          </div>
        </div>

        <ul className="ca-citizendash__nav">
          {CITIZEN_SECTIONS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/citizen/${item.id}`}
                className={({ isActive }) =>
                  `ca-citizendash__link ${isActive ? 'is-active' : ''}`.trim()
                }
              >
                <Icon name={item.icon} size={17} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ca-citizendash__main">
        <div className="ca-citizendash__bar">
          <div className="ca-citizendash__heading">
            <h1 className="ca-citizendash__title">{title}</h1>
            <p className="ca-citizendash__blurb">{section.blurb}</p>
          </div>

          <div className="ca-citizendash__bar-menu">
            <UserMenu
              name={userName}
              roleLabel="Citizen"
              profileTo="/citizen"
            />
          </div>
        </div>

        <div className="ca-citizendash__panel">{children}</div>
      </div>
    </div>
  );
};

export default CitizenShell;
