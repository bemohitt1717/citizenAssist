import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { Distribution, Panel, Panels, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import {
  ADMIN_AGENTS,
  ADMIN_COUNTS,
  ADMIN_PERFORMANCE,
  ADMIN_SERVICE_VOLUME,
} from '../../adminData';

/**
 * Admin dashboard landing.
 *
 * Leads with the verification queue rather than the platform totals, because an
 * unverified agent is the one thing here that blocks other people's work. Totals
 * sit beside it as context, not as the point.
 */
const AdminHome = () => {
  const pending = ADMIN_AGENTS.filter((agent) => agent.status === 'pending');

  const decide = () => {
    // TODO(api): PATCH /api/admin/agents/:id  body: { status: 'active' | 'rejected' }
    // Setting 'active' is what lets requests reach them.
  };

  const distribution = ADMIN_SERVICE_VOLUME.map((entry) => ({
    name: getServiceById(entry.serviceId)?.name ?? entry.serviceId,
    count: entry.requests,
    share: entry.share,
  }));

  return (
    <>
      <Stats>
        <Stat
          icon="shieldCheck"
          label="Agents to verify"
          value={ADMIN_COUNTS.pendingAgents}
          note="Blocking their first file"
          attention={ADMIN_COUNTS.pendingAgents > 0}
        />
        <Stat
          icon="phone"
          label="Open complaints"
          value={ADMIN_COUNTS.openComplaints}
          note="Awaiting resolution"
          attention={ADMIN_COUNTS.openComplaints > 0}
        />
        <Stat
          icon="document"
          label="Active requests"
          value={ADMIN_COUNTS.activeRequests}
          note="In progress now"
        />
        <Stat
          icon="check"
          label="Completed"
          value={ADMIN_COUNTS.completedRequests}
          note="All time"
        />
      </Stats>

      <Panels split>
        <Panel
          title={`Waiting for verification · ${pending.length}`}
          action={
            <Link className="ca-panel__more" to="/admin/agents">
              All agents
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          <ul className="ca-rows">
            {pending.map((agent) => (
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
                  <button type="button" className="ca-row__yes" onClick={decide}>
                    <Icon name="check" size={13} />
                    Verify
                  </button>
                  <button type="button" className="ca-row__no" onClick={decide}>
                    Reject
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="ca-panels">
          <Panel title="Platform">
            <Stats>
              <Stat label="Citizens" value={ADMIN_COUNTS.citizens} />
              <Stat label="Agents" value={ADMIN_COUNTS.agents} />
              <Stat label="Completion rate" value={ADMIN_PERFORMANCE.completionRate} />
              <Stat label="Avg. days" value={ADMIN_PERFORMANCE.averageDays} />
            </Stats>
          </Panel>

          <Panel
            title="Most requested"
            action={
              <Link className="ca-panel__more" to="/admin/services">
                Services
                <Icon name="arrowRight" size={14} />
              </Link>
            }
          >
            <Distribution items={distribution} />
          </Panel>
        </div>
      </Panels>
    </>
  );
};

export default AdminHome;
