import { useState, useEffect } from 'react';
import Icon from '../../../../components/ui/Icon/Icon';
import { AGENT_TERMS, EXPERIENCE_BANDS } from '../../../../constants/agent';
import { SERVICES } from '../../../../constants/services';
import { applyAsAgent } from '../../agentApi';
import { useAuth } from '../../../../context/authContext';
import './AgentForm.css';

const STEPS = ['terms', 'details', 'review'];

const STEP_COPY = {
  terms: {
    title: 'What you are agreeing to',
    lede: 'Four things, before you fill anything in. If any of them do not suit you, this is the point to stop.',
    next: 'I agree, continue',
  },
  details: {
    title: 'Your details',
    lede: 'Only what an admin needs to verify you and what a citizen needs to reach you. No photograph, no documents to upload.',
    next: 'Review application',
  },
  review: {
    title: 'Check and send',
    lede: 'One last look before an admin sees this.',
    next: 'Send application',
  },
};

const EMPTY = {
  fullName: '',
  mobile: '',
  email: '',
  district: '',
  experience: '',
  services: [],
};

const isValidMobile = (value) => /^[6-9]\d{9}$/.test(value);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/**
 * The agent application.
 *
 * Auto-fills name, mobile, and email from logged-in citizen's profile.
 * Validates that the mobile number is different from citizen account.
 *
 * ── NO BACKEND HERE ─────────────────────────────────────────────────────────
 * Nothing in this file talks to a server. The single place an API call belongs is
 * marked `TODO(api)` in `submit`, and the finished record is already assembled
 * there. Replace that one function body and nothing else has to change.
 *
 * Both mobile and email are required, because sign-in accepts either — the
 * mobile with a PIN, the email for Google. Collecting both here means an agent
 * can use whichever they have to hand later.
 */
