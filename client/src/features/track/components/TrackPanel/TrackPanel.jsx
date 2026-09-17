import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { getServiceById } from '../../../../constants/services';
import {
  STATUS_ASIDE,
  TOTAL_STAGES,
  getStatus,
} from '../../../../constants/requests';
import {
  createComplaint,
  getMyRequests,
  updateMyRequest,
  uploadRequestDocument,
} from '../../../request/requestApi';
import './TrackPanel.css';

/**
 * Maps a status to the tone its pill and progress bar use. Kept as a function
 * rather than baked into the data so the same status can look different in
 * different places later without editing the records.
 */
const toneFor = (statusId) => {
  if (statusId === 'completed') return 'done';
  if (STATUS_ASIDE[statusId]) return STATUS_ASIDE[statusId].tone;
  return 'open';
};

const StatusPill = ({ statusId }) => {
  const status = getStatus(statusId);

  return (
    <span className={`ca-status ca-status--${toneFor(statusId)}`}>
      <span className="ca-status__dot" />
      {status.label}
    </span>
  );
};

/** Five segments, filled up to whatever stage the request has reached. */
const ProgressBar = ({ statusId }) => {
  const status = getStatus(statusId);
  const tone = toneFor(statusId);

  // A request sitting outside the pipeline shows its last known stage instead.
  const reached = status.position || 2;

  const fillClass =
    tone === 'done' ? 'is-filled-done' : tone === 'open' ? 'is-filled' : 'is-filled-warn';

  return (
    <span className="ca-track__bar" aria-hidden="true">
      {Array.from({ length: TOTAL_STAGES }, (_, index) => (
        <span
          key={index}
          className={`ca-track__bar-seg ${index < reached ? fillClass : ''}`.trim()}
        />
      ))}
    </span>
  );
};

const EmptyState = () => (
  <div className="ca-track__empty">
    <span className="ca-track__empty-mark">
      <Icon name="track" size={22} />
    </span>

    <h2 className="ca-track__empty-title">No requests yet</h2>

    <p className="ca-track__empty-text">
      When you start a request, it will appear here with its status and everything your agent has
      added to it.
    </p>

    <Link className="ca-pill ca-pill--solid ca-track__empty-cta" to="/#services">
      Browse services
      <span className="ca-pill__disc">
        <Icon name="arrowRight" size={15} />
      </span>
    </Link>
  </div>
);

/**
 * Track a request.
 *
 * Shows all requests submitted by logged-in citizen, fetched from backend.
 */
