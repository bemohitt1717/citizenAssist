import './LoginPrompt.css';

/**
 * Simple login prompt matching site theme.
 * Clean, minimal, consistent with the rest of the site.
 */
const LoginPrompt = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="ca-login-prompt-overlay" onClick={onClose}>
      <div className="ca-login-prompt" onClick={(e) => e.stopPropagation()}>
        {/* Simple static lock icon */}
        <div className="ca-login-prompt__icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="ca-login-prompt__title">Login Required</h2>
        
        <p className="ca-login-prompt__message">
          You must be logged in to request this service. Please login or sign up to continue.
        </p>

        <div className="ca-login-prompt__actions">
          <button 
            type="button" 
            className="ca-login-prompt__button ca-login-prompt__button--primary"
            onClick={onLogin}
          >
            Continue to Login
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
