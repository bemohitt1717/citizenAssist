import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import { AGENT_TERMS, EXPERIENCE_BANDS } from '../../../../constants/agent';
import { SERVICES } from '../../../../constants/services';
import { applyAsAgent } from '../../agentApi';
import { useAuth } from '../../../../context/authContext';
import './AgentForm.css';

const STEPS = ['terms', 'details', 'review'];

const STEP_COPY = {
  terms: {
    title: 'Before you apply',
    lede: 'Please read these four points before you continue.',
    next: 'Agree and continue',
  },
  details: {
    title: 'Your details',
    lede: 'We use these details to review your application and contact you. No documents needed.',
    next: 'Review details',
  },
  review: {
    title: 'Check and send',
    lede: 'Check your details before sending.',
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
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const isCitizenEmail = (value, citizenEmail) =>
  Boolean(citizenEmail && normalizeEmail(value) === normalizeEmail(citizenEmail));

/**
 * The agent application.
 *
 * Auto-fills name, mobile, and email from logged-in citizen's profile.
 * Requires a different mobile number and email from the citizen account.
 *
 * Applications are tied to a signed-in citizen account and reviewed by an admin.
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
    email: !isValidEmail(form.email.trim())
      ? 'Enter a valid email address.'
      : isCitizenEmail(form.email, user?.email)
        ? 'Use a different email than your citizen account.'
        : null,
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
    if (!consent || !detailsValid || !user || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Final validation: prevent same mobile as citizen account
    if (user?.phone && `+91${form.mobile}` === user.phone) {
      console.log('❌ [AGENT-FORM] Validation failed: same mobile as citizen account');
      setSubmitError('Use a mobile number different from your citizen account.');
      setIsSubmitting(false);
      return;
    }

    if (isCitizenEmail(form.email, user?.email)) {
      console.log('❌ [AGENT-FORM] Validation failed: same email as citizen account');
      setSubmitError('Use a different email than your citizen account.');
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
        error.response?.data?.message || 'We could not send your application. Try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (isSubmitting) return;
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
      if (!consent) return;
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
              We will review your application and call you at{' '}
              <strong data-numeric>+91 {form.mobile}</strong>. If approved, we will send your sign-in details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'citizen') {
    const isSignedIn = Boolean(user);
    return (
      <div className="ca-agent">
        <div className="ca-agent__card ca-agent__card--access">
          <span className="ca-agent__access-mark" aria-hidden="true">
            <Icon name="shieldCheck" size={25} />
          </span>

          <h1 className="ca-agent__step-title">
            {isSignedIn ? 'Citizen account required' : 'Sign in to apply'}
          </h1>

          <p className="ca-agent__step-lede">
            You need an active citizen account to apply. We use it to check your details.
          </p>

          {!isSignedIn && (
            <div className="ca-agent__access-actions">
              <Link
                className="ca-pill ca-pill--solid ca-agent__access-button"
                to="/login"
                state={{ returnTo: '/become-an-agent', roleId: 'citizen' }}
              >
                Sign in as a citizen
                <span className="ca-pill__disc"><Icon name="arrowRight" size={15} /></span>
              </Link>
              <p className="ca-agent__access-note">
                Your application will be here after you sign in.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ca-agent">
      <div className="ca-agent__head">
        <h1 className="ca-agent__title">Become a Citizen Assist agent</h1>

        <p className="ca-agent__lede">
          Help people in your district with government paperwork. We review every application before
          assigning requests.
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
                  placeholder="As shown on your Aadhaar"
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
                    placeholder="98765 43210"
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
                    placeholder="Your district"
                    aria-invalid={Boolean(touched.district && errors.district)}
                  />
                  {touched.district && errors.district && (
                    <span className="ca-agent__error">{errors.district}</span>
                  )}
                </div>
              </div>

              <div className="ca-agent__field">
                <label className="ca-agent__label" htmlFor="ca-agent-email">
                  Email for Google sign-in <span className="ca-agent__star">*</span>
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
                    Use a different email than your citizen account.
                  </span>
                )}
              </div>

              <div className="ca-agent__field">
                <label className="ca-agent__label" htmlFor="ca-agent-exp">
                  Experience with paperwork <span className="ca-agent__star">*</span>
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
                  <span className="ca-label ca-agent__summary-key">Email</span>
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
                  I confirm these details are correct and agree to the terms above. I can take
                  requests only after approval.
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
            disabled={isSubmitting || (step === 'review' && !consent)}
          >
            {isSubmitting ? 'Sending application…' : copy.next}
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
