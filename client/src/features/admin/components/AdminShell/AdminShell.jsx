import { Link, NavLink } from 'react-router-dom';
import Logo from '../../../../components/common/Logo/Logo';
import UserMenu from '../../../../components/common/UserMenu/UserMenu';
import Icon from '../../../../components/ui/Icon/Icon';
import { IS_DEMO_AUTH } from '../../../../constants/demoAuth';
import { ADMIN_COUNTS, ADMIN_PROFILE, ADMIN_SECTIONS } from '../../adminData';
import './AdminShell.css';

/**
 * The administrator dashboard frame.
 *
 * Separate from the agent shell on purpose: the two dashboards are different
 * features with different rails, and one file that branched on role would mean
 * every agent change risked the admin layout.
 *
 * Two sections carry counts — agents awaiting verification and open complaints —
 * because those are the two queues where somebody else is blocked on an admin.
 */
const AdminShell = ({ activeId, children }) => {
  const section = ADMIN_SECTIONS.find((item) => item.id === activeId) ?? ADMIN_SECTIONS[0];

  /* The landing section greets by name; every other section is titled after
     itself. Repeating a greeting on Requests or Agents would just push the
     content down for nothing. */
  const isHome = section.id === 'dashboard';
  const title = isHome ? `Welcome back, ${ADMIN_PROFILE.name}` : section.label;

  const countFor = (id) => {
    if (id === 'agents') return ADMIN_COUNTS.pendingAgents;
    if (id === 'complaints') return ADMIN_COUNTS.openComplaints;
    return 0;
  };

  return (
    <div className="ca-admindash">
      <nav className="ca-admindash__rail" aria-label="Administrator sections">
        <Link className="ca-admindash__brand" to="/" aria-label="Citizen Assist, home">
          <Logo size={26} />
        </Link>

        <span className="ca-admindash__role">
          <Icon name="shieldCheck" size={12} />
          Administrator
        </span>

        <ul className="ca-admindash__nav">
          {ADMIN_SECTIONS.map((item) => {
            const count = countFor(item.id);

            return (
              <li key={item.id}>
                <NavLink
                  to={`/admin/${item.id}`}
                  className={({ isActive }) =>
                    `ca-admindash__link ${isActive ? 'is-active' : ''}`.trim()
                  }
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                  {count > 0 && (
                    <span className="ca-admindash__count" data-numeric>
                      {count}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="ca-admindash__standing">
          <span className="ca-label ca-admindash__standing-key">Needs you</span>
          <span
            className={`ca-status ca-status--${
              ADMIN_COUNTS.pendingAgents + ADMIN_COUNTS.openComplaints > 0 ? 'warn' : 'done'
            }`}
          >
            <span className="ca-status__dot" />
            {ADMIN_COUNTS.pendingAgents + ADMIN_COUNTS.openComplaints > 0
              ? `${ADMIN_COUNTS.pendingAgents + ADMIN_COUNTS.openComplaints} open items`
              : 'Nothing waiting'}
          </span>
        </div>
      </nav>

      <div className="ca-admindash__main">
        <div className="ca-admindash__bar">
          <div className="ca-admindash__heading">
            <h1 className="ca-admindash__title">{title}</h1>
            <p className="ca-admindash__blurb">{section.blurb}</p>
          </div>

          <UserMenu
            name={ADMIN_PROFILE.name}
            roleLabel="Administrator"
            profileTo="/admin/profile"
          />
        </div>

        {IS_DEMO_AUTH && (
          <div className="ca-admindash__demo">
            <Icon name="shieldCheck" size={16} />
            <p>
              Sample data. No citizens, agents, requests or complaints exist yet — these records are
              invented so the interface can be reviewed.
            </p>
          </div>
        )}

        <div className="ca-admindash__panel">{children}</div>
      </div>
    </div>
  );
};

export default AdminShell;
