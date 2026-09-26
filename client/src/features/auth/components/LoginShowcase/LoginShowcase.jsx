import { useEffect, useState } from 'react';
import { RequirementsArt, TrackingArt, VerifiedAgentArt } from './SlideArt';
import './LoginShowcase.css';

/** How long each slide holds, in milliseconds. */
const SLIDE_TIME = 4500;

/* Each slide is a drawing, a floating chip, a caption, and the two colours the
   panel takes while it is showing: `tint` is the panel background and `hue` is
   the chip bar and the active dot.
   To add or reword a slide, edit this list — nothing below has to change. */
const SLIDES = [
  {
    id: 'requirements',
    Art: RequirementsArt,
    tint: '#e7eefb',
    hue: '#3b6fd4',
    chip: { key: 'Documents', value: 'All 5 listed first' },
    caption: 'See what you need before you apply',
  },
  {
    id: 'agent',
    Art: VerifiedAgentArt,
    tint: '#e6f3ea',
    hue: '#2e9e5b',
    chip: { key: 'Your agent', value: 'Checked by our team' },
    caption: 'A checked agent helps with your request',
  },
  {
    id: 'tracking',
    Art: TrackingArt,
    tint: '#fcf1dc',
    hue: '#eeae24',
    chip: { key: 'Status', value: 'Documents being checked' },
    caption: 'See updates as your request moves ahead',
  },
];

/**
 * The rotating panel beside the sign-in form.
 *
 * Kept simple on purpose: one piece of state for the active index, one timer to
 * advance it, and clicking a dot jumps straight there. Nothing else.
 */
const LoginShowcase = () => {
  const [active, setActive] = useState(0);

  // Advance to the next slide, looping back to the first at the end.
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, SLIDE_TIME);

    // Clearing on every change restarts the clock, so a slide the user just
    // jumped to gets its full turn instead of a leftover fraction.
    return () => clearTimeout(timer);
  }, [active]);

  const slide = SLIDES[active];
  const { Art } = slide;

  return (
    <aside
      className="ca-showcase"
      style={{ '--ca-panel': slide.tint, '--ca-chip-hue': slide.hue }}
    >
      <div className="ca-showcase__stage">
        {/* Keyed on the slide id so React remounts it and the CSS entrance
            plays again on every change. */}
        <div className="ca-slide" key={slide.id}>
          <Art />

          <div className="ca-slide__chip">
            <span className="ca-label ca-slide__chip-key">
              <span className="ca-slide__chip-dot" />
              {slide.chip.key}
            </span>
            <span className="ca-slide__chip-value">{slide.chip.value}</span>
          </div>
        </div>
      </div>

      <div className="ca-showcase__foot">
        <p className="ca-showcase__caption" key={`${slide.id}-caption`}>
          {slide.caption}
        </p>

        <div className="ca-showcase__dots">
          {SLIDES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`ca-showcase__dot ${index === active ? 'is-active' : ''}`.trim()}
              style={{ '--ca-chip-hue': item.hue }}
              onClick={() => setActive(index)}
              aria-label={`Show slide ${index + 1}: ${item.caption}`}
              aria-current={index === active}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LoginShowcase;
