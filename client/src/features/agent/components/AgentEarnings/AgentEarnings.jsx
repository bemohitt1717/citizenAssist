import { useEffect, useState } from 'react';
import { Panel, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getAgentEarnings } from '../../agentApi';
import { SectionLoading } from '../../../../components/ui/LoadingStates/LoadingStates';

/**
 * Agent earnings.
 *
 * Every figure here is derived from completed requests — the amount is the
 * request's charge, the date is its completion. There is no ledger collection to
 * keep in step, which is one fewer thing that can disagree with itself.
 */
const AgentEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAgentEarnings()
      .then((response) => setEarnings(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load earnings.'));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!earnings) return <SectionLoading variant="earnings" />;

  const completed = earnings.completedRequests;

  return (
    <>
      <Stats>
        <Stat icon="income" label="This month" value={earnings.thisMonth} />
        <Stat icon="check" label="All time" value={earnings.allTime} />
        <Stat
          icon="document"
          label="Completed this month"
          value={earnings.completedThisMonth}
          note="Requests completed"
        />
      </Stats>

      <div className="ca-panels">
        <Panel title={`Completed requests · ${completed.length}`}>
          {completed.length === 0 ? (
            <p>No completed requests yet.</p>
          ) : (
            <ul className="ca-rows">
              {completed.map((payout) => (
                <li className="ca-row" key={payout.id}>
                  <span className="ca-row__body">
                    <span className="ca-row__title">{getServiceById(payout.serviceId)?.name}</span>
                    <span className="ca-row__meta">
                      <span data-numeric>{payout.reference}</span>
                      <span data-numeric>{payout.completedAt}</span>
                    </span>
                  </span>

                  <span className="ca-row__actions">
                    <span className="ca-status ca-status--done">
                      <span className="ca-status__dot" />
                      <span data-numeric>{payout.amount}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
};

export default AgentEarnings;
