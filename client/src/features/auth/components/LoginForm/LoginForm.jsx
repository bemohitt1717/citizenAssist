import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../../components/ui/Icon/Icon';
import GoogleMark from '../../../../components/ui/GoogleMark/GoogleMark';
import {
  DEMO_MOBILE,
  DEMO_OTP,
  HOME_FOR_ROLE,
  IS_DEMO_AUTH,
} from '../../../../constants/demoAuth';
import './LoginForm.css';

/** Seconds a citizen must wait before asking for another OTP. */
const RESEND_WAIT = 30;

/**
 * Sign in, in two steps: a mobile number, then the code sent to it.
 *
 * ── NO BACKEND HERE ─────────────────────────────────────────────────────────
 * Nothing in this file talks to a server. The three places an API call belongs
 * are marked `TODO(api)` below, and each one already has the value it needs in
 * scope. To wire it up you replace the body of that one function — no other
 * part of the component has to change.
 *
 * The `role` prop only supplies wording, and is passed to the API so the server
 * knows which dashboard to return. Citizen, agent and admin all authenticate the
 * same two ways, against the same endpoints and the same users collection — the
 * role is a field on the user, not a separate system.
 *
 * Kept to plain useState on purpose so it stays easy to read and extend.
 */
const LoginForm = ({ role, onChangeRole }) => {
  const navigate = useNavigate();

  // 'phone' asks for the number. 'otp' asks for the code.
  const [step, setStep] = useState('phone');

  // Prefilled in demo mode so reviewing the dashboards takes two clicks.
  const [phone, setPhone] = useState(IS_DEMO_AUTH ? DEMO_MOBILE : '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Counts the resend cooldown down to zero, one second at a time.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Indian mobile numbers: ten digits, starting 6 to 9.
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
  const isOtpValid = /^\d{6}$/.test(otp);

  // Keeps anything that is not a digit out of the number field entirely.
  const onPhoneChange = (event) => {
    setPhone(event.target.value.replace(/\D/g, '').slice(0, 10));
    setError('');
  };

  const onOtpChange = (event) => {
    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
    setError('');
  };

  const sendOtp = (event) => {
    event.preventDefault();

    if (!isPhoneValid) {
      setError('Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');
      return;
    }

    setIsBusy(true);

    // TODO(api): POST /api/auth/send-otp  body: { phone, role: role.id }
    // On success  -> setStep('otp')
    // On failure  -> setError(message from the server)
    setTimeout(() => {
      setIsBusy(false);
      setStep('otp');
      setSecondsLeft(RESEND_WAIT);
    }, 400);
  };

  const verifyOtp = (event) => {
    event.preventDefault();

    if (!isOtpValid) {
      setError('Enter the 6-digit code we sent you.');
      return;
    }

    setIsBusy(true);

    // TODO(api): POST /api/auth/verify-otp  body: { phone, otp, role: role.id }
    // On success  -> store the session, then send them to their dashboard
    // On failure  -> setError('That code did not match. Try again.')
    setTimeout(() => {
      setIsBusy(false);

      if (IS_DEMO_AUTH) {
        if (phone !== DEMO_MOBILE || otp !== DEMO_OTP) {
          setError('For this demo, use the number and code shown above.');
          return;
        }

        navigate(HOME_FOR_ROLE[role.id] ?? '/');
      }
    }, 400);
  };

  const resendOtp = () => {
    if (secondsLeft > 0) return;
    setOtp('');
    setError('');
    setSecondsLeft(RESEND_WAIT);

    // TODO(api): POST /api/auth/send-otp  body: { phone }
  };

  const signInWithGoogle = () => {
    // TODO(api): redirect to your Google OAuth start route, e.g.
    // window.location.href = `/api/auth/google?role=${role.id}`;
  };

  const backToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="ca-login__form">
      {/* Takes the slack in the column, so the heading and controls sit at its
          optical centre while the footnote below holds the floor. Mirrors how
          the showcase panel divides its own height. */}
      <div className="ca-login__main">
      <button type="button" className="ca-login__role" onClick={onChangeRole}>
        <Icon name="arrowRight" size={13} />
        Signing in as {role.label.toLowerCase()}
      </button>

      <h1 className="ca-login__title">{step === 'phone' ? role.title : 'Enter the code'}</h1>

      <p className="ca-login__lede">
        {step === 'phone' ? role.lede : `We sent a 6-digit code to +91 ${phone}.`}
      </p>

      {/* Review build only — see constants/demoAuth.js. */}
      {IS_DEMO_AUTH && (
        <div className="ca-login__demo">
          <p className="ca-login__demo-title">
            <Icon name="shieldCheck" size={14} />
            Demo sign-in
          </p>

          <dl className="ca-login__demo-rows">
            <div className="ca-login__demo-row">
              <dt>Mobile</dt>
              <dd data-numeric>{DEMO_MOBILE}</dd>
            </div>
            <div className="ca-login__demo-row">
              <dt>Code</dt>
              <dd data-numeric>{DEMO_OTP}</dd>
            </div>
          </dl>

          <p className="ca-login__demo-note">
            No accounts exist yet. This signs you into the {role.label.toLowerCase()} view so the
            interface can be reviewed.
          </p>
        </div>
      )}

      {/* ── Step 1: mobile number ───────────────────────────────────────── */}
      {step === 'phone' && (
        <form className="ca-login__body" onSubmit={sendOtp} noValidate>
          <div className="ca-login__field">
            <label className="ca-login__label" htmlFor="ca-phone">
              Mobile number
            </label>

            <div className="ca-login__inputwrap">
              <span className="ca-login__prefix" data-numeric>
                +91
              </span>
              <input
                id="ca-phone"
                className="ca-login__input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={phone}
                onChange={onPhoneChange}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'ca-login-error' : undefined}
                data-numeric
              />
            </div>
          </div>

          {error && (
            <p className="ca-login__error" id="ca-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="ca-pill ca-pill--solid ca-login__submit"
            disabled={isBusy}
          >
            {isBusy ? 'Sending…' : 'Send code'}
            <span className="ca-pill__disc">
              <Icon name="arrowRight" size={15} />
            </span>
          </button>
        </form>
      )}

      {/* ── Step 2: the code ────────────────────────────────────────────── */}
      {step === 'otp' && (
        <form className="ca-login__body" onSubmit={verifyOtp} noValidate>
          <div className="ca-login__field">
            <div className="ca-login__labelrow">
              <label className="ca-login__label" htmlFor="ca-otp">
                6-digit code
              </label>

              <button type="button" className="ca-login__textlink" onClick={backToPhone}>
                Change number
              </button>
            </div>

            <input
              id="ca-otp"
              className="ca-login__input ca-login__input--otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="······"
              maxLength={6}
              value={otp}
              onChange={onOtpChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'ca-login-error' : undefined}
              data-numeric
            />
          </div>

          {error && (
            <p className="ca-login__error" id="ca-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="ca-pill ca-pill--solid ca-login__submit"
            disabled={isBusy}
          >
            {isBusy ? 'Checking…' : 'Verify and continue'}
            <span className="ca-pill__disc">
              <Icon name="arrowRight" size={15} />
            </span>
          </button>

          <button
            type="button"
            className="ca-login__resend"
            onClick={resendOtp}
            disabled={secondsLeft > 0}
          >
            <Icon name="refresh" size={15} />
            {secondsLeft > 0 ? (
              <>
                Resend in <span data-numeric>{secondsLeft}s</span>
              </>
            ) : (
              'Send a new code'
            )}
          </button>
        </form>
      )}

      <div className="ca-login__divider">
        <span>or</span>
      </div>

      <button type="button" className="ca-login__google" onClick={signInWithGoogle}>
        <GoogleMark size={20} />
        Continue with Google
      </button>
      </div>

      <p className="ca-login__foot">
        {role.foot}
        {role.id === 'agent' && (
          <>
            {' '}
            <Link className="ca-login__link" to="/become-an-agent">
              Apply here
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
};

export default LoginForm;
