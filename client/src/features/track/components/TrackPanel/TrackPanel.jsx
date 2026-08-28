import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { getServiceById } from '../../../../constants/services';
import {
  DEMO_REQUESTS,
  STATUS_ASIDE,
  TOTAL_STAGES,
  getStatus,
} from '../../../../constants/requests';
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
 * ── WIRING THIS UP ──────────────────────────────────────────────────────────
 * Replace `DEMO_REQUESTS` with whatever the API returns. The shape it needs is
 * documented at the top of constants/requests.js, and it is one flat document
 * per request with an append-only `timeline` array — no joins.
 *
 * The empty state is not a placeholder for later: it is the state a real account
 * opens in, so it is built now and renders whenever the list is empty.
 */
const TrackPanel = () => {
  const requests = DEMO_REQUESTS;
  const [activeId, setActiveId] = useState(requests[0]?.id ?? null);

  const active = requests.find((request) => request.id === activeId) ?? requests[0];

  return (
    <div className="ca-track">
      <div className="ca-track__head">
        <h1 className="ca-track__title">Track a request</h1>

        <p className="ca-track__lede">
          Every request you have placed, with where it has got to and what your agent has said about
          it.
        </p>

        {requests.length > 0 && (
          <p className="ca-track__demo">
            <Icon name="shieldCheck" size={13} />
            Sample data
          </p>
        )}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPanel;
