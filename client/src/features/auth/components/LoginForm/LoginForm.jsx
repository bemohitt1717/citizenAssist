import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Icon from "../../../../components/ui/Icon/Icon";
import { Button } from "../../../../components/ui/button";
import { Spinner } from "../../../../components/ui/spinner";
import GoogleMark from "../../../../components/ui/GoogleMark/GoogleMark";
import PinInput from "../PinInput/PinInput";
import { googleLogin, startAuth, signIn, signUp } from "../../authApi";
import { useAuth } from "../../../../context/useAuth";
import { getApiErrorMessage } from "../../../../utils/apiError";
import "./LoginForm.css";

/** Digits in a PIN. Declared once so the copy and the checks cannot drift. */
const PIN_LENGTH = 4;

/**
 * The steps each mode walks, in order. Drives the progress rail as well as the
 * flow, so a mode can never show a rail that disagrees with the screens it has.
 *
 * Signing in checks a PIN, so it asks once. Signing up sets one, so it asks
 * twice — a PIN typed wrong the first time and never re-read would lock someone
 * out of an account they just made.
 */
const STEPS = {
  signin: ["phone", "enter"],
  signup: ["phone", "create", "confirm"],
};

const HOME_BY_ROLE = {
  citizen: "/citizen/dashboard",
  agent: "/agent/dashboard",
  admin: "/admin/dashboard",
};

/**
 * Turns away the PINs people reach for first: one digit four times over (1111,
 * 0000) and straight runs either way (1234, 4321).
 *
 * Only applied while choosing a PIN. Someone signing in with a weak PIN they
 * already have needs to get into their account, not a lecture.
 *
 * This is a courtesy, not a security control — the real check belongs on the
 * server, where it cannot be skipped. It is here because the moment to say so is
 * while someone is choosing, not after.
 */
const isPinTooObvious = (pin) => {
  const digits = [...pin].map(Number);

  const allSame = digits.every((digit) => digit === digits[0]);
  const climbing = digits.every(
    (digit, i) => i === 0 || digit === digits[i - 1] + 1,
  );
  const falling = digits.every(
    (digit, i) => i === 0 || digit === digits[i - 1] - 1,
  );

  return allSame || climbing || falling;
};

/**
 * The one line under a field: what is wrong, that nothing is, or what to expect.
 *
 * Always returns something, so the slot is never empty and the layout does not
 * jump when a verdict arrives. `tone` names both the colour and whether a screen
 * reader should be interrupted.
 */
const noteFor = ({ problem, isSettled, settled, waiting }) => {
  if (problem) return { tone: "error", text: problem };
  if (isSettled) return { tone: "ok", text: settled };
  return { tone: "hint", text: waiting };
};

/** Draws one of those lines. Only a problem interrupts a screen reader. */
const Note = ({ note, id }) => (
  <p
    className={`ca-login__note ca-login__note--${note.tone}`}
    id={id}
    role={note.tone === "error" ? "alert" : undefined}
  >
    {note.text}
  </p>
);

/**
 * Sign in, or sign up, against a mobile number and a 4-digit PIN.
 *
 * Signing in is the default, because most arrivals already have an account. It
 * asks for the number, then the PIN, and that is all. Signing up adds one screen:
 * the PIN is asked for twice, since nobody should be locked out of an account
 * they created a minute ago by a digit they mistyped once.
 *
 * Each step answers while it is being typed into. Nobody should have to press a
 * button to find out that their four digits did not match — the row goes green
 * when it will be accepted and red when it will not, with a line of copy either
 * way, so the colour confirms a message rather than replacing one.
 *
 * ── NO BACKEND HERE ─────────────────────────────────────────────────────────
 * Nothing in this file talks to a server. The places an API call belongs are
 * marked `TODO(api)` below and each already has the values it needs in scope, so
 * wiring it up means replacing the body of one function — no other part of the
 * component has to change. The PIN never leaves this component today, and when it
 * does it should be sent once and hashed server-side, never stored here.
 *
 * The `role` prop only supplies wording and the dashboard to land on. Citizen,
 * agent and admin all authenticate the same way, against the same endpoints and
 * the same users collection — the role is a field on the user, not a separate
 * system.
 *
 * Kept to plain useState on purpose so it stays easy to read and extend.
 */
