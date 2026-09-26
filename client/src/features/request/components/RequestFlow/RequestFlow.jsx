import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import DocumentSchematic from '../../../../components/ui/DocumentSchematic/DocumentSchematic';
import { DOCUMENTS, UPLOAD_RULES } from '../../../../constants/documents';
import useAutoHeight from '../../../../hooks/useAutoHeight';
import { submitRequest, uploadRequestDocument } from '../../requestApi';
import { useAuth } from '../../../../context/authContext';
import './RequestFlow.css';

const STEPS = ['confirm', 'details', 'documents', 'review'];

const STEP_COPY = {
  confirm: {
    title: 'Before we start',
    lede: 'See what you need and the fee range. You do not pay now. Your agent confirms the fee first.',
    next: 'Continue',
  },
  details: {
    title: 'Your details',
    lede: 'Tell us how to reach you.',
    next: 'Continue',
  },
  documents: {
    title: 'Attach your documents',
    lede: 'Add the documents you have. You can send the rest later.',
    next: 'Continue',
  },
  review: {
    title: 'Check and submit',
    lede: 'Check your details before sending.',
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
  const [fileErrors, setFileErrors] = useState({});
  const [consent, setConsent] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedReference, setSubmittedReference] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadWarning, setUploadWarning] = useState('');

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
      if (!consent || isSubmitting) return;
      setIsSubmitting(true);
      setSubmitError(null);
      setUploadWarning('');
      setUploadProgress(null);

      try {
        const response = await submitRequest(service.id, form, []);
        const request = response.data?.request;
        if (!request?.id || !request.reference) throw new Error('Request confirmation was incomplete.');

        const selectedFiles = Object.entries(uploads);
        const failedUploads = [];
        for (let index = 0; index < selectedFiles.length; index += 1) {
          const [documentId, file] = selectedFiles[index];
          setUploadProgress({ current: index + 1, total: selectedFiles.length });
          try {
            await uploadRequestDocument(request.id, file, documentId);
          } catch {
            failedUploads.push(DOCUMENTS[documentId]?.name || file.name);
          }
        }

        setUploadWarning(failedUploads.length
          ? `Your request was sent, but these files did not upload: ${failedUploads.join(', ')}. You can add them from Track a request.`
          : '');
        setSubmittedReference(request.reference);
        setIsDone(true);
      } catch (error) {
        setSubmitError(
          error.response?.data?.message || error.message || 'Could not send your request. Try again.'
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
    const document = DOCUMENTS[docId];
    const extension = file.name.split('.').pop()?.toUpperCase();
    if (!document?.formats.includes(extension)) {
      setFileErrors((current) => ({ ...current, [docId]: `Choose a ${document?.formats.join(', ')} file.` }));
      setUploads((current) => {
        const next = { ...current };
        delete next[docId];
        return next;
      });
      event.target.value = '';
      return;
    }
    if (file.size > document.maxSizeMb * 1024 * 1024) {
      setFileErrors((current) => ({ ...current, [docId]: `File must be ${document.maxSizeMb} MB or smaller.` }));
      setUploads((current) => {
        const next = { ...current };
        delete next[docId];
        return next;
      });
      event.target.value = '';
      return;
    }
    setFileErrors((current) => ({ ...current, [docId]: '' }));
    setUploads((current) => ({ ...current, [docId]: file }));
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
              aria-label="Close request"
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

                <h3 className="ca-rf__done-title">Request sent</h3>

                <p className="ca-rf__done-text">
                  An approved agent will contact you and confirm the fee. You can follow updates online.
                </p>

                {uploadWarning && <p className="ca-rf__error" role="alert">{uploadWarning}</p>}

                <span className="ca-rf__ref" data-numeric>
                  {submittedReference || 'Sending...'}
                </span>
              </div>
            ) : (
              <div className="ca-rf__step" data-dir={direction} key={step}>
                {/* ---- 1. Confirm ------------------------------------------- */}
                {step === 'confirm' && (
                  <>
                    <p className="ca-rf__lede">{copy.lede}</p>

                    <p className="ca-label ca-rf__section-title">
                      Documents needed · {requiredDocuments.length} required
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
                        <span className="ca-label ca-rf__charge-key">Agent fee</span>
                        <span className="ca-rf__charge-value" data-numeric>
                          {service.charge}
                        </span>
                        <span className="ca-rf__charge-note">
                          Government fees are separate. Issued by {service.issuedBy}.
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
                          placeholder="As shown on your Aadhaar"
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
                            placeholder="98765 43210"
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
                            placeholder="Your district"
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
                          placeholder="Email for updates"
                          autoComplete="email"
                          aria-invalid={Boolean(touched.email && errors.email)}
                        />
                        {touched.email && errors.email && (
                          <span className="ca-rf__error">{errors.email}</span>
                        )}
                      </div>
                    </div>

                    <p className="ca-rf__note">
                      Your agent uses these details for your request. We share them only with the office handling it.
                    </p>
                  </>
                )}

                {/* ---- 3. Documents ---------------------------------------- */}
                {step === 'documents' && (
                  <>
                    <p className="ca-rf__lede">{copy.lede}</p>

                    <div className="ca-rf__uploads">
                      {documents.map((doc) => {
                        const fileName = uploads[doc.id]?.name;

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
                                {fileName ? 'Change' : 'Attach'}
                              </span>
                            </button>
                            {fileErrors[doc.id] && <p className="ca-rf__error" role="alert">{fileErrors[doc.id]}</p>}

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
                      {UPLOAD_RULES.guidance}
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
                        <span className="ca-label ca-rf__summary-key">Documents</span>
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
                        I understand: Citizen Assist helps with the application, {service.issuedBy} issues the certificate, and government fees are separate.
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
              disabled={isSubmitting || (step === 'review' && !consent)}
            >
              {isSubmitting
                ? uploadProgress
                  ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}…`
                  : 'Sending request…'
                : copy.next}
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
