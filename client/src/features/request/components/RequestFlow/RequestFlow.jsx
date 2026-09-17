import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import DocumentSchematic from '../../../../components/ui/DocumentSchematic/DocumentSchematic';
import { DOCUMENTS, UPLOAD_RULES } from '../../../../constants/documents';
import useAutoHeight from '../../../../hooks/useAutoHeight';
import { submitRequest } from '../../requestApi';
import { useAuth } from '../../../../context/authContext';
import './RequestFlow.css';

const STEPS = ['confirm', 'details', 'documents', 'review'];

const STEP_COPY = {
  confirm: {
    title: 'Before we start',
    lede: 'Here is exactly what this service needs and what it costs. Nothing is charged now — your agent confirms the final figure with you first.',
    next: 'Yes, continue',
  },
  details: {
    title: 'Your details',
    lede: 'Enough for an agent to reach you and to raise the application. Nothing more.',
    next: 'Continue to documents',
  },
  documents: {
    title: 'Attach your documents',
    lede: 'Attach what you have now. Anything missing can follow — your agent will tell you what is outstanding.',
    next: 'Review and submit',
  },
  review: {
    title: 'Check and submit',
    lede: 'One last look before this goes to an agent.',
    next: 'Submit request',
  },
};

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  district: '',
  address: '',
};