const LoginForm = ({ role, onChangeRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const googleButtonRef = useRef(null);

  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const canSignUp = role.id === "citizen";

  const copy = role[mode];
  const steps = STEPS[mode];
  const stepIndex = steps.indexOf(step);

  /* ── What each step currently thinks of its input ─────────────────────────
     Derived every render rather than stored, so a verdict can never fall out of
     step with the digits it is describing. */

  // Indian mobile numbers: ten digits, starting 6 to 9.
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  const isPinComplete = pin.length === PIN_LENGTH;
  const isPinWeak = isPinComplete && isPinTooObvious(pin);
  const isPinReady = isPinComplete && !isPinWeak;

  const isConfirmComplete = confirmPin.length === PIN_LENGTH;
  const isConfirmMatched = isConfirmComplete && confirmPin === pin;

  const goToStep = (next) => {
    setStep(next);
    setError("");
  };

  // Keeps anything that is not a digit out of the number field entirely.
  const onPhoneChange = (event) => {
    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
    setError("");
  };

  const onPinChange = (next) => {
    setPin(next);
    setError("");
  };

  const onConfirmChange = (next) => {
    setConfirmPin(next);
    setError("");
  };

  /** Store the backend session and use its role for navigation. */
  const finish = (token, loggedInUser) => {
    login(token, loggedInUser);
    const returnTo = location.state?.returnTo;
    const safeReturnTo = typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//");
    navigate(safeReturnTo ? returnTo : (HOME_BY_ROLE[loggedInUser.role] ?? "/"));
  };

  const submitPhone = (event) => {
    event.preventDefault();

    if (!isPhoneValid) {
      setError("Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");
      return;
    }

    const checkPhone = async () => {
      try {
        const response = await startAuth(phone, role.id);
        const { exists, hasPin } = response.data;
        console.info("[auth debug] phone step", { mode, exists, hasPin });

        if (mode === "signin") {
          if (!exists) {
            setError('We could not find an account. Choose “Create one” to sign up.');
            return;
          }

          if (!hasPin) {
            setError(
              'This account has no PIN yet. Choose “Create one” to set it.',
            );
            return;
          }

          goToStep("enter");
          return;
        }

        if (exists) {
          setError('This number already has an account. Sign in instead.');
          return;
        }

        goToStep("create");
      } catch (requestError) {
        console.info(
          "[auth debug] phone step failed",
          requestError.response?.status,
        );
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsBusy(false);
      }
    };

    checkPhone();
  };

  const submitEnter = (event) => {
    event.preventDefault();
    if (!isPinComplete || isBusy) return;

    setIsBusy(true);

    const authenticate = async () => {
      try {
        const response = await signIn(phone, pin, role.id);
        console.info("[auth debug] sign-in flow succeeded");
        finish(response.data.token, response.data.user);
      } catch (requestError) {
        console.info(
          "[auth debug] sign-in flow failed",
          requestError.response?.status,
        );
        setError(getApiErrorMessage(requestError));
        setIsBusy(false);
      }
    };

    authenticate();
  };

  const submitPin = (event) => {
    event.preventDefault();
    if (!isPinReady) return;

    setConfirmPin("");
    goToStep("confirm");
  };

  const handleForgotPin = () => {
    if (!isPhoneValid) {
      setError("Enter a valid mobile number first.");
      return;
    }

    setError('To reset your PIN, contact Citizen Assist. We will check that this number is yours.');
  };

  const submitConfirm = (event) => {
    event.preventDefault();
    if (!isConfirmMatched) return;

    const completeAuth = async () => {
      try {
        const response = await signUp(phone, pin);

        console.info(
          "[auth debug] sign-up flow succeeded",
        );
        finish(response.data.token, response.data.user);
      } catch (requestError) {
        console.info(
          "[auth debug] sign-up flow failed",
          requestError.response?.status,
        );
        setError(getApiErrorMessage(requestError));
        setIsBusy(false);
      }
    };

    completeAuth();
  };

  /* Swapping between signing in and signing up.
     The number survives — it is the same number either way, and making someone
     retype it to correct a mode they picked by mistake is a punishment. The PINs
     do not: they mean different things in the two modes. */
  const switchMode = () => {
    if (!canSignUp) return;
    const next = mode === "signin" ? "signup" : "signin";

    setMode(next);
    setPin("");
    setConfirmPin("");
    setError("");
    setIsRevealed(false);
    setStep(step === "phone" ? "phone" : STEPS[next][1]);
  };

  const changeNumber = () => {
    setPin("");
    setConfirmPin("");
    setIsRevealed(false);
    goToStep("phone");
  };

  const redoPin = () => {
    setPin("");
    setConfirmPin("");
    goToStep("create");
  };

  const signInWithGoogle = () => {
    // Trigger hidden Google button click
    const googleButton = googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleButton) {
      googleButton.click();
    } else {
      console.warn('[GOOGLE-LOGIN] Google button not found, retrying...');
      // Retry after a short delay if button not found
      setTimeout(() => {
        const retryButton = googleButtonRef.current?.querySelector('div[role="button"]');
        if (retryButton) retryButton.click();
      }, 100);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsBusy(true);
      setError("");
      console.log('✅ [GOOGLE-LOGIN] Received credential');

      const response = await googleLogin(credentialResponse.credential);
      console.log('✅ [GOOGLE-LOGIN] Backend authentication successful');

      if (response.data.user.role !== role.id) {
        setError('This Google account is for a different account type. Go back and choose the right one.');
        setIsBusy(false);
        return;
      }

      finish(response.data.token, response.data.user);
    } catch (requestError) {
      console.error('❌ [GOOGLE-LOGIN] Failed:', requestError);
      setError(getApiErrorMessage(requestError));
      setIsBusy(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ [GOOGLE-LOGIN] Google authentication failed');
    setError('Google sign-in failed. Try again.');
    setIsBusy(false);
  };

  const heading = {
    phone: copy.title,
    enter: "Enter your PIN",
    create: "Set your PIN",
    confirm: "Confirm your PIN",
  }[step];

  const lede = {
    phone: copy.lede,
    enter: `The 4-digit PIN you set for +91 ${phone}.`,
    create: `Four digits, entered every time you sign in with +91 ${phone}.`,
    confirm: "Type the same four digits again so a slip cannot lock you out.",
  }[step];

  /* The number is only marked wrong once it has been submitted — going red on the
     second digit of ten would be nagging, not helping. A PIN is judged as soon as
     all four are in, which is the first moment there is anything to judge. */
  const phoneNote = noteFor({
    problem: error,
    isSettled: false,
    waiting: "We use this to sign you in, nothing else.",
  });

  /* Signing in, the only thing this side can tell is whether four digits are
     there. Whether they are the right four is the server's answer, and the copy
     stays careful not to promise otherwise. */
  const enterNote = noteFor({
    problem: error,
    isSettled: isPinComplete,
    settled: "4 digits entered.",
    waiting: "Enter the 4-digit PIN for this number.",
  });

  const pinNote = noteFor({
    problem:
      error ||
      (isPinWeak
        ? "Choose a harder PIN. Avoid repeats like 1111 or runs like 1234."
        : ""),
    isSettled: isPinReady,
    settled: "PIN ready. Confirm it next.",
    waiting: "Avoid birthdays or numbers printed on your cards.",
  });

  const confirmNote = noteFor({
    problem:
      error ||
      (isConfirmComplete && !isConfirmMatched
        ? "Not the same as the PIN you chose."
        : ""),
    isSettled: isConfirmMatched,
    settled: "PINs match.",
    waiting: "Enter the same PIN again.",
  });

  const phoneStatus = error ? "invalid" : isPhoneValid ? "valid" : "idle";
  const enterStatus = error ? "invalid" : isPinComplete ? "valid" : "idle";
  const pinStatus =
    pinNote.tone === "error" ? "invalid" : isPinReady ? "valid" : "idle";
  const confirmStatus =
    confirmNote.tone === "error"
      ? "invalid"
      : isConfirmMatched
        ? "valid"
        : "idle";

  /* One control, two positions. An icon rather than the words "Show" and "Hide",
     because the label had to change with the state and a control whose name moves
     is a control you read twice. */
  const revealToggle = (
    <button
      type="button"
      className="ca-login__reveal"
      onClick={() => setIsRevealed(!isRevealed)}
      aria-pressed={isRevealed}
      aria-label={isRevealed ? "Hide PIN" : "Show PIN"}
      title={isRevealed ? "Hide PIN" : "Show PIN"}
    >
      <Icon name={isRevealed ? "eyeOff" : "eye"} size={17} />
    </button>
  );

  const changeNumberButton = (
    <button
      type="button"
      className="ca-login__secondary"
      onClick={changeNumber}
    >
      <Icon name="phoneDevice" size={15} />
      Change number
    </button>
  );

  return (
    <div className="ca-login__form">
      {/* Takes the slack in the column, so the heading and controls sit at its
          optical centre while the footnote below holds the floor. Mirrors how the
          showcase panel divides its own height. */}
      <div className="ca-login__main">
        <div className="ca-login__topline">
          <button
            type="button"
            className="ca-login__role"
            onClick={onChangeRole}
          >
            <Icon name="arrowRight" size={13} />
            Choose another account
          </button>

          {/* Where you are in the steps this mode has. Decorative for a screen
              reader, which gets the same fact as words just below. */}
          <div className="ca-login__rail" aria-hidden="true">
            {steps.map((name, index) => (
              <span
                key={name}
                className="ca-login__rail-seg"
                data-state={
                  index < stepIndex
                    ? "done"
                    : index === stepIndex
                      ? "now"
                      : "next"
                }
              />
            ))}
          </div>
        </div>

        <p className="ca-sr-only" aria-live="polite">
          Step {stepIndex + 1} of {steps.length}
        </p>

        <h1 className="ca-login__title">{heading}</h1>

        <p className="ca-login__lede">{lede}</p>

        {/* ── Mobile number, both modes ──────────────────────────────────── */}
        {step === "phone" && (
          <form className="ca-login__body" onSubmit={submitPhone} noValidate>
            <div className="ca-login__field">
              <label className="ca-login__label" htmlFor="ca-phone">
                Mobile number
              </label>

              <div className="ca-login__inputwrap" data-status={phoneStatus}>
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
                  aria-describedby="ca-phone-note"
                  data-numeric
                />
              </div>
            </div>

            <Note note={phoneNote} id="ca-phone-note" />

            <button
              type="submit"
              className="ca-pill ca-pill--solid ca-login__submit"
              disabled={isBusy}
            >
              {isBusy ? "Checking…" : "Continue"}
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </button>
          </form>
        )}

        {/* ── Signing in: the PIN, once ──────────────────────────────────── */}
        {step === "enter" && (
          <form className="ca-login__body" onSubmit={submitEnter} noValidate>
            <div className="ca-login__field">
              <div className="ca-login__labelrow">
                <span className="ca-login__label" id="ca-enter-label">
                  Your {PIN_LENGTH}-digit PIN
                </span>

                {revealToggle}
              </div>

              <PinInput
                id="ca-enter"
                value={pin}
                onChange={onPinChange}
                length={PIN_LENGTH}
                masked={!isRevealed}
                status={enterStatus}
                labelledBy="ca-enter-label"
                describedBy="ca-enter-note"
              />
            </div>

            <Note note={enterNote} id="ca-enter-note" />

            <Button
              type="submit"
              className="ca-pill ca-pill--solid ca-login__submit"
              variant="unstyled"
              disabled={isBusy || !isPinComplete}
              aria-busy={isBusy}
            >
              {isBusy ? <Spinner data-icon="inline-start" /> : null}
              {isBusy ? "Signing in…" : "Sign in"}
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </Button>

            <button
              type="button"
              className="ca-login__secondary"
              onClick={handleForgotPin}
            >
              <Icon name="refresh" size={15} />
              Forgot PIN?
            </button>

            {changeNumberButton}
          </form>
        )}

        {/* ── Signing up: choose the PIN ─────────────────────────────────── */}
        {step === "create" && (
          <form className="ca-login__body" onSubmit={submitPin} noValidate>
            <div className="ca-login__field">
              <div className="ca-login__labelrow">
                <span className="ca-login__label" id="ca-pin-label">
                  New {PIN_LENGTH}-digit PIN
                </span>

                {revealToggle}
              </div>

              <PinInput
                id="ca-pin"
                value={pin}
                onChange={onPinChange}
                length={PIN_LENGTH}
                masked={!isRevealed}
                status={pinStatus}
                labelledBy="ca-pin-label"
                describedBy="ca-pin-note"
              />
            </div>

            <Note note={pinNote} id="ca-pin-note" />

            <button
              type="submit"
              className="ca-pill ca-pill--solid ca-login__submit"
              disabled={!isPinReady}
            >
              Continue
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </button>

            {changeNumberButton}
          </form>
        )}

        {/* ── Signing up: confirm it ─────────────────────────────────────── */}
        {step === "confirm" && (
          <form className="ca-login__body" onSubmit={submitConfirm} noValidate>
            <div className="ca-login__field">
              <div className="ca-login__labelrow">
                <span className="ca-login__label" id="ca-confirm-label">
                  Re-enter PIN
                </span>

                {revealToggle}
              </div>

              <PinInput
                id="ca-confirm"
                value={confirmPin}
                onChange={onConfirmChange}
                length={PIN_LENGTH}
                masked={!isRevealed}
                status={confirmStatus}
                labelledBy="ca-confirm-label"
                describedBy="ca-confirm-note"
              />
            </div>

            <Note note={confirmNote} id="ca-confirm-note" />

            <button
              type="submit"
              className="ca-pill ca-pill--solid ca-login__submit"
              disabled={isBusy || !isConfirmMatched}
            >
              {isBusy ? "Setting up…" : "Confirm and continue"}
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </button>

            <button
              type="button"
              className="ca-login__secondary"
              onClick={redoPin}
            >
              <Icon name="refresh" size={15} />
              Pick a different PIN
            </button>
          </form>
        )}

        {/* Offered only while choosing how to get in. Once a PIN is being typed it
            is not an alternative any more, and leaving it on screen invites
            abandoning the flow halfway through. */}
        {step === "phone" && (
          <>
            <div className="ca-login__divider">
              <span>or</span>
            </div>

            {/* Hidden Google Login button - only mount on phone step to avoid re-initialization */}
            <div ref={googleButtonRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                auto_select={false}
                context={mode === 'signup' ? 'signup' : 'signin'}
              />
            </div>

            {/* Custom Google button that triggers the hidden one */}
            <button
              type="button"
              className="ca-login__google"
              onClick={signInWithGoogle}
              disabled={isBusy}
            >
              <GoogleMark size={20} />
              {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
          </>
        )}
      </div>

      <div className="ca-login__foot">
        {canSignUp && (
          <p>
            {copy.ask}{" "}
            <button type="button" className="ca-login__link" onClick={switchMode}>
              {copy.act}
            </button>
          </p>
        )}

        {role.foot && (
          <p>
            {role.foot.text}
            {role.foot.to && (
              <>
                {" "}
                <Link className="ca-login__link" to={role.foot.to}>
                  {role.foot.linkText}
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
