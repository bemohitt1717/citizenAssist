import { useEffect, useId, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { LEGAL_DRAFT_NOTE, POLICIES } from "../../../../constants/legalPolicies";
import "./LegalConsentDialog.css";

/**
 * Full policy copy in a modal for signup consent.
 * Accept checks the matching agreement; Decline clears it and closes.
 */
const LegalConsentDialog = ({ policyKey, onAccept, onDecline }) => {
  const content = POLICIES[policyKey] ?? POLICIES.terms;
  const declineRef = useRef(null);
  const dialogRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    declineRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDecline();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onDecline]);

  return (
    <div
      className="ca-legal-dialog__scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDecline();
      }}
    >
      <div
        className="ca-legal-dialog"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <header className="ca-legal-dialog__head">
          <h2 className="ca-legal-dialog__title" id={headingId}>
            {content.title}
          </h2>
          <p className="ca-legal-dialog__intro">{content.intro}</p>
          <p className="ca-legal-dialog__draft">{LEGAL_DRAFT_NOTE}</p>
        </header>

        <div className="ca-legal-dialog__body">
          <article className="ca-legal-dialog__sections">
            {content.sections.map((section) => (
              <section className="ca-legal-dialog__section" key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </article>
        </div>

        <div className="ca-legal-dialog__actions">
          <Button
            type="button"
            variant="unstyled"
            className="ca-legal-dialog__decline"
            onClick={onDecline}
            ref={declineRef}
          >
            Decline
          </Button>
          <Button
            type="button"
            variant="unstyled"
            className="ca-legal-dialog__accept"
            onClick={onAccept}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegalConsentDialog;
