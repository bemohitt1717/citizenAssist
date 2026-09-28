import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar/Navbar";
import Footer from "../components/common/Footer/Footer";
import { LEGAL_DRAFT_NOTE, POLICIES } from "../constants/legalPolicies";
import "./LegalPage.css";

const LegalPage = ({ policy }) => {
  const content = POLICIES[policy] ?? POLICIES.terms;

  return (
    <>
      <Navbar />
      <main className="ca-legal">
        <div className="ca-legal__inner">
          <Link className="ca-legal__back" to="/">Back to Citizen Assist</Link>
          <h1>{content.title}</h1>
          <p className="ca-legal__intro">{content.intro}</p>
          <p className="ca-legal__draft">{LEGAL_DRAFT_NOTE}</p>

          <article className="ca-legal__sections">
            {content.sections.map((section) => (
              <section className="ca-legal__section" key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegalPage;
