import { useEffect, useId, useRef } from 'react';
import './LoginPrompt.css';

/**
 * Simple login prompt matching site theme.
 * Clean, minimal, consistent with the rest of the site.
 */
const LoginPrompt = ({ isOpen, onClose, onLogin, requiresCitizen = false }) => {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button')?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ca-login-prompt-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="ca-login-prompt" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {/* Simple static lock icon */}
        <div className="ca-login-prompt__icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="ca-login-prompt__title" id={titleId}>
          {requiresCitizen ? 'Citizen account required' : 'Sign in to continue'}
        </h2>
        
        <p className="ca-login-prompt__message">
          {requiresCitizen
            ? 'Service requests are available from a citizen account. Sign in with your citizen number to continue.'
            : 'Sign in or create a citizen account to request this service. Your selected service will be ready when you return.'}
        </p>

        <div className="ca-login-prompt__actions">
          <button 
            type="button" 
            className="ca-login-prompt__button ca-login-prompt__button--primary"
            onClick={onLogin}
          >
            {requiresCitizen ? 'Switch to citizen account' : 'Continue to sign in'}
          </button>
          <button 
            type="button" 
            className="ca-login-prompt__button ca-login-prompt__button--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
