import { useEffect, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { Button } from '../../../../components/ui/button';
import { Spinner } from '../../../../components/ui/spinner';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { Empty, Panel, Readiness, Tabs } from '../../../../components/ui/DataKit/DataKit';
import { SectionLoading } from '../../../../components/ui/LoadingStates/LoadingStates';
import { getServiceById } from '../../../../constants/services';
import { getStatus } from '../../../../constants/requests';
import { AGENT_NEXT_STATUS } from '../../agentData';
import {
  addAgentRequestNote,
  decideAgentRequest,
  downloadRequestDocument,
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
  const [busyAction, setBusyAction] = useState('');
  const [uploadingDocumentId, setUploadingDocumentId] = useState(null);
  const [attachmentFeedback, setAttachmentFeedback] = useState({});
  const [downloadError, setDownloadError] = useState('');
  const [downloadingDocument, setDownloadingDocument] = useState('');

  const fetchRequests = async () => {
    try {
      setError('');
      const response = await getAgentRequests('all');
      setRequests(response.data.requests);
      console.info('[agent] requests loaded', response.count);
    } catch (requestError) {
      console.error('[agent] requests load failed', requestError);
      setError(requestError.response?.data?.message || 'Could not load requests. Try again.');
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
        setError(requestError.response?.data?.message || 'Could not load requests. Try again.');
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
    if (busyId) return false;
    try {
      setBusyId(requestId);
      setBusyAction('decision');
      await decideAgentRequest(requestId, decision);
      console.info('[agent] request decision saved', { requestId, decision });
      await fetchRequests();
      return true;
    } catch (requestError) {
      console.error('[agent] request decision failed', requestError);
      setError(requestError.response?.data?.message || 'Could not update this request. Try again.');
      return false;
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  const confirmDecline = async () => {
    if (!declining) return;
    const declined = await decide(declining.id, 'reject');
    if (declined) setDeclining(null);
  };

  const changeStatus = async (requestId, status) => {
    if (busyId) return;
    try {
      setBusyId(requestId);
      setBusyAction('status');
      await updateAgentRequestStatus(requestId, status);
      console.info('[agent] request status saved', { requestId, status });
      await fetchRequests();
    } catch (requestError) {
      console.error('[agent] request status failed', requestError);
      setError(requestError.response?.data?.message || 'Could not update this request. Try again.');
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  const sendNote = async (id) => {
    const note = noteDrafts[id]?.trim();
    if (!note || busyId) return false;

    try {
      setBusyId(id);
      setBusyAction('note');
      await addAgentRequestNote(id, note);
      console.info('[agent] request note saved', { requestId: id });
      setNoteDrafts((current) => ({ ...current, [id]: '' }));
      await fetchRequests();
      return true;
    } catch (requestError) {
      console.error('[agent] request note failed', requestError);
      setError(requestError.response?.data?.message || 'Could not send the note. Try again.');
      return false;
    } finally {
      setBusyId(null);
      setBusyAction('');
    }
  };

  const downloadDocument = async (documentPath) => {
    const filename = documentPath.split('/').pop();
    if (!documentPath.startsWith('/uploads/') || downloadingDocument) return;
    setDownloadingDocument(filename);
    setDownloadError('');
    try {
      const blob = await downloadRequestDocument(documentPath);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace(/^\d+-/, '');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Could not open this document. Try again.');
    } finally {
      setDownloadingDocument('');
    }
  };

  const attachDocument = async (requestId, event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || busyId) return;

    setAttachmentFeedback((current) => ({
      ...current,
      [requestId]: { type: 'uploading', text: 'Uploading final document…' },
    }));
    try {
      setBusyId(requestId);
      setBusyAction('upload');
      setUploadingDocumentId(requestId);
      await uploadAgentRequestDocument(requestId, file);
      console.info('[agent] final document uploaded', { requestId, file: file.name });
      await fetchRequests();
      setAttachmentFeedback((current) => ({
        ...current,
        [requestId]: {
          type: 'success',
          text: 'File added. The citizen can download it from their request page.',
        },
      }));
    } catch (requestError) {
      console.error('[agent] final document upload failed', requestError);
      setAttachmentFeedback((current) => ({
        ...current,
        [requestId]: {
          type: 'error',
          text: requestError.response?.data?.message || 'Could not upload the final document. Try again.',
        },
      }));
    } finally {
      setBusyId(null);
      setBusyAction('');
      setUploadingDocumentId(null);
      input.value = '';
    }
  };

  if (isLoading) return <SectionLoading variant="list" />;

  return (
    <>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      <Tabs tabs={tabs} activeId={filterId} onPick={setFilterId} label="Filter requests by status" />

      <Panel title={`${FILTERS.find((f) => f.id === filterId)?.label} · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty
            title="Nothing here"
            text="New requests will appear here."
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
                      <Button
                        className="ca-row__yes"
                        variant="unstyled"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        disabled={busyId === request.id}
                      >
                        <Icon name="document" size={13} />
                        Review
                      </Button>
                    ) : (
                      <button
                        type="button"
                        className="ca-row__no"
                        onClick={() => setOpenId(isOpen ? null : request.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? 'Close' : 'Details'}
                        <Icon name="arrowDown" size={13} />
                      </button>
                    )}
                  </span>

                  {isOpen && (
                    <div className="ca-areq__open">
                      <section className="ca-areq__contact" aria-label="Citizen details">
                        <h3 className="ca-areq__section-title">Citizen details</h3>
                        <dl className="ca-areq__facts">
                          <div><dt>Name</dt><dd>{request.citizen}</dd></div>
                          <div><dt>Mobile</dt><dd data-numeric>{request.citizenMobile || 'Not provided'}</dd></div>
                          <div><dt>District</dt><dd>{request.district || 'Not provided'}</dd></div>
                        </dl>
                      </section>

                      <section className="ca-areq__work" aria-label="Request actions">
                        <h3 className="ca-areq__section-title">Update this request</h3>
                        <div className="ca-areq__controls">
                          <div className="ca-field ca-areq__control">
                            <label className="ca-field__label" htmlFor={`status-${request.id}`}>
                              Request status
                            </label>
                            <select
                              id={`status-${request.id}`}
                              className="ca-field__select"
                              value={request.status}
                              onChange={(event) => changeStatus(request.id, event.target.value)}
                              disabled={Boolean(busyId)}
                            >
                              {AGENT_NEXT_STATUS.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {busyId === request.id && busyAction === 'status' && (
                              <span className="ca-areq__saving" role="status">
                                <Spinner /> Saving status…
                              </span>
                            )}
                          </div>

                          <div className="ca-field ca-areq__control">
                            <label className="ca-field__label" htmlFor={`note-${request.id}`}>
                              Note for the citizen
                            </label>
                            <textarea
                              id={`note-${request.id}`}
                              className="ca-field__area ca-areq__note"
                              placeholder="What does the citizen need to do?"
                              value={noteDrafts[request.id] ?? ''}
                              onChange={(event) =>
                                setNoteDrafts((current) => ({
                                  ...current,
                                  [request.id]: event.target.value,
                                }))
                              }
                              disabled={busyId === request.id}
                            />
                            <span className="ca-field__hint">
                              The citizen will see this note on their request page.
                            </span>
                          </div>
                        </div>

                        <div className="ca-areq__actions">
                          <Button
                            className="ca-pill ca-pill--solid ca-areq__send"
                            variant="unstyled"
                            size="sm"
                            onClick={() => sendNote(request.id)}
                            disabled={!noteDrafts[request.id]?.trim() || Boolean(busyId)}
                            aria-busy={busyId === request.id && busyAction === 'note'}
                          >
                            {busyId === request.id && busyAction === 'note' ? <Spinner data-icon="inline-start" /> : <Icon name="check" size={14} />}
                            {busyId === request.id && busyAction === 'note' ? 'Sending…' : 'Send note'}
                          </Button>
                        </div>
                      </section>

                      <section className="ca-areq__delivery" aria-label="Final document">
                        <div className="ca-areq__delivery-copy">
                          <h3 className="ca-areq__section-title">Final document</h3>
                          <p>Add the file the citizen should receive.</p>
                          <span className="ca-field__hint">PDF, JPG or PNG. Up to 10 MB.</span>
                          {request.completedDocument && (
                            <span className="ca-areq__attached-file">
                              Current file: {request.completedDocument.split('/').pop().replace(/^\d+-/, '')}
                            </span>
                          )}
                          {attachmentFeedback[request.id] && (
                            <p
                              className={`ca-areq__feedback ca-areq__feedback--${attachmentFeedback[request.id].type}`}
                              role={attachmentFeedback[request.id].type === 'error' ? 'alert' : 'status'}
                            >
                              {attachmentFeedback[request.id].text}
                            </p>
                          )}
                        </div>

                        <Button
                          asChild
                          variant="unstyled"
                          className="ca-pill ca-pill--outline ca-areq__attach"
                          aria-disabled={Boolean(busyId)}
                          aria-busy={uploadingDocumentId === request.id}
                        >
                          <label>
                            {uploadingDocumentId === request.id ? <Spinner /> : <Icon name="document" size={15} />}
                            {uploadingDocumentId === request.id
                              ? 'Uploading…'
                              : request.completedDocument
                                ? 'Replace final document'
                                : 'Attach final document'}
                            <input
                              className="ca-areq__file-input ca-sr-only"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(event) => attachDocument(request.id, event)}
                              disabled={Boolean(busyId)}
                            />
                          </label>
                        </Button>
                      </section>
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
                <span className="ca-label">New request</span>
                <h2 id="request-dialog-title">{getServiceById(selectedRequest.serviceId)?.name}</h2>
                <span className="ca-areq-modal__reference" data-numeric>{selectedRequest.reference}</span>
              </div>
              <button type="button" className="ca-usermenu__close" onClick={() => setSelectedRequest(null)} aria-label="Close request details" disabled={busyId === selectedRequest.id}>
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
                <span className="ca-label">Documents</span>
                {selectedRequest.documents?.length ? (
                  <ul className="ca-areq-modal__docs">
                    {selectedRequest.documents.map((document) => {
                      const filename = document.split('/').pop().replace(/^\d+-/, '');
                      return (
                        <li key={document}>
                          {document.startsWith('/uploads/') ? (
                            <Button type="button" variant="unstyled" className="ca-areq-modal__doc-link" onClick={() => downloadDocument(document)} disabled={Boolean(downloadingDocument)} aria-busy={downloadingDocument === document.split('/').pop()}>
                              {downloadingDocument === document.split('/').pop() && <Spinner data-icon="inline-start" />}
                              {downloadingDocument === document.split('/').pop() ? 'Downloading…' : `Download ${filename}`}
                            </Button>
                          ) : filename}
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="ca-areq-modal__muted">No documents added yet.</p>}
                {downloadError && <p className="ca-areq-modal__muted" role="alert">{downloadError}</p>}
              </section>

              <section>
                <span className="ca-label">Updates</span>
                <ul className="ca-areq-modal__timeline">
                  {(selectedRequest.timeline || []).map((entry, index) => (
                    <li key={entry._id || `${entry.status}-${entry.at}-${index}`}>
                      <strong>{getStatus(entry.status).label}</strong>
                      <span>{entry.note}</span>
                    </li>
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
                  placeholder="Ask for a document or explain what needs fixing."
                  value={noteDrafts[selectedRequest.id] ?? ''}
                  onChange={(event) => setNoteDrafts((current) => ({
                    ...current,
                    [selectedRequest.id]: event.target.value,
                  }))}
                />
                <Button
                  className="ca-row__no"
                  variant="unstyled"
                  size="sm"
                  onClick={async () => {
                    const sent = await sendNote(selectedRequest.id);
                    if (sent) setSelectedRequest(null);
                  }}
                  disabled={!noteDrafts[selectedRequest.id]?.trim() || Boolean(busyId)}
                  aria-busy={busyId === selectedRequest.id && busyAction === 'note'}
                >
                  {busyId === selectedRequest.id && busyAction === 'note' ? <Spinner data-icon="inline-start" /> : <Icon name="check" size={13} />}
                  {busyId === selectedRequest.id && busyAction === 'note' ? 'Sending…' : 'Send note'}
                </Button>
                <span className="ca-field__hint">
                  The request will show as waiting for the citizen.
                </span>
              </section>
            </div>

            <div className="ca-areq-modal__actions">
              <Button type="button" variant="unstyled" size="sm" className="ca-row__no" onClick={() => { setDeclining(selectedRequest); setSelectedRequest(null); }} disabled={Boolean(busyId)}>
                Decline request
              </Button>
              <Button
                type="button"
                variant="unstyled"
                size="sm"
                className="ca-row__yes"
                onClick={async () => {
                  const accepted = await decide(selectedRequest.id, 'accept');
                  if (accepted) setSelectedRequest(null);
                }}
                disabled={Boolean(busyId)}
                aria-busy={busyId === selectedRequest.id && busyAction === 'decision'}
              >
                {busyId === selectedRequest.id && busyAction === 'decision' ? <Spinner data-icon="inline-start" /> : <Icon name="check" size={13} />}
                {busyId === selectedRequest.id && busyAction === 'decision' ? 'Accepting…' : 'Accept request'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {declining && (
        <ConfirmDialog
          destructive
          icon="document"
          title={`Decline ${declining.reference}?`}
          text="This request will go back to the admin to find another agent. The citizen may wait longer."
          confirmLabel="Decline it"
          loadingLabel="Declining…"
          onConfirm={confirmDecline}
          isLoading={busyId === declining.id && busyAction === 'decision'}
          onCancel={() => setDeclining(null)}
        />
      )}
    </>
  );
};

export default AgentRequests;
