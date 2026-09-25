import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { Panel, Panels, Readiness, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import {
  decideAgentRequest,
  getAgentDashboard,
  getAgentEarnings,
  getAgentRequests,
} from '../../agentApi';

/**
 * Agent dashboard landing.
 *
 * Ordered by what needs a decision. The queue of unaccepted requests comes first,
 * because an agent sitting on it means a citizen waiting; earnings sit below,
 * since nothing about them is urgent.
 */
const AgentHome = () => {
  const [counts, setCounts] = useState(null);
  const [offered, setOffered] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async (isCurrent = () => true) => {
    try {
      const [dashboardResponse, requestsResponse, earningsResponse] = await Promise.all([
        getAgentDashboard(),
        getAgentRequests('offered'),
        getAgentEarnings(),
      ]);
      if (!isCurrent()) return;
      setCounts(dashboardResponse.data.counts);
      setOffered(requestsResponse.data.requests);
      setEarnings(earningsResponse.data);
    } catch (requestError) {
      if (!isCurrent()) return;
      setError(requestError.response?.data?.message || 'Could not load agent dashboard.');
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    fetchDashboard(() => isCurrent);

    return () => {
      isCurrent = false;
    };
  }, [fetchDashboard]);

  const decide = async (requestId, decision) => {
    try {
      await decideAgentRequest(requestId, decision);
      console.info('[agent] dashboard decision saved', { requestId, decision });
      await fetchDashboard();
    } catch (requestError) {
      console.error('[agent] dashboard decision failed', requestError);
      setError(requestError.response?.data?.message || 'Could not update this request.');
    }
  };

  if (isLoading) return <p>Loading dashboard...</p>;
  if (!counts || !earnings) return <p role="alert">{error || 'Dashboard unavailable.'}</p>;

  return (
    <>
      <Stats>
        <Stat
          icon="document"
          label="Awaiting your decision"
          value={counts.pending}
          note="Accept or decline"
          attention={counts.pending > 0}
        />
        <Stat icon="clock" label="In progress" value={counts.active} note="Accepted by you" />
        <Stat
          icon="phone"
          label="Waiting on citizen"
          value={counts.action}
          note="You asked for something"
        />
        <Stat icon="check" label="Completed" value={counts.completed} note="All time" />
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
                  <button type="button" className="ca-row__yes" onClick={() => decide(request.id, 'accept')}>
                    <Icon name="check" size={13} />
                    Accept
                  </button>
                  <button type="button" className="ca-row__no" onClick={() => decide(request.id, 'reject')}>
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
            <Stat label="This month" value={earnings.thisMonth} />
            <Stat label="All time" value={earnings.allTime} />
            <Stat label="Done this month" value={earnings.completedThisMonth} />
          </Stats>
        </Panel>
      </Panels>
    </>
  );
};

export default AgentHome;
