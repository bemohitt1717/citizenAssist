import './spinner.css';

const Spinner = ({ className = '', ...props }) => (
  <svg
    data-slot="spinner"
    className={`ca-spinner ${className}`.trim()}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <circle className="ca-spinner__track" cx="12" cy="12" r="9" />
    <path className="ca-spinner__arc" d="M12 3a9 9 0 0 1 9 9" />
  </svg>
);

export { Spinner };
