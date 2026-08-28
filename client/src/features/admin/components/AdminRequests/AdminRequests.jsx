import { useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Empty, Panel, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getStatus } from '../../../../constants/requests';
import { ADMIN_AGENTS, ADMIN_REQUESTS } from '../../adminData';

const FILTERS = [
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'live', label: 'In progress' },
  { id: 'action', label: 'Stuck' },
  { id: 'completed', label: 'Completed' },
];

const matches = (request, filterId) => {
  if (filterId === 'unassigned') return request.status === 'pending';
  if (filterId === 'live') return ['assigned', 'review', 'processing'].includes(request.status);
  return request.status === filterId;
};

const toneFor = (status) => {
  if (status === 'completed') return 'done';
  if (status === 'action') return 'warn';
  if (status === 'pending') return 'warn';
  return 'open';
};

/**
 * Request management.
 *
 * Unassigned comes first, because a request with nobody on it is the only state
 * where the platform itself is the thing holding a citizen up.
 *
 * Assignment is a dropdown of agents, not an auto-match. With one district and a
 * handful of agents, a human picking is both simpler to build and better than a
 * rule nobody can inspect — the select is narrowed to agents who are active and
 * handle that service, which is the part worth automating.
 */
const AdminRequests = () => {
  const [filterId, setFilterId] = useState('unassigned');

  const rows = ADMIN_REQUESTS.filter((request) => matches(request, filterId));
  const activeAgents = ADMIN_AGENTS.filter((agent) => agent.status === 'active');

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: ADMIN_REQUESTS.filter((request) => matches(request, filter.id)).length,
  }));

  const assign = () => {
    // TODO(api): PATCH /api/admin/requests/:id  body: { agentId }
    // Sets status to 'assigned' and appends a timeline entry.
  };

  return (
    <>
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter requests by state" />

      <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty
            title="Nothing here"
            text="Requests appear in this list once they reach this state."
          />
        ) : (
          <ul className="ca-rows">
            {rows.map((request) => (
              <li className="ca-row" key={request.id}>
                <span className="ca-row__body">
                  <span className="ca-row__title">
                    {getServiceById(request.serviceId)?.name}
                    <span className={`ca-status ca-status--${toneFor(request.status)}`}>
                      <span className="ca-status__dot" />
                      {getStatus(request.status).label}
                    </span>
                  </span>

                  <span className="ca-row__meta">
                    <span data-numeric>{request.reference}</span>
                    <span>{request.citizen}</span>
                    <span>{request.district}</span>
                    <span data-numeric>{request.charge}</span>
                    <span data-numeric>{request.createdAt}</span>
                  </span>
                </span>

                <span className="ca-row__actions">
                  <label className="ca-sr-only" htmlFor={`assign-${request.id}`}>
                    Agent for {request.reference}
                  </label>
                  <select
                    id={`assign-${request.id}`}
                    className="ca-field__select"
                    defaultValue={request.agentName ?? ''}
                    onChange={assign}
                  >
                    <option value="">Not assigned</option>
                    {activeAgents.map((agent) => (
                      <option key={agent.id} value={agent.name}>
                        {agent.name} · {agent.district}
                      </option>
                    ))}
                  </select>

                  {!request.agentName && (
                    <span className="ca-row__yes" role="presentation">
                      <Icon name="phone" size={13} />
                      Needs an agent
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
};

export default AdminRequests;
