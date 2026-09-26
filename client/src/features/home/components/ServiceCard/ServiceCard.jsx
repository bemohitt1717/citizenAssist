import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { useRequestFlow } from '../../../request/requestFlowContext';
import './ServiceCard.css';

/**
 * One service tile.
 *
 * Every card has the same structure — mark and duration on the top line, the
 * name at display scale, what the document is actually for, then the two
 * figures and the two routes out. The variety across the grid comes from
 * `tone`, not from six different layouts, so the set stays scannable while
 * no row reads as a matching shelf.
 */
const ServiceCard = ({ service, index }) => {
  const { id, name, icon, summary, charge, timeline, documentCount, tone } = service;
  const { openRequest } = useRequestFlow();

  return (
    <article className={`ca-svc ca-svc--${tone}`} style={{ '--ca-i': index }} data-glow>
      <div className="ca-svc__top">
        <span className="ca-svc__icon">
          <Icon name={icon} size={22} />
        </span>

        <span className="ca-svc__clock" data-numeric>
          <Icon name="clock" size={14} />
          {timeline}
        </span>
      </div>

      <h3 className="ca-svc__name">{name}</h3>

      <p className="ca-svc__summary">{summary}</p>

      <dl className="ca-svc__meta">
        <div className="ca-svc__stat">
          <dt className="ca-label ca-svc__stat-key">Agent fee</dt>
          <dd className="ca-svc__stat-value" data-numeric>
            {charge}
          </dd>
        </div>

        <div className="ca-svc__stat">
          <dt className="ca-label ca-svc__stat-key">Documents</dt>
          <dd className="ca-svc__stat-value" data-numeric>
            {documentCount} documents
          </dd>
        </div>
      </dl>

      <div className="ca-svc__actions">
        {/* Opens the request dialog in place — a citizen who has already read
            the card should not lose it to a page load. */}
        <button
          type="button"
          className="ca-pill ca-pill--solid ca-svc__go"
          onClick={() => openRequest(id)}
          aria-label={`Start a ${name} request`}
        >
          Start request
          <span className="ca-pill__disc">
            <Icon name="arrowRight" size={15} />
          </span>
        </button>

        <Link
          className="ca-svc__details"
          to={`/services/${id}`}
          aria-label={`See full details for ${name}`}
        >
          Service details
          <Icon name="arrowUpRight" size={16} />
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
