import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { Button } from '../../../../components/ui/button';
import { Spinner } from '../../../../components/ui/spinner';
import { Distribution, Panel, Panels, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getAdminDashboard, getAgents, updateAgentStatus } from '../../adminApi';
import { SectionLoading } from '../../../../components/ui/LoadingStates/LoadingStates';

/**
 * Admin dashboard landing.
 *
 * Shows platform stats and pending agent verification queue.
 */
const AdminHome = () => {
  const [counts, setCounts] = useState(null);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [issuedPin, setIssuedPin] = useState(null);
  const [busyAgentId, setBusyAgentId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, agentsData] = await Promise.all([
          getAdminDashboard(),
          getAgents('pending'),
        ]);

        setCounts(dashboardData.data.counts);
        setPendingAgents(agentsData.data.agents);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const decide = async (agentId, decision) => {
    if (busyAgentId) return;
    try {
      setBusyAgentId(agentId);
      setActionError('');
      const response = await updateAgentStatus(agentId, decision);
      if (decision === 'active' && response.data?.pin) {
        setIssuedPin({ pin: response.data.pin, mobile: response.data.mobile });
      }
      // Refresh pending agents list
      const agentsData = await getAgents('pending');
      setPendingAgents(agentsData.data.agents);
    } catch (error) {
      console.error('Failed to update agent status:', error);
      setActionError(error.response?.data?.message || 'Could not update this agent. Try again.');
    } finally {
      setBusyAgentId(null);
    }
  };

  if (isLoading) return <SectionLoading variant="dashboard" />;

  if (!counts) {
    return <div style={{ padding: '2rem' }}>Could not load the dashboard. Try again.</div>;
  }

  return (
    <>
      {issuedPin && (
        <Panel title="Agent approved">
          <p style={{ padding: '1rem' }}>
            Share this login PIN with <strong data-numeric>+91 {issuedPin.mobile}</strong>:{' '}
            <strong data-numeric>{issuedPin.pin}</strong>
          </p>
        </Panel>
      )}
      <Stats>
        <Stat
          icon="shieldCheck"
          label="Agents to review"
          value={counts.pendingAgents}
          note="Waiting for review"
          attention={counts.pendingAgents > 0}
        />
        <Stat
          icon="phone"
          label="Open complaints"
          value={counts.openComplaints}
          note="Need a reply"
          attention={counts.openComplaints > 0}
        />
        <Stat
          icon="document"
          label="Active requests"
          value={counts.activeRequests}
          note="In progress now"
        />
        <Stat
          icon="check"
          label="Completed"
          value={counts.completedRequests}
          note="All time"
        />
      </Stats>

      {actionError && <p role="alert" style={{ color: 'var(--color-error)' }}>{actionError}</p>}

      <Panels split>
        <Panel
          title={`Agents to review · ${pendingAgents.length}`}
          action={
            <Link className="ca-panel__more" to="/admin/agents">
              View all
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          {pendingAgents.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--color-ink-muted)' }}>
              No agents to review.
            </p>
          ) : (
            <ul className="ca-rows">
              {pendingAgents.map((agent) => (
                <li className="ca-row" key={agent.id}>
                  <span className="ca-row__body">
                    <span className="ca-row__title">{agent.name}</span>
                    <span className="ca-row__meta">
                      <span>{agent.district}</span>
                    <span data-numeric>{agent.mobile}</span>
                    <span>{agent.experience}</span>
                    <span data-numeric>{agent.services} services</span>
                    <span>{agent.appliedAt}</span>
                  </span>
                </span>

                <span className="ca-row__actions">
                  <Button
                    className="ca-row__yes"
                    variant="unstyled"
                    size="sm"
                    onClick={() => decide(agent.id, 'active')}
                    disabled={Boolean(busyAgentId)}
                    aria-busy={busyAgentId === agent.id}
                  >
                    {busyAgentId === agent.id ? <Spinner data-icon="inline-start" /> : <Icon name="check" size={13} />}
                    {busyAgentId === agent.id ? 'Approving…' : 'Approve'}
                  </Button>
                  <Button
                    className="ca-row__no"
                    variant="unstyled"
                    size="sm"
                    onClick={() => decide(agent.id, 'rejected')}
                    disabled={Boolean(busyAgentId)}
                    aria-busy={busyAgentId === agent.id}
                  >
                    {busyAgentId === agent.id && <Spinner data-icon="inline-start" />}
                    {busyAgentId === agent.id ? 'Rejecting…' : 'Reject'}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
          )}
        </Panel>

        <div className="ca-panels">
          <Panel title="Platform">
            <Stats>
              <Stat label="Citizens" value={counts.citizens} />
              <Stat label="Agents" value={counts.agents} />
              <Stat label="Active requests" value={counts.activeRequests} />
              <Stat label="Completed" value={counts.completedRequests} />
            </Stats>
          </Panel>
        </div>
      </Panels>
    </>
  );
};

export default AdminHome;
