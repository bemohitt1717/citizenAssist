import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import Logo from '../../../../components/common/Logo/Logo';
import DocumentSchematic from '../../../../components/ui/DocumentSchematic/DocumentSchematic';
import { DOCUMENTS } from '../../../../constants/documents';
import { useRequestFlow } from '../../../request/requestFlowContext';
import './DetailPanel.css';

/**
 * The service detail surface.
 *
 * Deliberately one viewport with no footer: a citizen is here to decide whether
 * to start, so the heading, the charge, the duration and the action stay
 * permanently in view. The document list is the only scrolling region.
 *
 * The right half is a live preview driven by the list — selecting a document
 * shows its layout, what part of it to capture, and the file formats accepted.
 * That is the detail that actually stops a submission bouncing back, and it is
 * the reason this page exists rather than a longer card.
 */
const DetailPanel = ({ service }) => {
  const { openRequest } = useRequestFlow();

  const documents = useMemo(
    () => service.documents.map((key) => DOCUMENTS[key]).filter(Boolean),
    [service.documents],
  );

  const [activeId, setActiveId] = useState(documents[0]?.id);
  const activeDoc = documents.find((doc) => doc.id === activeId) ?? documents[0] ?? null;

  return (
    <div className="ca-detail">
      <div className="ca-detail__shell">
        <div className="ca-detail__bar">
          <Link className="ca-detail__back" to="/#services">
            <Icon name="arrowRight" size={15} />
            All services
          </Link>

          <Link className="ca-detail__bar-logo" to="/" aria-label="Citizen Assist, home">
            <Logo size={26} />
          </Link>
        </div>

        <div className="ca-detail__body">
          <div className="ca-detail__main">
            <h1 className="ca-detail__title">{service.name}</h1>
            <p className="ca-detail__summary">{service.summary}</p>

            <dl className="ca-detail__facts">
              <div className="ca-detail__fact">
                <dt className="ca-label ca-detail__fact-key">Agent fee</dt>
                <dd className="ca-detail__fact-value" data-numeric>
                  {service.charge}
                </dd>
              </div>

              <div className="ca-detail__fact">
                <dt className="ca-label ca-detail__fact-key">Usually takes</dt>
                <dd className="ca-detail__fact-value" data-numeric>
                  {service.timeline}
                </dd>
              </div>

              <div className="ca-detail__fact">
                <dt className="ca-label ca-detail__fact-key">Valid for</dt>
                <dd className="ca-detail__fact-value">{service.validity}</dd>
              </div>

              {/* Named on every detail page, because the issuing office is
                  never us. */}
              <div className="ca-detail__fact ca-detail__fact--wide">
                <dt className="ca-label ca-detail__fact-key">Issued by</dt>
                <dd className="ca-detail__fact-value">{service.issuedBy}</dd>
              </div>
            </dl>

            <ul className="ca-detail__uses">
              {service.usedFor.map((use) => (
                <li className="ca-detail__use" key={use}>
                  {use}
                </li>
              ))}
            </ul>

            <div className="ca-detail__docs-head">
              <h2 className="ca-label ca-detail__fact-key">
                Documents · <span data-numeric>{documents.length}</span>
              </h2>
              <p className="ca-detail__docs-hint">Choose a document to see an example</p>
            </div>

            <ul className="ca-detail__docs">
              {documents.map((doc, index) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    className={`ca-detail__doc ${doc.id === activeId ? 'is-active' : ''}`.trim()}
                    onClick={() => setActiveId(doc.id)}
                    aria-pressed={doc.id === activeId}
                  >
                    <span className="ca-label ca-detail__doc-num" data-numeric>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="ca-detail__doc-name">{doc.name}</span>

                    {doc.optional && <span className="ca-detail__doc-flag">If it applies</span>}
                  </button>
                </li>
              ))}
            </ul>

            <div className="ca-detail__action">
              <button
                type="button"
                className="ca-pill ca-pill--solid ca-detail__start"
                onClick={() => openRequest(service.id)}
              >
                Start request
                <span className="ca-pill__disc">
                  <Icon name="arrowRight" size={15} />
                </span>
              </button>

              <p className="ca-detail__action-note">
                No payment now. Your agent confirms the fee first.
              </p>
            </div>
          </div>

          <div className="ca-detail__preview">
            {activeDoc ? (
              <>
                <div className="ca-detail__stage">
                  {/* Keyed on the document so the drawing and caption replay their
                      entrance on every change. */}
                  <div className="ca-detail__drawing" key={`${activeDoc.id}-art`}>
                    <DocumentSchematic type={activeDoc.schematic} />
                  </div>
                </div>

                <div className="ca-detail__caption" key={`${activeDoc.id}-caption`}>
                  <h3 className="ca-detail__caption-name">{activeDoc.name}</h3>
                  <p className="ca-detail__caption-what">{activeDoc.what}</p>

                  <p className="ca-detail__capture">
                    <Icon name="check" size={14} />
                    {activeDoc.capture}
                  </p>

                  <div className="ca-detail__formats">
                    {activeDoc.formats.map((format) => (
                      <span className="ca-detail__format" key={format}>
                        {format}
                      </span>
                    ))}
                    <span className="ca-detail__size" data-numeric>
                      up to {activeDoc.maxSizeMb} MB
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="ca-detail__stage" role="status">
                <p className="ca-detail__docs-hint">No example is available for this document.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Shown for an unknown service id. Lives in this file so it shares the
 * stylesheet import — declared separately it would render unstyled in
 * development, where a component's CSS only loads once that component mounts.
 */
export const ServiceMissing = () => (
  <div className="ca-detail">
    <div className="ca-detail__shell">
      <div className="ca-detail__missing">
        <h1 className="ca-detail__missing-title">We do not have that service</h1>

        <p className="ca-detail__missing-text">
          See all services on the home page.
        </p>

        <Link className="ca-pill ca-pill--solid ca-detail__start" to="/#services">
          View services
          <span className="ca-pill__disc">
            <Icon name="arrowRight" size={15} />
          </span>
        </Link>
      </div>
    </div>
  </div>
);

export default DetailPanel;
