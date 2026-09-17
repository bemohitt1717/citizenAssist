import { useEffect, useRef } from 'react';
import './PinInput.css';

/**
 * A run of single-digit boxes for typing a short numeric PIN.
 *
 * Presentation only. It holds no PIN of its own and knows nothing about what
 * makes one valid — the parent owns `value`, does the judging, and hands back a
 * `status` to paint. All this does is make four digits pleasant to type: every
 * digit carries the caret to the next box, Backspace carries it back, the arrow
 * keys walk the row, and pasting four digits fills the row in one go. Nobody
 * should ever have to click a box.
 *
 * `value` is always dense — digits pack from the left with no gaps — which is
 * what lets the parent treat it as a plain string.
 *
 * @param {object}   props
 * @param {string}   props.id            Prefix for each box's id.
 * @param {string}   props.value         Digits entered so far.
 * @param {Function} props.onChange      Called with the next digit string.
 * @param {number}   [props.length]      How many boxes. Default 4.
 * @param {boolean}  [props.masked]      Show dots instead of digits.
 * @param {'idle' | 'valid' | 'invalid'} [props.status]
 * @param {string}   [props.labelledBy]  Id of the visible label above.
 * @param {string}   [props.describedBy] Id of the hint or error below.
 */
const PinInput = ({
  id,
  value,
  onChange,
  length = 4,
  masked = true,
  status = 'idle',
  labelledBy,
  describedBy,
}) => {
  // One DOM node per box, so the caret can be carried between them.
  const boxes = useRef([]);

  /** Moves the caret to a box, clamped to the row. */
  const focusBox = (index) => {
    const clamped = Math.min(Math.max(index, 0), length - 1);
    boxes.current[clamped]?.focus();
  };

  // The first box takes the caret as soon as the row appears, so the step can be
  // typed straight into without reaching for the mouse.
  useEffect(() => {
    boxes.current[0]?.focus();
  }, []);

  const handleChange = (index, raw) => {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;

    /* The last digit typed wins. There is deliberately no maxLength on the box:
       with one, typing into an already-filled box is silently swallowed unless
       the old digit happens to be selected, which is exactly the dead keystroke
       that makes a PIN row feel broken. Letting the box hold two for a moment
       and keeping the newer one means every keystroke lands. */
    const digit = typed[typed.length - 1];

    const digits = value.split('');
    digits[index] = digit;

    onChange(digits.slice(0, length).join(''));
    focusBox(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();

      /* Digits stay packed from the left, so clearing a middle box would leave
         a gap. Backspace drops this box and everything after it instead —
         predictable at four digits, and it keeps the value honest. */
      if (value[index]) {
        onChange(value.slice(0, index));
        focusBox(index);
      } else {
        onChange(value.slice(0, Math.max(index - 1, 0)));
        focusBox(index - 1);
      }

      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      onChange(value.slice(0, index));
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      // Never past the first empty box, or a gap opens up.
      focusBox(Math.min(index + 1, value.length));
    }
  };

  /* Landing on a box past the end would open a gap, so the pointer is sent to
     the first empty box instead.

     This belongs on pointerdown rather than focus. A focus handler cannot tell a
     click from the caret this component just moved itself, and it reads `value`
     from the render it was created in — so during the very keystroke that fills
     a box it still sees the old, shorter value and bounces the caret backwards.
     That is what stopped the row advancing on its own. Pointers are the only
     way to land out of range: keyboard moves are already clamped. */
  const handlePointerDown = (index, event) => {
    if (index <= value.length) return;

    event.preventDefault();
    focusBox(value.length);
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <div
      className="ca-pin"
      data-status={status}
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            boxes.current[index] = node;
          }}
          id={`${id}-${index}`}
          className="ca-pin__box"
          type={masked ? 'password' : 'text'}
          inputMode="numeric"
          autoComplete="off"
          value={value[index] ?? ''}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={status === 'invalid' || undefined}
          data-filled={Boolean(value[index])}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPointerDown={(event) => handlePointerDown(index, event)}
          onFocus={(event) => event.target.select()}
          onPaste={handlePaste}
          data-numeric
        />
      ))}
    </div>
  );
};

export default PinInput;
