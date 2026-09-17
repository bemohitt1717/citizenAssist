import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { Empty, Panel, Readiness, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { getServiceById } from '../../../../constants/services';
import { getStatus } from '../../../../constants/requests';
import { AGENT_NEXT_STATUS } from '../../agentData';
import {
  addAgentRequestNote,
  decideAgentRequest,
  getAgentRequests,
  updateAgentRequestStatus,
  uploadAgentRequestDocument,
} from '../../agentApi';
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [declining, setDeclining] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchRequests = async () => {
    try {
      setError('');
      const response = await getAgentRequests('all');
      setRequests(response.data.requests);
      console.info('[agent] requests loaded', response.count);
    } catch (requestError) {
      console.error('[agent] requests load failed', requestError);
      setError(requestError.response?.data?.message || 'Could not load assigned requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadRequests = async () => {
      try {
        const response = await getAgentRequests('all');
        if (!isCurrent) return;
        setRequests(response.data.requests);
        console.info('[agent] requests loaded', response.count);
      } catch (requestError) {
        if (!isCurrent) return;
        console.error('[agent] requests load failed', requestError);
        setError(requestError.response?.data?.message || 'Could not load assigned requests.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadRequests();

    return () => {
      isCurrent = false;
    };
  }, []);

  const rows = requests.filter((request) => matches(request, filterId));

  const tabs = FILTERS.map((filter) => ({
    ...filter,
    count: requests.filter((request) => matches(request, filter.id)).length,
  }));

  const decide = async (requestId, decision) => {
    try {
      setBusyId(requestId);
      await decideAgentRequest(requestId, decision);
      console.info('[agent] request decision saved', { requestId, decision });
      await fetchRequests();
    } catch (requestError) {
      console.error('[agent] request decision failed', requestError);
      setError(requestError.response?.data?.message || 'Could not update this request.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDecline = async () => {
    if (!declining) return;
    await decide(declining.id, 'reject');
    setDeclining(null);
  };

  const changeStatus = async (requestId, status) => {
    try {
      setBusyId(requestId);
      await updateAgentRequestStatus(requestId, status);
      console.info('[agent] request status saved', { requestId, status });
      await fetchRequests();
    } catch (requestError) {
      console.error('[agent] request status failed', requestError);
      setError(requestError.response?.data?.message || 'Could not change request status.');
    } finally {
      setBusyId(null);
    }
  };

  const sendNote = async (id) => {
    const note = noteDrafts[id]?.trim();
    if (!note) return;

    try {
      setBusyId(id);
      await addAgentRequestNote(id, note);
      console.info('[agent] request note saved', { requestId: id });
      setNoteDrafts((current) => ({ ...current, [id]: '' }));
      await fetchRequests();
      return true;
    } catch (requestError) {
      console.error('[agent] request note failed', requestError);
      setError(requestError.response?.data?.message || 'Could not send note.');
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const attachDocument = async (requestId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBusyId(requestId);
      await uploadAgentRequestDocument(requestId, file);
      console.info('[agent] final document uploaded', { requestId, file: file.name });
      await fetchRequests();
    } catch (requestError) {
      console.error('[agent] final document upload failed', requestError);
      setError(requestError.response?.data?.message || 'Could not upload final document.');
    } finally {
      setBusyId(null);
      event.target.value = '';
    }
  };

  if (isLoading) return <Panel title="Requests"><p>Loading assigned requests...</p></Panel>;

  return (
    <>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
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
                      <button
                        type="button"
                        className="ca-row__yes"
                        onClick={() => setSelectedRequest(request)}
                        disabled={busyId === request.id}
                      >
                        <Icon name="document" size={13} />
                        See request
                      </button>
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
                            onChange={(event) => changeStatus(request.id, event.target.value)}
                            disabled={busyId === request.id}
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
                          aria-disabled={!noteDrafts[request.id] || busyId === request.id}
                          disabled={!noteDrafts[request.id] || busyId === request.id}
                        >
                          <Icon name="check" size={13} />
                          Send note
                        </button>

                        <label className="ca-row__no">
                          <Icon name="document" size={13} />
                          Attach finished document
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={(event) => attachDocument(request.id, event)}
                            disabled={busyId === request.id}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {selectedRequest && (
        <div className="ca-areq-modal__scrim" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedRequest(null);
        }}>
          <div className="ca-areq-modal" role="dialog" aria-modal="true" aria-labelledby="request-dialog-title">
            <div className="ca-areq-modal__head">
              <div>
                <span className="ca-label">Incoming service request</span>
                <h2 id="request-dialog-title">{getServiceById(selectedRequest.serviceId)?.name}</h2>
                <span className="ca-areq-modal__reference" data-numeric>{selectedRequest.reference}</span>
              </div>
              <button type="button" className="ca-usermenu__close" onClick={() => setSelectedRequest(null)} aria-label="Close request details">
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="ca-areq-modal__body">
              <section>
                <span className="ca-label">Citizen details</span>
                <dl className="ca-areq-modal__facts">
                  <div><dt>Name</dt><dd>{selectedRequest.applicantDetails?.fullName || selectedRequest.citizen}</dd></div>
                  <div><dt>Mobile</dt><dd data-numeric>{selectedRequest.applicantDetails?.phone || selectedRequest.citizenMobile}</dd></div>
                  <div><dt>Email</dt><dd>{selectedRequest.applicantDetails?.email || 'Not provided'}</dd></div>
                  <div><dt>District</dt><dd>{selectedRequest.applicantDetails?.district || selectedRequest.district}</dd></div>
                  <div><dt>Address</dt><dd>{selectedRequest.applicantDetails?.address || 'Not provided'}</dd></div>
                </dl>
              </section>

              <section>
                <span className="ca-label">Documents provided</span>
                {selectedRequest.documents?.length ? (
                  <ul className="ca-areq-modal__docs">
                    {selectedRequest.documents.map((document) => <li key={document}>{document.split('/').pop()}</li>)}
                  </ul>
                ) : <p className="ca-areq-modal__muted">No documents attached yet.</p>}
              </section>

              <section>
                <span className="ca-label">Request history</span>
                <ul className="ca-areq-modal__timeline">
                  {(selectedRequest.timeline || []).map((entry) => (
                    <li key={`${entry.status}-${entry.at}`}><strong>{getStatus(entry.status).label}</strong><span>{entry.note}</span></li>
                  ))}
                </ul>
              </section>

              <section className="ca-areq-modal__message">
                <label className="ca-field__label" htmlFor={`incoming-note-${selectedRequest.id}`}>
                  Message the citizen
                </label>
                <textarea
                  id={`incoming-note-${selectedRequest.id}`}
                  className="ca-field__area"
                  placeholder="Ask for a missing document or clarify something in the request."
                  value={noteDrafts[selectedRequest.id] ?? ''}
                  onChange={(event) => setNoteDrafts((current) => ({
                    ...current,
                    [selectedRequest.id]: event.target.value,
                  }))}
                />
                <button
                  type="button"
                  className="ca-row__no"
                  onClick={async () => {
                    const sent = await sendNote(selectedRequest.id);
                    if (sent) setSelectedRequest(null);
                  }}
                  disabled={!noteDrafts[selectedRequest.id]?.trim() || busyId === selectedRequest.id}
                >
                  <Icon name="check" size={13} />
                  {busyId === selectedRequest.id ? 'Sending...' : 'Send note'}
                </button>
                <span className="ca-field__hint">
                  Sending a note marks the request as waiting on the citizen.
                </span>
              </section>
            </div>

            <div className="ca-areq-modal__actions">
              <button type="button" className="ca-row__no" onClick={() => { setDeclining(selectedRequest); setSelectedRequest(null); }}>
                Decline request
              </button>
              <button type="button" className="ca-row__yes" onClick={() => { decide(selectedRequest.id, 'accept'); setSelectedRequest(null); }}>
                <Icon name="check" size={13} />
                Accept request
              </button>
            </div>
          </div>
        </div>
      )}

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