/** Digits only, ten of them, not starting with a leading zero or one. */
const isValidPhone = (value) => /^[6-9]\d{9}$/.test(value.replace(/\s/g, ''));
const isValidEmail = (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/**
 * The request flow.
 *
 * Four steps inside one dialog: confirm what is needed, give your details,
 * attach documents, then review. The card's height transitions between steps so
 * the frame never jumps, and the direction of travel is reflected in the slide,
 * so going back reads as going back.
 *
 * Auto-fills user details (name, phone, email) from logged-in user profile.
 */
const RequestFlow = ({ service, onClose }) => {
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [uploads, setUploads] = useState({});
  const [consent, setConsent] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedReference, setSubmittedReference] = useState(null);

  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const fileInputsRef = useRef({});
  const headingId = useId();

  // Auto-fill form with user data when component mounts
  useEffect(() => {
    if (user) {
      console.log('👤 [REQUEST-FLOW] Auto-filling form with user data:', {
        name: user.name,
        phone: user.phone?.replace('+91', ''),
        email: user.email,
      });

      setForm((current) => ({
        ...current,
        fullName: user.name || current.fullName,
        phone: user.phone ? user.phone.replace('+91', '') : current.phone,
        email: user.email || current.email,
      }));
    }
  }, [user]);

  const step = STEPS[stepIndex];
  const copy = STEP_COPY[step];
  const [contentRef, contentHeight] = useAutoHeight(`${step}-${isDone}`);

  const documents = useMemo(
    () => service.documents.map((key) => DOCUMENTS[key]).filter(Boolean),
    [service.documents],
  );

  const requiredDocuments = useMemo(() => documents.filter((doc) => !doc.optional), [documents]);

  /* Escape closes, and focus starts on the close control so a keyboard user is
     never dropped somewhere arbitrary inside the dialog. */
  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  /* Keeps tabbing inside the dialog rather than letting it wander into the page
     behind the scrim. */
  const onKeyDownTrap = (event) => {
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

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

  const errors = {
    fullName: form.fullName.trim().length < 2 ? 'Please enter your full name.' : null,
    phone: isValidPhone(form.phone) ? null : 'Enter a 10-digit mobile number.',
    email: isValidEmail(form.email) ? null : 'That email address does not look right.',
    district: form.district.trim() === '' ? 'Which district are you applying in?' : null,
  };

  const detailsValid = !errors.fullName && !errors.phone && !errors.email && !errors.district;

  const canAdvance = () => {
    if (step === 'details') return detailsValid;
    if (step === 'review') return consent;
    return true;
  };

  const goNext = async () => {
    if (step === 'details' && !detailsValid) {
      setTouched({ fullName: true, phone: true, email: true, district: true });
      return;
    }

    if (step === 'review') {
      // Submit request to backend
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await submitRequest(
          service.id, // serviceId like 'income-certificate'
          form, // applicantDetails object
          Object.keys(uploads) // document names array
        );

        // Success: show confirmation with reference number
        setSubmittedReference(response.data.request.reference);
        setIsDone(true);
      } catch (error) {
        // Show error message
        setSubmitError(
          error.response?.data?.message || 'Failed to submit request. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setDirection('forward');
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection('back');
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const setField = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
  };

  const blurField = (name) => () => setTouched((current) => ({ ...current, [name]: true }));

  const onPickFile = (docId) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploads((current) => ({ ...current, [docId]: file.name }));
  };

  const attachedCount = Object.keys(uploads).length;

  return (
    <div
      className="ca-rf__scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="ca-rf"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={onKeyDownTrap}
      >
        <header className="ca-rf__head">
          <div className="ca-rf__head-top">
            <span className="ca-rf__icon">
              <Icon name={service.icon} size={19} />
            </span>

            <div className="ca-rf__titles">
              <h2 className="ca-rf__service" id={headingId}>
                {isDone ? 'Request received' : copy.title}
              </h2>
              {!isDone && (
                <p className="ca-rf__step-of">
                  {service.name} · step <span data-numeric>{stepIndex + 1}</span> of{' '}
                  <span data-numeric>{STEPS.length}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              className="ca-rf__close"
              onClick={onClose}
              ref={closeRef}
              aria-label="Close and discard this request"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {!isDone && (
            <div className="ca-rf__progress" aria-hidden="true">
              {STEPS.map((name, index) => (
                <span
                  key={name}
                  className={`ca-rf__seg ${
                    index < stepIndex ? 'is-done' : index === stepIndex ? 'is-current' : ''
                  }`.trim()}
                >
                  <span className="ca-rf__seg-fill" />
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="ca-rf__viewport">
          <div
            className="ca-rf__sizer"
            style={contentHeight ? { '--ca-vh': `${contentHeight}px` } : undefined}
          >
            <div ref={contentRef}>
            {isDone ? (
              <div className="ca-rf__done">
                <span className="ca-rf__done-seal">
                  <Icon name="check" size={26} />
                </span>

                <h3 className="ca-rf__done-title">That is with us</h3>

                <p className="ca-rf__done-text">
                  A verified agent will pick this up and confirm the exact charge with you before
                  any work starts. You can follow the status from Track request.
                </p>

                <span className="ca-rf__ref" data-numeric>
                  {submittedReference || 'Submitting...'}
                </span>
              </div>
            ) : (
              <div className="ca-rf__step" data-dir={direction} key={step}>
                {/* ---- 1. Confirm ------------------------------------------- */}
                {step === 'confirm' && (
                  <>
                    <p className="ca-rf__lede">{copy.lede}</p>

                    <p className="ca-label ca-rf__section-title">
                      What you will need · {requiredDocuments.length} required
                    </p>

                    <ul className="ca-rf__reqs">
                      {documents.map((doc) => (
                        <li className="ca-rf__req" key={doc.id}>
                          <span className="ca-rf__req-thumb">
                            <DocumentSchematic type={doc.schematic} />
                          </span>

                          <span className="ca-rf__req-body">
                            <span className="ca-rf__req-name">{doc.name}</span>
                            <span className="ca-rf__req-fmt">
                              {doc.formats.join(' · ')} · up to {doc.maxSizeMb} MB
                            </span>
                          </span>

                          {doc.optional && <span className="ca-rf__req-flag">If it applies</span>}
                        </li>
                      ))}
                    </ul>

                    <div className="ca-rf__charge">
                      <span className="ca-rf__icon">
                        <Icon name="shieldCheck" size={19} />
                      </span>

                      <span className="ca-rf__charge-body">
                        <span className="ca-label ca-rf__charge-key">Assistance charge</span>
                        <span className="ca-rf__charge-value" data-numeric>
                          {service.charge}
                        </span>
                        <span className="ca-rf__charge-note">
                          Our fee only, separate from the government fee. Issued by{' '}
                          {service.issuedBy}.
                        </span>
                      </span>
                    </div>
                  </>
                )}

                {/* ---- 2. Details ------------------------------------------- */}
                {step === 'details' && (
                  <>
                    <p className="ca-rf__lede">{copy.lede}</p>

                    <div className="ca-rf__fields">
                      <div className="ca-rf__field">
                        <label className="ca-rf__label" htmlFor={`${headingId}-name`}>
                          Full name <span className="ca-rf__req-star">*</span>
                        </label>
                        <input
                          id={`${headingId}-name`}
                          className="ca-rf__input"
                          value={form.fullName}
                          onChange={setField('fullName')}
                          onBlur={blurField('fullName')}
                          placeholder="As it appears on your Aadhaar"
                          autoComplete="name"
                          aria-invalid={Boolean(touched.fullName && errors.fullName)}
                        />
                        {touched.fullName && errors.fullName && (
                          <span className="ca-rf__error">{errors.fullName}</span>
                        )}
                      </div>

                      <div className="ca-rf__row">
                        <div className="ca-rf__field">
                          <label className="ca-rf__label" htmlFor={`${headingId}-phone`}>
                            Mobile <span className="ca-rf__req-star">*</span>
                          </label>
                          <input
                            id={`${headingId}-phone`}
                            className="ca-rf__input"
                            value={form.phone}
                            onChange={setField('phone')}
                            onBlur={blurField('phone')}
                            placeholder="10 digits"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            aria-invalid={Boolean(touched.phone && errors.phone)}
                          />
                          {touched.phone && errors.phone && (
                            <span className="ca-rf__error">{errors.phone}</span>
                          )}
                        </div>

                        <div className="ca-rf__field">
                          <label className="ca-rf__label" htmlFor={`${headingId}-district`}>
                            District <span className="ca-rf__req-star">*</span>
                          </label>
                          <input
                            id={`${headingId}-district`}
                            className="ca-rf__input"
                            value={form.district}
                            onChange={setField('district')}
                            onBlur={blurField('district')}
                            placeholder="Where you are applying"
                            aria-invalid={Boolean(touched.district && errors.district)}
                          />
                          {touched.district && errors.district && (
                            <span className="ca-rf__error">{errors.district}</span>
                          )}
                        </div>
                      </div>

                      <div className="ca-rf__field">
                        <label className="ca-rf__label" htmlFor={`${headingId}-email`}>
                          Email <span className="ca-rf__req-fmt">optional</span>
                        </label>
                        <input
                          id={`${headingId}-email`}
                          className="ca-rf__input"
                          type="email"
                          value={form.email}
                          onChange={setField('email')}
                          onBlur={blurField('email')}
                          placeholder="For written updates"
                          autoComplete="email"
                          aria-invalid={Boolean(touched.email && errors.email)}
                        />
                        {touched.email && errors.email && (
                          <span className="ca-rf__error">{errors.email}</span>
                        )}
                      </div>
                    </div>

                    <p className="ca-rf__note">
                      Your agent uses these to reach you and to fill the application. We do not
                      share them outside the office handling your file.
                    </p>
                  </>
                )}

                {/* ---- 3. Documents ---------------------------------------- */}
                {step === 'documents' && (
                  <>
                    <p className="ca-rf__lede">{copy.lede}</p>

                    <div className="ca-rf__uploads">
                      {documents.map((doc) => {
                        const fileName = uploads[doc.id];

                        return (
                          <div key={doc.id}>
                            <button
                              type="button"
                              className={`ca-rf__slot ${fileName ? 'is-filled' : ''}`.trim()}
                              onClick={() => fileInputsRef.current[doc.id]?.click()}
                            >
                              <span className="ca-rf__slot-mark">
                                <Icon name={fileName ? 'check' : 'document'} size={17} />
                              </span>

                              <span className="ca-rf__slot-body">
                                <span className="ca-rf__slot-name">
                                  {doc.name}
                                  {doc.optional ? ' · if it applies' : ''}
                                </span>
                                <span className="ca-rf__slot-hint">
                                  {fileName ?? `${doc.formats.join(' · ')} · up to ${doc.maxSizeMb} MB`}
                                </span>
                              </span>

                              <span className="ca-rf__slot-action">
                                {fileName ? 'Replace' : 'Attach'}
                              </span>
                            </button>

                            <input
                              type="file"
                              hidden
                              ref={(node) => {
                                fileInputsRef.current[doc.id] = node;
                              }}
                              accept={doc.formats
                                .map((format) =>
                                  format === 'PDF' ? 'application/pdf' : `image/${format.toLowerCase()}`,
                                )
                                .join(',')}
                              onChange={onPickFile(doc.id)}
                              aria-label={`Attach ${doc.name}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <p className="ca-rf__note">
                      {UPLOAD_RULES.guidance} Aim for {UPLOAD_RULES.minDpi} dpi or better if you are
                      scanning.
                    </p>
                  </>
                )}

                {/* ---- 4. Review ------------------------------------------- */}
                {step === 'review' && (
                  <>
                    <p className="ca-rf__lede">{copy.lede}</p>

                    <div className="ca-rf__summary">
                      <div className="ca-rf__summary-row">
                        <span className="ca-label ca-rf__summary-key">Service</span>
                        <span className="ca-rf__summary-value">{service.name}</span>
                      </div>
                      <div className="ca-rf__summary-row">
                        <span className="ca-label ca-rf__summary-key">Name</span>
                        <span className="ca-rf__summary-value">{form.fullName}</span>
                      </div>
                      <div className="ca-rf__summary-row">
                        <span className="ca-label ca-rf__summary-key">Mobile</span>
                        <span className="ca-rf__summary-value" data-numeric>
                          {form.phone}
                        </span>
                      </div>
                      <div className="ca-rf__summary-row">
                        <span className="ca-label ca-rf__summary-key">District</span>
                        <span className="ca-rf__summary-value">{form.district}</span>
                      </div>
                      <div className="ca-rf__summary-row">
                        <span className="ca-label ca-rf__summary-key">Attached</span>
                        <span className="ca-rf__summary-value" data-numeric>
                          {attachedCount} of {documents.length}
                        </span>
                      </div>
                      <div className="ca-rf__summary-row">
                        <span className="ca-label ca-rf__summary-key">Charge</span>
                        <span className="ca-rf__summary-value" data-numeric>
                          {service.charge}
                        </span>
                      </div>
                    </div>

                    <label className="ca-rf__consent">
                      <input
                        type="checkbox"
                        className="ca-rf__check"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                      />
                      <span className="ca-rf__consent-text">
                        I understand Citizen Assist provides assistance only, that the certificate is
                        issued by {service.issuedBy}, and that the charge above is separate from any
                        government fee.
                      </span>
                    </label>
                  </>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        {!isDone && (
          <footer className="ca-rf__foot">
            {stepIndex > 0 && (
              <button type="button" className="ca-rf__back" onClick={goBack} disabled={isSubmitting}>
                <Icon name="arrowRight" size={15} />
                Back
              </button>
            )}

            {submitError && (
              <p className="ca-rf__error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {submitError}
              </p>
            )}

            <button
              type="button"
              className="ca-pill ca-pill--solid ca-rf__next"
              onClick={goNext}
              aria-disabled={!canAdvance() || isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : copy.next}
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </button>
          </footer>
        )}

        {isDone && (
          <footer className="ca-rf__foot">
            <button type="button" className="ca-pill ca-pill--solid ca-rf__next" onClick={onClose}>
              Done
              <span className="ca-pill__disc">
                <Icon name="check" size={15} />
              </span>
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default RequestFlow;
