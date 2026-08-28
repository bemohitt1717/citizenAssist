import { useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { Empty, Panel, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { ADMIN_AGENTS } from '../../adminData';

const FILTERS = [
  { id: 'pending', label: 'To verify' },
  { id: 'active', label: 'Active' },
  { id: 'rejected', label: 'Rejected' },
];

const TONE = { pending: 'warn', active: 'done', rejected: 'stop' };
const LABEL = { pending: 'Pending', active: 'Active', rejected: 'Rejected' };

/**
 * Agent management.
 *
 * Verifying is a one-click affirmative; rejecting goes through a confirmation,
 * because it closes off someone's application and the two should not sit at equal
 * weight next to each other.
 */
const AdminAgents = () => {
  const [filterId, setFilterId] = useState('pending');
  const [rejecting, setRejecting] = useState(null);

  const rows = ADMIN_AGENTS.filter((agent) => agent.status === filterId);

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: ADMIN_AGENTS.filter((agent) => agent.status === filter.id).length,
  }));

  const verify = () => {
    // TODO(api): PATCH /api/admin/agents/:id  body: { status: 'active' }
    // Also flips users.status to 'active', which is what unblocks assignment.
  };

  const confirmReject = () => {
    // TODO(api): PATCH /api/admin/agents/:id  body: { status: 'rejected' }
    setRejecting(null);
  };

  const suspend = () => {
    // TODO(api): PATCH /api/admin/agents/:id  body: { status: 'suspended' }
  };

  return (
    <>
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter agents by status" />

      <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty
            icon="shieldCheck"
            title="Nobody here"
            text="Agents appear in this list once their application reaches this state."
          />
        ) : (
          <ul className="ca-rows">
            {rows.map((agent) => (
              <li className="ca-row" key={agent.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">
                    {agent.name}
                    <span className={`ca-status ca-status--${TONE[agent.status]}`}>
                      <span className="ca-status__dot" />
                      {LABEL[agent.status]}
                    </span>
                  </span>

                  <span className="ca-row__meta">
                    <span>{agent.district}</span>
                    <span data-numeric>{agent.mobile}</span>
                    <span>{agent.email}</span>
                    <span>{agent.experience}</span>
                    <span data-numeric>{agent.services} services</span>
                    {agent.status === 'active' && (
                      <>
                        <span data-numeric>{agent.completed} completed</span>
                        <span data-numeric>Rating {agent.rating}</span>
                      </>
                    )}
                    {agent.status !== 'active' && <span>{agent.appliedAt}</span>}
                  </span>
                </span>

                <span className="ca-row__actions">
                  {agent.status === 'pending' && (
                    <>
                      <button type="button" className="ca-row__yes" onClick={verify}>
                        <Icon name="check" size={13} />
                        Verify
                      </button>
                      <button
                        type="button"
                        className="ca-row__no"
                        onClick={() => setRejecting(agent)}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {agent.status === 'active' && (
                    <button type="button" className="ca-row__no" onClick={suspend}>
                      Suspend
                    </button>
                  )}

                  {agent.status === 'rejected' && (
                    <button type="button" className="ca-row__no" onClick={verify}>
                      Reconsider
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {rejecting && (
        <ConfirmDialog
          destructive
          icon="shieldCheck"
          title={`Reject ${rejecting.name}?`}
          text={`Their application closes and they will not be able to take any citizen's file. You can reconsider it later from the Rejected list.`}
          confirmLabel="Reject application"
          onConfirm={confirmReject}
          onCancel={() => setRejecting(null)}
        />
      )}
    </>
  );
};

export default AdminAgents;
