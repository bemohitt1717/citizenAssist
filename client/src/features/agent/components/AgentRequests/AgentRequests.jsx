import { useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { Empty, Panel, Readiness, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getStatus } from '../../../../constants/requests';
import { AGENT_NEXT_STATUS, AGENT_REQUESTS } from '../../agentData';
import './AgentRequests.css';

/* One list filtered by status, rather than four screens of the same rows. */
const FILTERS = [
  { id: 'offered', label: 'To decide' },
  { id: 'live', label: 'In progress' },
  { id: 'action', label: 'Waiting on citizen' },
  { id: 'completed', label: 'Completed' },
];

const matches = (request, filterId) => {
  if (filterId === 'live') return request.status === 'review' || request.status === 'processing';
  return request.status === filterId;
};

const toneFor = (status) => {
  if (status === 'completed') return 'done';
  if (status === 'action') return 'warn';
  return 'open';
};

/**
 * Agent requests.
 *
 * Everything assigned to this agent, filtered by status. Expanding a row reveals
 * the citizen's contact details and the controls for moving the work along —
 * update status, ask the citizen for something, attach the finished document.
 *
 * Contact details stay collapsed by default. A list that shows every citizen's
 * mobile number at once is a list that leaks them to anyone glancing at the
 * screen.
 */
const AgentRequests = () => {
  const [filterId, setFilterId] = useState('offered');
  const [openId, setOpenId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [declining, setDeclining] = useState(null);

  const rows = AGENT_REQUESTS.filter((request) => matches(request, filterId));

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: AGENT_REQUESTS.filter((request) => matches(request, filter.id)).length,
  }));

  const accept = () => {
    // TODO(api): PATCH /api/agent/requests/:id  body: { decision: 'accept' }
  };

  const confirmDecline = () => {
    // TODO(api): PATCH /api/agent/requests/:id  body: { decision: 'reject' }
    setDeclining(null);
  };

  const changeStatus = () => {
    // TODO(api): PATCH /api/agent/requests/:id/status  body: { status }
    // Appends to the request's timeline array; does not overwrite it.
  };

  const sendNote = (id) => {
    // TODO(api): POST /api/agent/requests/:id/notes  body: { note: noteDrafts[id] }
    setNoteDrafts((current) => ({ ...current, [id]: '' }));
  };

  const attachDocument = () => {
    // TODO(api): POST /api/agent/requests/:id/document  (multipart)
    // Only for services where the office returns a file we can pass on.
  };

  return (
    <>
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter requests by status" />

      <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty
            title="Nothing here"
            text="When a request reaches this stage it will show up in this list."
          />
        ) : (
          <ul className="ca-rows">
            {rows.map((request) => {
              const service = getServiceById(request.serviceId);
              const isOpen = openId === request.id;

              return (
                <li className="ca-row ca-areq" key={request.id}>
                  <span className="ca-row__body">
                    <span className="ca-row__title">
                      {service?.name}
                      {request.status !== 'offered' && (
                        <span className={`ca-status ca-status--${toneFor(request.status)}`}>
                          <span className="ca-status__dot" />
                          {getStatus(request.status).label}
                        </span>
                      )}
                    </span>

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

                    {request.lastNote && <span className="ca-row__note">{request.lastNote}</span>}
                  </span>

                  <span className="ca-row__actions">
                    {request.status === 'offered' ? (
                      <>
                        <button type="button" className="ca-row__yes" onClick={accept}>
                          <Icon name="check" size={13} />
                          Accept
                        </button>
                        <button
                          type="button"
                          className="ca-row__no"
                          onClick={() => setDeclining(request)}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="ca-row__no"
                        onClick={() => setOpenId(isOpen ? null : request.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? 'Close' : 'Open'}
                        <Icon name="arrowDown" size={13} />
                      </button>
                    )}
                  </span>

                  {isOpen && (
                    <div className="ca-areq__open">
                      <div className="ca-areq__contact">
                        <span className="ca-label ca-areq__contact-key">Citizen</span>
                        <span className="ca-areq__contact-value">
                          {request.citizen} · <span data-numeric>{request.citizenMobile}</span> ·{' '}
                          {request.district}
                        </span>
                      </div>

                      <div className="ca-areq__controls">
                        <div className="ca-field ca-areq__control">
                          <label className="ca-field__label" htmlFor={`status-${request.id}`}>
                            Move to
                          </label>
                          <select
                            id={`status-${request.id}`}
                            className="ca-field__select"
                            defaultValue={request.status}
                            onChange={changeStatus}
                          >
                            {AGENT_NEXT_STATUS.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="ca-field ca-areq__control">
                          <label className="ca-field__label" htmlFor={`note-${request.id}`}>
                            Note for the citizen
                          </label>
                          <textarea
                            id={`note-${request.id}`}
                            className="ca-field__area ca-areq__note"
                            placeholder="Say what is needed, and why."
                            value={noteDrafts[request.id] ?? ''}
                            onChange={(event) =>
                              setNoteDrafts((current) => ({
                                ...current,
                                [request.id]: event.target.value,
                              }))
                            }
                          />
                          <span className="ca-field__hint">
                            Appears on their tracking page and sets the status to “waiting on you”.
                          </span>
                        </div>
                      </div>

                      <div className="ca-areq__actions">
                        <button
                          type="button"
                          className="ca-row__yes"
                          onClick={() => sendNote(request.id)}
                          aria-disabled={!noteDrafts[request.id]}
                        >
                          <Icon name="check" size={13} />
                          Send note
                        </button>

                        <button type="button" className="ca-row__no" onClick={attachDocument}>
                          <Icon name="document" size={13} />
                          Attach finished document
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {declining && (
        <ConfirmDialog
          destructive
          icon="document"
          title={`Decline ${declining.reference}?`}
          text={`This ${getServiceById(declining.serviceId)?.name} request goes back to the admin pool to be reassigned. ${declining.citizen} will wait longer as a result.`}
          confirmLabel="Decline it"
          onConfirm={confirmDecline}
          onCancel={() => setDeclining(null)}
        />
      )}
    </>
  );
};

export default AgentRequests;
