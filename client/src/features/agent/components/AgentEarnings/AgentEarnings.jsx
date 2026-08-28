import { Panel, Stat, Stats } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { AGENT_EARNINGS, AGENT_PAYOUTS } from '../../agentData';

/**
 * Agent earnings.
 *
 * Every figure here is derived from completed requests — the amount is the
 * request's charge, the date is its completion. There is no ledger collection to
 * keep in step, which is one fewer thing that can disagree with itself.
 */
const AgentEarnings = () => {
  const settled = AGENT_PAYOUTS.filter((payout) => payout.settled);
  const unsettled = AGENT_PAYOUTS.filter((payout) => !payout.settled);

  return (
    <>
      <Stats>
        <Stat icon="income" label="This month" value={AGENT_EARNINGS.thisMonth} note="Settled and pending" />
        <Stat
          icon="clock"
          label="Not yet settled"
          value={AGENT_EARNINGS.unsettled}
          note={`${unsettled.length} requests`}
          attention={unsettled.length > 0}
        />
        <Stat icon="check" label="All time" value={AGENT_EARNINGS.allTime} note="Since you joined" />
        <Stat
          icon="document"
          label="Completed this month"
          value={AGENT_EARNINGS.completedThisMonth}
          note="Requests closed"
        />
      </Stats>

      <div className="ca-panels">
        <Panel title={`Awaiting settlement · ${unsettled.length}`}>
          <ul className="ca-rows">
            {unsettled.map((payout) => (
              <li className="ca-row" key={payout.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">{getServiceById(payout.serviceId)?.name}</span>
                  <span className="ca-row__meta">
                    <span data-numeric>{payout.reference}</span>
                    <span>Completed, not yet paid out</span>
                  </span>
                </span>

                <span className="ca-row__actions">
                  <span className="ca-status ca-status--warn">
                    <span className="ca-status__dot" />
                    <span data-numeric>{payout.amount}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={`Paid out · ${settled.length}`}>
          <ul className="ca-rows">
            {settled.map((payout) => (
              <li className="ca-row" key={payout.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">{getServiceById(payout.serviceId)?.name}</span>
                  <span className="ca-row__meta">
                    <span data-numeric>{payout.reference}</span>
                    <span data-numeric>{payout.on}</span>
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
        </Panel>
      </div>
    </>
  );
};

export default AgentEarnings;
