import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { Distribution, Panel, Panels, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getAdminDashboard, getAgents, updateAgentStatus } from '../../adminApi';

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
    try {
      const response = await updateAgentStatus(agentId, decision);
      if (decision === 'active' && response.data?.pin) {
        setIssuedPin({ pin: response.data.pin, mobile: response.data.mobile });
      }
      // Refresh pending agents list
      const agentsData = await getAgents('pending');
      setPendingAgents(agentsData.data.agents);
    } catch (error) {
      console.error('Failed to update agent status:', error);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  }

  if (!counts) {
    return <div style={{ padding: '2rem' }}>Failed to load dashboard data.</div>;
  }

  return (
    <>
      {issuedPin && (
        <Panel title="Agent verified">
          <p style={{ padding: '1rem' }}>
            Share this login PIN with <strong data-numeric>+91 {issuedPin.mobile}</strong>:{' '}
            <strong data-numeric>{issuedPin.pin}</strong>
          </p>
        </Panel>
      )}
      <Stats>
        <Stat
          icon="shieldCheck"
          label="Agents to verify"
          value={counts.pendingAgents}
          note="Blocking their first file"
          attention={counts.pendingAgents > 0}
        />
        <Stat
          icon="phone"
          label="Open complaints"
          value={counts.openComplaints}
          note="Awaiting resolution"
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

      <Panels split>
        <Panel
          title={`Waiting for verification · ${pendingAgents.length}`}
          action={
            <Link className="ca-panel__more" to="/admin/agents">
              All agents
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          {pendingAgents.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--color-ink-muted)' }}>
              No pending agents at the moment.
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
                  <button
                    type="button"
                    className="ca-row__yes"
                    onClick={() => decide(agent.id, 'active')}
                  >
                    <Icon name="check" size={13} />
                    Verify
                  </button>
                  <button
                    type="button"
                    className="ca-row__no"
                    onClick={() => decide(agent.id, 'rejected')}
                  >
                    Reject
                  </button>
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