const TrackPanel = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState({ fullName: '', phone: '', email: '', district: '', address: '' });
  const [editFiles, setEditFiles] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const fileInputRef = useRef(null);

  // Fetch requests on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getMyRequests();
        setRequests(response.data.requests);
        setActiveId(response.data.requests[0]?._id || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load requests.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const active = requests.find((request) => request.id === activeId) ?? requests[0];

  useEffect(() => {
    if (!active) return;
    setEditDetails(active.applicantDetails || { fullName: '', phone: '', email: '', district: '', address: '' });
    setIsEditing(false);
    setEditFiles([]);
    setEditMessage('');
  }, [active?.id]);

  const refreshRequests = async () => {
    const response = await getMyRequests();
    setRequests(response.data.requests);
  };

  const saveRequestEdit = async (event) => {
    event.preventDefault();
    if (!active || !editDetails.fullName?.trim() || !editDetails.phone?.trim() || !editDetails.district?.trim()) return;

    try {
      setIsSavingEdit(true);
      setEditMessage('');
      await updateMyRequest(active.id, editDetails);
      for (const file of editFiles) await uploadRequestDocument(active.id, file);
      await refreshRequests();
      setIsEditing(false);
      setEditFiles([]);
      setEditMessage('Request updated and sent to your agent.');
    } catch (requestError) {
      setEditMessage(requestError.response?.data?.message || 'Could not update this request.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const submitComplaint = async (event) => {
    event.preventDefault();
    if (!complaintSubject.trim() || !complaintDescription.trim()) return;

    try {
      setIsSubmittingComplaint(true);
      setComplaintMessage('');
      await createComplaint(active.id, complaintSubject, complaintDescription);
      setComplaintSubject('');
      setComplaintDescription('');
      setComplaintMessage('Complaint submitted. An admin will review it.');
      console.info('[citizen] complaint submitted', active.reference);
    } catch (requestError) {
      console.error('[citizen] complaint submission failed', requestError);
      setComplaintMessage(
        requestError.response?.data?.message || 'Could not submit complaint.',
      );
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ca-track">
        <div className="ca-track__head">
          <h1 className="ca-track__title">Track a request</h1>
          <p className="ca-track__lede">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ca-track">
        <div className="ca-track__head">
          <h1 className="ca-track__title">Track a request</h1>
          <p className="ca-track__lede" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-track">
      <div className="ca-track__head">
        <h1 className="ca-track__title">Track a request</h1>

        <p className="ca-track__lede">
          Every request you have placed, with where it has got to and what your agent has said about
          it.
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="ca-track__body">
          <ul className="ca-track__list">
            {requests.map((request) => {
              const service = getServiceById(request.serviceId);

              return (
                <li key={request.id}>
                  <button
                    type="button"
                    className={`ca-track__item ${request.id === active.id ? 'is-active' : ''}`.trim()}
                    onClick={() => setActiveId(request.id)}
                    aria-pressed={request.id === active.id}
                  >
                    <span className="ca-track__item-top">
                      <span className="ca-track__item-service">{service?.name}</span>
                      <span className="ca-track__item-ref" data-numeric>
                        {request.reference}
                      </span>
                    </span>

                    <StatusPill statusId={request.status} />
                    <ProgressBar statusId={request.status} />

                    <span className="ca-track__item-meta">
                      <span data-numeric>Placed {request.createdAt}</span>
                      <span>{request.agentName ? `Agent ${request.agentName}` : 'No agent yet'}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Keyed on the request so the panel replays its entrance on change. */}
          <div className="ca-track__detail" key={active.id}>
            <div className="ca-track__detail-head">
              <h2 className="ca-track__detail-service">{getServiceById(active.serviceId)?.name}</h2>
              <StatusPill statusId={active.status} />
            </div>

            <dl className="ca-track__facts">
              <div className="ca-track__fact">
                <dt className="ca-label ca-track__fact-key">Reference</dt>
                <dd className="ca-track__fact-value" data-numeric>
                  {active.reference}
                </dd>
              </div>

              <div className="ca-track__fact">
                <dt className="ca-label ca-track__fact-key">Agent</dt>
                <dd className="ca-track__fact-value">{active.agentName ?? 'Not assigned yet'}</dd>
              </div>

              <div className="ca-track__fact">
                <dt className="ca-label ca-track__fact-key">Charge</dt>
                <dd className="ca-track__fact-value" data-numeric>
                  {active.charge}
                </dd>
              </div>

              <div className="ca-track__fact">
                <dt className="ca-label ca-track__fact-key">Placed</dt>
                <dd className="ca-track__fact-value" data-numeric>
                  {active.createdAt}
                </dd>
              </div>
            </dl>

            <ol className="ca-timeline">
              {active.timeline.map((entry) => (
                <li className="ca-timeline__row" key={`${entry.status}-${entry.at}`}>
                  <span className="ca-timeline__mark">
                    <Icon name="check" size={13} />
                  </span>

                  <span className="ca-timeline__top">
                    <span className="ca-timeline__label">{getStatus(entry.status).label}</span>
                    <span className="ca-timeline__at" data-numeric>
                      {entry.at}
                    </span>
                  </span>

                  <span className="ca-timeline__note">{entry.note}</span>
                </li>
              ))}
            </ol>

            {!['completed', 'cancelled', 'rejected'].includes(active.status) && (
              <section className="ca-track__edit">
                <div className="ca-track__edit-head">
                  <div>
                    <h3 className="ca-track__complaint-title">Need to correct something?</h3>
                    <p className="ca-track__edit-note">Update your information or send the missing documents requested by your agent.</p>
                  </div>
                  <button type="button" className="ca-pill" onClick={() => setIsEditing((current) => !current)}>
                    {isEditing ? 'Close' : 'Edit request'}
                  </button>
                </div>

                {isEditing && (
                  <form className="ca-track__edit-form" onSubmit={saveRequestEdit}>
                    {['fullName', 'phone', 'email', 'district', 'address'].map((field) => (
                      <label className="ca-field" key={field}>
                        <span className="ca-field__label">{field === 'fullName' ? 'Full name' : field[0].toUpperCase() + field.slice(1)}</span>
                        {field === 'address' ? (
                          <textarea className="ca-field__area" value={editDetails[field] || ''} onChange={(event) => setEditDetails((current) => ({ ...current, [field]: event.target.value }))} />
                        ) : (
                          <input className="ca-field__input" value={editDetails[field] || ''} onChange={(event) => setEditDetails((current) => ({ ...current, [field]: event.target.value }))} required={['fullName', 'phone', 'district'].includes(field)} />
                        )}
                      </label>
                    ))}
                    
                    <div className="ca-track__file-section">
                      <span className="ca-field__label">Add missing documents</span>
                      <button
                        type="button"
                        className={`ca-track__file-slot ${editFiles.length > 0 ? 'is-filled' : ''}`.trim()}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span className="ca-track__file-mark">
                          <Icon name={editFiles.length > 0 ? 'check' : 'document'} size={17} />
                        </span>
                        
                        <span className="ca-track__file-body">
                          <span className="ca-track__file-name">
                            {editFiles.length > 0 
                              ? `${editFiles.length} document${editFiles.length > 1 ? 's' : ''} selected`
                              : 'Choose documents to upload'
                            }
                          </span>
                          <span className="ca-track__file-hint">
                            {editFiles.length > 0 
                              ? editFiles.map(f => f.name).join(', ')
                              : 'PDF, JPG, PNG · Multiple files allowed'
                            }
                          </span>
                        </span>
                        
                        <span className="ca-track__file-action">
                          {editFiles.length > 0 ? 'Change' : 'Attach'}
                        </span>
                      </button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        hidden
                        onChange={(event) => setEditFiles(Array.from(event.target.files || []))}
                      />
                    </div>
                    
                    <button type="submit" className="ca-pill ca-pill--solid" disabled={isSavingEdit}>
                      {isSavingEdit ? 'Sending...' : 'Save and send to agent'}
                    </button>
                  </form>
                )}
                {editMessage && <p role="status">{editMessage}</p>}
              </section>
            )}

            <form className="ca-track__complaint" onSubmit={submitComplaint}>
              <h3 className="ca-track__complaint-title">Need help with this request?</h3>
              <input
                className="ca-field__input"
                value={complaintSubject}
                onChange={(event) => setComplaintSubject(event.target.value)}
                placeholder="Complaint subject"
                aria-label="Complaint subject"
              />
              <textarea
                className="ca-field__area"
                value={complaintDescription}
                onChange={(event) => setComplaintDescription(event.target.value)}
                placeholder="Tell us what went wrong"
                aria-label="Complaint details"
                required
              />
              <button
                type="submit"
                className="ca-pill ca-pill--solid"
                disabled={isSubmittingComplaint || !complaintSubject.trim() || !complaintDescription.trim()}
              >
                {isSubmittingComplaint ? 'Sending...' : 'Raise complaint'}
              </button>
              {complaintMessage && <p role="status">{complaintMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPanel;
