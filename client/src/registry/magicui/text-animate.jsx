import './text-animate.css';

/**
 * A small CSS version of Magic UI's TextAnimate API for the one branded reveal.
 * Keeping the same props avoids adding an animation dependency to the app shell.
 */
export function TextAnimate({
  children,
  animation = 'blurInUp',
  by = 'character',
  duration = 0.42,
  className = '',
}) {
  const text = String(children ?? '');
  const parts = by === 'character' ? Array.from(text) : [text];
  const characterStagger = duration / Math.max(parts.length, 1);

  return (
    <span className={`ca-text-animate ca-text-animate--${animation} ${className}`.trim()} aria-hidden="true">
      {parts.map((character, index) => (
        <span
          className="ca-text-animate__character"
          key={`${character}-${index}`}
          style={{ '--ca-character-index': index, '--ca-character-stagger': `${characterStagger}s` }}
        >
          {character === ' ' ? '\u00a0' : character}
        </span>
      ))}
    </span>
  );
}
