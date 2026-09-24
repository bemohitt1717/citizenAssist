import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../../../../components/common/Logo/Logo';
import UserMenu from '../../../../components/common/UserMenu/UserMenu';
import Icon from '../../../../components/ui/Icon/Icon';
import { getAgentDashboard, getAgentProfile } from '../../agentApi';
import { AGENT_SECTIONS } from '../../agentData';
import { useAuth } from '../../../../context/authContext';
import './AgentShell.css';

/**
 * The agent dashboard frame.
 *
 * Separate from the admin shell on purpose: the two dashboards are different
 * features with different rails, and one file that branched on role would mean
 * every admin change risked the agent layout.
 *
 * The rail carries the verification standing at its foot, because an agent whose
 * status lapses needs to see that without hunting for it.
 */
const AgentShell = ({ activeId, children }) => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('loading');

  useEffect(() => {
    let current = true;
    Promise.all([getAgentDashboard(), getAgentProfile()])
      .then(([dashboard, profile]) => {
        if (!current) return;
        setPendingCount(dashboard.data?.counts?.pending || 0);
        setVerificationStatus(profile.data?.profile?.verificationStatus || 'unavailable');
      })
      .catch(() => {
        if (current) setVerificationStatus('unavailable');
      });
    return () => { current = false; };
  }, []);
  const section = AGENT_SECTIONS.find((item) => item.id === activeId) ?? AGENT_SECTIONS[0];

  /* The landing section greets by name; every other section is titled after
     itself. Repeating a greeting on Requests or Earnings would just push the
     content down for nothing. */
  const isHome = section.id === 'dashboard';
  const displayName = user?.name || 'Agent';
  const title = isHome ? `Welcome back, ${displayName}` : section.label;

  return (
    <div className="ca-agentdash">
      <nav className="ca-agentdash__rail" aria-label="Agent sections">
        <div className="ca-agentdash__rail-top">
          <Link className="ca-agentdash__brand" to="/" aria-label="Citizen Assist, home">
            <Logo size={26} />
          </Link>

          {/* No role badge here. Which dashboard you are in is already stated by
              the identity chip's menu and by the URL, so a third copy was just
              taking up the strip. */}

          {/* Mobile placement. Hidden from 62rem, where the copy in the page bar
              takes over. */}
          <div className="ca-agentdash__rail-menu">
            <UserMenu
              name={displayName}
              roleLabel="Service agent"
              profileTo="/agent"
            />
          </div>
        </div>

        <ul className="ca-agentdash__nav">
          {AGENT_SECTIONS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/agent/${item.id}`}
                className={({ isActive }) =>
                  `ca-agentdash__link ${isActive ? 'is-active' : ''}`.trim()
                }
              >
                <Icon name={item.icon} size={17} />
                {item.label}
                {item.id === 'requests' && pendingCount > 0 && (
                  <span className="ca-agentdash__count" data-numeric>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ca-agentdash__standing">
          <span className="ca-label ca-agentdash__standing-key">Your standing</span>
          <span className={`ca-status ca-status--${verificationStatus === 'active' ? 'done' : 'warn'}`}>
            <span className="ca-status__dot" />
            {verificationStatus === 'active'
              ? 'Verified · active'
              : verificationStatus === 'loading'
                ? 'Loading status…'
                : verificationStatus === 'unavailable'
                  ? 'Status unavailable'
                  : verificationStatus === 'suspended'
                    ? 'Account suspended'
                    : verificationStatus === 'rejected'
                      ? 'Application rejected'
                      : 'Awaiting verification'}
          </span>
        </div>
      </nav>

      <div className="ca-agentdash__main">
        <div className="ca-agentdash__bar">
          <div className="ca-agentdash__heading">
            <h1 className="ca-agentdash__title">{title}</h1>
            <p className="ca-agentdash__blurb">{section.blurb}</p>
          </div>

          {/* Desktop placement. Hidden below 62rem, where the copy in the sticky
              rail takes over. */}
          <div className="ca-agentdash__bar-menu">
            <UserMenu
              name={displayName}
              roleLabel="Service agent"
              profileTo="/agent"
            />
          </div>
        </div>

        <div className="ca-agentdash__panel">{children}</div>
      </div>
    </div>
  );
};

export default AgentShell;
