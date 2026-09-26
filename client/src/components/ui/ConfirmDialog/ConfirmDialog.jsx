import { useEffect, useId, useRef } from 'react';
import Icon from '../Icon/Icon';
import { Button } from '../button';
import { Spinner } from '../spinner';
import './ConfirmDialog.css';

/**
 * Asks before something is thrown away.
 *
 * Focus lands on Cancel, not on the action — for a dialog that interrupts you,
 * the safe option should be the one a stray Enter press hits.
 *
 * @param {object}   props
 * @param {string}   props.title
 * @param {string}   props.text        What will actually happen.
 * @param {string}   [props.confirmLabel]
 * @param {string}   [props.icon]
 * @param {boolean}  [props.destructive] Warm tone for anything that loses work.
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 */
const ConfirmDialog = ({
  title,
  text,
  confirmLabel = 'Confirm',
  loadingLabel = 'Please wait…',
  icon = 'shieldCheck',
  destructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    if (isLoading) dialogRef.current?.focus();
    else cancelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        if (!isLoading) onCancel();
        return;
      }

      // Keeps tabbing inside the dialog rather than behind the scrim.
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll('button:not(:disabled)');
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
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLoading, onCancel]);

  return (
    <div
      className="ca-confirm__scrim"
      onMouseDown={(event) => {
        if (!isLoading && event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className={`ca-confirm ${destructive ? 'ca-confirm--undo' : ''}`.trim()}
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-busy={isLoading}
      >
        <span className="ca-confirm__mark">
          <Icon name={icon} size={19} />
        </span>

        <h2 className="ca-confirm__title" id={headingId}>
          {title}
        </h2>

        <p className="ca-confirm__text">{text}</p>

        <div className="ca-confirm__actions">
          <Button
            type="button"
            variant="unstyled"
            className="ca-confirm__cancel"
            onClick={onCancel}
            ref={cancelRef}
            disabled={isLoading}
          >
            Stay here
          </Button>

          <Button
            type="button"
            variant="unstyled"
            className="ca-confirm__go"
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading && <Spinner data-icon="inline-start" />}
            {isLoading ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
