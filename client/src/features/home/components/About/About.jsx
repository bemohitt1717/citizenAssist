import Icon from '../../../../components/ui/Icon/Icon';
import { FRICTIONS, VERIFICATION_STEPS } from '../../../../constants/about';
import useReveal from '../../../../hooks/useReveal';
import './About.css';

/**
 * About.
 *
 * Set as a ledger rather than a card grid — the services section is already
 * cards, and repeating the container here would make the page read as one
 * template applied twice. It also carries no counters, testimonials or team
 * photos, because none of those exist yet and the whole product rests on not
 * overstating itself. What is left is the mechanism, which is the honest
 * trust argument anyway.
 */
const About = () => {
  const [ledgerRef, isRevealed] = useReveal();

  return (
    <section className="ca-about" id="about">
      <div className="ca-about__inner">
        <header className="ca-about__head">
          <h2 className="ca-about__title">
            Not a government office. The help you need for dealing with one.
          </h2>

          <p className="ca-about__lede">
            Citizen Assist is independent. We do not issue certificates. We list the documents and
            fees, connect you with a checked agent, and let you follow your request.
          </p>
        </header>

        <div
          ref={ledgerRef}
          className={`ca-ledger ${isRevealed ? 'is-revealed' : ''}`.trim()}
        >
          {FRICTIONS.map((friction, index) => (
            <div key={friction.id} className="ca-ledger__row" style={{ '--ca-i': index }}>
              <p className="ca-ledger__problem">{friction.problem}</p>

              <span className="ca-ledger__turn" aria-hidden="true">
                <Icon name="arrowRight" size={18} />
              </span>

              <p className="ca-ledger__response">{friction.response}</p>
            </div>
          ))}
        </div>

        <div className="ca-chain">
          <h3 className="ca-chain__title">
            We check every agent before they receive a request.
          </h3>

          <ol className="ca-chain__rail">
            {VERIFICATION_STEPS.map((step, index) => (
              <li key={step.id} className="ca-chain__stop">
                <span className="ca-label ca-chain__num" data-numeric>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="ca-chain__label">{step.label}</p>
                <p className="ca-chain__detail">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default About;
