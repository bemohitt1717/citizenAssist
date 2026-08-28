import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { Panel, Panels, Readiness, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { AGENT_COUNTS, AGENT_EARNINGS, AGENT_REQUESTS } from '../../agentData';

/**
 * Agent dashboard landing.
 *
 * Ordered by what needs a decision. The queue of unaccepted requests comes first,
 * because an agent sitting on it means a citizen waiting; earnings sit below,
 * since nothing about them is urgent.
 */
const AgentHome = () => {
  const offered = AGENT_REQUESTS.filter((request) => request.status === 'offered');

  const decide = () => {
    // TODO(api): PATCH /api/agent/requests/:id  body: { decision: 'accept' | 'reject' }
    // Accept -> status becomes 'review' and it moves into Active.
    // Reject -> it returns to the admin pool for reassignment.
  };

  return (
    <>
      <Stats>
        <Stat
          icon="document"
          label="Awaiting your decision"
          value={AGENT_COUNTS.pending}
          note="Accept or decline"
          attention={AGENT_COUNTS.pending > 0}
        />
        <Stat icon="clock" label="In progress" value={AGENT_COUNTS.active} note="Accepted by you" />
        <Stat
          icon="phone"
          label="Waiting on citizen"
          value={AGENT_COUNTS.action}
          note="You asked for something"
        />
        <Stat icon="check" label="Completed" value={AGENT_COUNTS.completed} note="All time" />
      </Stats>

      <Panels split>
        <Panel
          title="Assigned to you"
          action={
            <Link className="ca-panel__more" to="/agent/requests">
              All requests
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          <ul className="ca-rows">
            {offered.map((request) => (
              <li className="ca-row" key={request.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">{getServiceById(request.serviceId)?.name}</span>
                  <span className="ca-row__meta">
                    <span data-numeric>{request.reference}</span>
                    <span>{request.citizen}</span>
                    <Readiness
                      attached={request.documentsAttached}
                      required={request.documentsRequired}
                    />
                    <span data-numeric>{request.charge}</span>
                    <span>{request.updatedAt}</span>
                  </span>
                </span>

                <span className="ca-row__actions">
                  <button type="button" className="ca-row__yes" onClick={decide}>
                    <Icon name="check" size={13} />
                    Accept
                  </button>
                  <button type="button" className="ca-row__no" onClick={decide}>
                    Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Earnings"
          action={
            <Link className="ca-panel__more" to="/agent/earnings">
              History
              <Icon name="arrowRight" size={14} />
            </Link>
          }
        >
          <Stats>
            <Stat label="This month" value={AGENT_EARNINGS.thisMonth} />
            <Stat label="Not yet settled" value={AGENT_EARNINGS.unsettled} />
            <Stat label="All time" value={AGENT_EARNINGS.allTime} />
            <Stat label="Done this month" value={AGENT_EARNINGS.completedThisMonth} />
          </Stats>
        </Panel>
      </Panels>
    </>
  );
};

export default AgentHome;