const AgentForm = () => {
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [consent, setConsent] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Auto-fill form with citizen profile data
  useEffect(() => {
    if (user) {
      console.log('👤 [AGENT-FORM] Auto-filling form with user data:', { 
        name: user.name, 
        phone: user.phone?.replace('+91', ''), 
        email: user.email 
      });
      
      setForm((current) => ({
        ...current,
        fullName: user.name || current.fullName,
        mobile: user.phone ? user.phone.replace('+91', '') : current.mobile,
        email: user.email || current.email,
      }));
    }
  }, [user]);

  const step = STEPS[stepIndex];
  const copy = STEP_COPY[step];

  const errors = {
    fullName: form.fullName.trim().length < 2 ? 'Please enter your full name.' : null,
    mobile: isValidMobile(form.mobile) 
      ? (user?.phone && `+91${form.mobile}` === user.phone 
        ? 'You must use a different mobile number than your citizen account.' 
        : null)
      : 'Enter a 10-digit mobile number.',
    email: isValidEmail(form.email) ? null : 'Enter the email on your Google account.',
    district: form.district.trim() === '' ? 'Which district do you work in?' : null,
    experience: form.experience === '' ? 'Pick one.' : null,
    services: form.services.length === 0 ? 'Choose at least one service.' : null,
  };

  const detailsValid = Object.values(errors).every((error) => error === null);

  const setField = (name) => (event) => {
    const raw = event.target.value;
    const value = name === 'mobile' ? raw.replace(/\D/g, '').slice(0, 10) : raw;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const blur = (name) => () => setTouched((current) => ({ ...current, [name]: true }));

  const toggleService = (id) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(id)
        ? current.services.filter((item) => item !== id)
        : [...current.services, id],
    }));
    setTouched((current) => ({ ...current, services: true }));
  };

  const submit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Final validation: prevent same mobile as citizen account
    if (user?.phone && `+91${form.mobile}` === user.phone) {
      console.log('❌ [AGENT-FORM] Validation failed: same mobile as citizen account');
      setSubmitError('You cannot apply as an agent with the same mobile number as your citizen account. Please use a different number.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📝 [AGENT-FORM] Submitting agent application:', {
        name: form.fullName,
        mobile: form.mobile,
        email: form.email,
        district: form.district,
      });
      
      await applyAsAgent(form);
      console.log('✅ [AGENT-FORM] Application submitted successfully');
      setIsSent(true);
    } catch (error) {
      console.error('❌ [AGENT-FORM] Application submission failed:', error);
      setSubmitError(
        error.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 'details' && !detailsValid) {
      setTouched({
        fullName: true,
        mobile: true,
        email: true,
        district: true,
        experience: true,
        services: true,
      });
      return;
    }

    if (step === 'review') {
      submit();
      return;
    }

    setDirection('forward');
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection('back');
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const chosenServices = SERVICES.filter((service) => form.services.includes(service.id));
  const experienceLabel = EXPERIENCE_BANDS.find((band) => band.id === form.experience)?.label;

  if (isSent) {
    return (
      <div className="ca-agent">
        <div className="ca-agent__card">
          <div className="ca-agent__done">
            <span className="ca-agent__done-seal">
              <Icon name="check" size={28} />
            </span>

            <h1 className="ca-agent__done-title">Application sent</h1>

            <p className="ca-agent__done-text">
              An admin will review it and call you on{' '}
              <strong data-numeric>+91 {form.mobile}</strong>. You can sign in with that number or
              with {form.email} once you are verified.
            </p>

            <p className="ca-agent__done-note">
              This is a prototype. Nothing has been stored and no admin has been notified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-agent">
      <div className="ca-agent__head">
        <h1 className="ca-agent__title">Become a Citizen Assist agent</h1>

        <p className="ca-agent__lede">
          Assist citizens with government documentation in your district, to charges that are
          published up front. Applications are reviewed by an admin before any file reaches you.
        </p>

        <div className="ca-agent__progress" aria-hidden="true">
          {STEPS.map((name, index) => (
            <span
              key={name}
              className={`ca-agent__seg ${
                index < stepIndex ? 'is-done' : index === stepIndex ? 'is-current' : ''
              }`.trim()}
            >
              <span className="ca-agent__seg-fill" />
            </span>
          ))}
        </div>
      </div>

      <div className="ca-agent__card">
        {submitError && (
          <div style={{ 
            padding: '1rem 1.25rem', 
            marginBottom: '1.25rem',
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '0.75rem',
            color: '#991b1b',
            fontSize: '0.9375rem',
            lineHeight: '1.6'
          }}>
            {submitError}
          </div>
        )}

        <div className="ca-agent__step" data-dir={direction} key={step}>
          <h2 className="ca-agent__step-title">{copy.title}</h2>
          <p className="ca-agent__step-lede">{copy.lede}</p>

          {/* ---- 1. Terms ------------------------------------------------- */}
          {step === 'terms' && (
            <ul className="ca-agent__terms">
              {AGENT_TERMS.map((term) => (
                <li className="ca-agent__term" key={term.id}>
                  <span className="ca-agent__term-mark">
                    <Icon name="check" size={15} />
                  </span>
                  <h3 className="ca-agent__term-title">{term.title}</h3>
                  <p className="ca-agent__term-text">{term.text}</p>
                </li>
              ))}
            </ul>
          )}

          {/* ---- 2. Details ---------------------------------------------- */}
          {step === 'details' && (
            <div className="ca-agent__fields">
              <div className="ca-agent__field">
                <label className="ca-agent__label" htmlFor="ca-agent-name">
                  Full name <span className="ca-agent__star">*</span>
                </label>
                <input
                  id="ca-agent-name"
                  className="ca-agent__input"
                  value={form.fullName}
                  onChange={setField('fullName')}
                  onBlur={blur('fullName')}
                  placeholder="As it appears on your Aadhaar"
                  autoComplete="name"
                  aria-invalid={Boolean(touched.fullName && errors.fullName)}
                />
                {touched.fullName && errors.fullName && (
                  <span className="ca-agent__error">{errors.fullName}</span>
                )}
              </div>

              <div className="ca-agent__row">
                <div className="ca-agent__field">
                  <label className="ca-agent__label" htmlFor="ca-agent-mobile">
                    Mobile <span className="ca-agent__star">*</span>
                  </label>
                  <input
                    id="ca-agent-mobile"
                    className="ca-agent__input"
                    value={form.mobile}
                    onChange={setField('mobile')}
                    onBlur={blur('mobile')}
                    placeholder="10 digits"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-invalid={Boolean(touched.mobile && errors.mobile)}
                    data-numeric
                  />
                  {touched.mobile && errors.mobile && (
                    <span className="ca-agent__error">{errors.mobile}</span>
                  )}
                </div>

                <div className="ca-agent__field">
                  <label className="ca-agent__label" htmlFor="ca-agent-district">
                    District <span className="ca-agent__star">*</span>
                  </label>
                  <input
                    id="ca-agent-district"
                    className="ca-agent__input"
                    value={form.district}
                    onChange={setField('district')}
                    onBlur={blur('district')}
                    placeholder="Where you work"
                    aria-invalid={Boolean(touched.district && errors.district)}
                  />
                  {touched.district && errors.district && (
                    <span className="ca-agent__error">{errors.district}</span>
                  )}
                </div>
              </div>

              <div className="ca-agent__field">
                <label className="ca-agent__label" htmlFor="ca-agent-email">
                  Google account email <span className="ca-agent__star">*</span>
                </label>
                <input
                  id="ca-agent-email"
                  className="ca-agent__input"
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  onBlur={blur('email')}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  aria-invalid={Boolean(touched.email && errors.email)}
                />
                {touched.email && errors.email ? (
                  <span className="ca-agent__error">{errors.email}</span>
                ) : (
                  <span className="ca-agent__hint">
                    Lets you sign in with Google as well as with your mobile number.
                  </span>
                )}
              </div>

              <div className="ca-agent__field">
                <label className="ca-agent__label" htmlFor="ca-agent-exp">
                  Experience with documentation work <span className="ca-agent__star">*</span>
                </label>
                <select
                  id="ca-agent-exp"
                  className="ca-agent__select"
                  value={form.experience}
                  onChange={setField('experience')}
                  onBlur={blur('experience')}
                  aria-invalid={Boolean(touched.experience && errors.experience)}
                >
                  <option value="">Choose one</option>
                  {EXPERIENCE_BANDS.map((band) => (
                    <option key={band.id} value={band.id}>
                      {band.label}
                    </option>
                  ))}
                </select>
                {touched.experience && errors.experience && (
                  <span className="ca-agent__error">{errors.experience}</span>
                )}
              </div>

              <div className="ca-agent__field">
                <span className="ca-agent__label">
                  Services you can handle <span className="ca-agent__star">*</span>
                </span>

                <div className="ca-chips">
                  {SERVICES.map((service) => {
                    const isOn = form.services.includes(service.id);

                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`ca-chip ${isOn ? 'is-on' : ''}`.trim()}
                        onClick={() => toggleService(service.id)}
                        aria-pressed={isOn}
                      >
                        <span className="ca-chip__box">
                          {isOn && <Icon name="check" size={12} />}
                        </span>
                        {service.name}
                      </button>
                    );
                  })}
                </div>

                {touched.services && errors.services && (
                  <span className="ca-agent__error">{errors.services}</span>
                )}
              </div>
            </div>
          )}

          {/* ---- 3. Review ----------------------------------------------- */}
          {step === 'review' && (
            <>
              <div className="ca-agent__summary">
                <div className="ca-agent__summary-row">
                  <span className="ca-label ca-agent__summary-key">Name</span>
                  <span className="ca-agent__summary-value">{form.fullName}</span>
                </div>
                <div className="ca-agent__summary-row">
                  <span className="ca-label ca-agent__summary-key">Mobile</span>
                  <span className="ca-agent__summary-value" data-numeric>
                    +91 {form.mobile}
                  </span>
                </div>
                <div className="ca-agent__summary-row">
                  <span className="ca-label ca-agent__summary-key">Google account</span>
                  <span className="ca-agent__summary-value">{form.email}</span>
                </div>
                <div className="ca-agent__summary-row">
                  <span className="ca-label ca-agent__summary-key">District</span>
                  <span className="ca-agent__summary-value">{form.district}</span>
                </div>
                <div className="ca-agent__summary-row">
                  <span className="ca-label ca-agent__summary-key">Experience</span>
                  <span className="ca-agent__summary-value">{experienceLabel}</span>
                </div>
                <div className="ca-agent__summary-row">
                  <span className="ca-label ca-agent__summary-key">Services</span>
                  <span className="ca-agent__summary-value">
                    {chosenServices.map((service) => service.name).join(', ')}
                  </span>
                </div>
              </div>

              <label className="ca-agent__consent">
                <input
                  type="checkbox"
                  className="ca-agent__check"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span className="ca-agent__consent-text">
                  Everything above is accurate, and I accept the four terms on the first step. I
                  understand I cannot take any citizen’s file until an admin has verified me.
                </span>
              </label>
            </>
          )}
        </div>

        <div className="ca-agent__foot">
          {stepIndex > 0 && (
            <button type="button" className="ca-agent__back" onClick={goBack}>
              <Icon name="arrowRight" size={15} />
              Back
            </button>
          )}

          <button
            type="button"
            className="ca-pill ca-pill--solid ca-agent__next"
            onClick={goNext}
            aria-disabled={step === 'review' && !consent}
          >
            {copy.next}
            <span className="ca-pill__disc">
              <Icon name="arrowRight" size={15} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentForm;
