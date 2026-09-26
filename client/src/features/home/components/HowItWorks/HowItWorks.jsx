import { useEffect, useRef, useState } from 'react';
import Stage from './Stage/Stage';
import { PROCESS_STEPS } from '../../../../constants/process';
import useReveal from '../../../../hooks/useReveal';
import './HowItWorks.css';

/** How long a step holds before the sequence moves on, in ms. */
const DWELL = 5200;

/**
 * How it works.
 *
 * A driven sequence rather than a list of captions: the steps on the left
 * advance on their own while the section is on screen, each one playing an
 * animated scene of what actually happens at that point. Clicking a step takes
 * over and stops the auto-advance, because someone who has started steering
 * should not be fought for control.
 *
 * The whole thing degrades honestly. Every step's text is always in the DOM
 * and visible — the animation emphasises, it never carries meaning on its own —
 * so with motion reduced or JavaScript idle the section still reads as a
 * complete, ordered explanation of the process.
 */
const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const [sectionRef, isInView] = useReveal({ threshold: 0.25 });
  const stepRefs = useRef([]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /* Only runs while the section is actually on screen, so an off-screen
     section is never burning frames on a timeline nobody is watching. */
  useEffect(() => {
    if (!isInView || !isAuto || prefersReducedMotion) return undefined;

    const timer = window.setTimeout(
      () => setActiveIndex((current) => (current + 1) % PROCESS_STEPS.length),
      DWELL,
    );

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isAuto, prefersReducedMotion]);

  const select = (index) => {
    setActiveIndex(index);
    setIsAuto(false);
  };

  /* Left and right walk the sequence, matching how a stepper is expected to
     behave from the keyboard. */
  const onKeyDown = (event) => {
    const lastIndex = PROCESS_STEPS.length - 1;
    let nextIndex = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    select(nextIndex);
    stepRefs.current[nextIndex]?.focus();
  };

  const activeStep = PROCESS_STEPS[activeIndex];

  return (
    <section className="ca-hiw" id="how-it-works" ref={sectionRef}>
      <div className="ca-hiw__inner">
        <header className="ca-hiw__head">
          <h2 className="ca-hiw__title">From picking a service to holding the certificate</h2>

          <p className="ca-hiw__lede">
            Choose a service, send your details and documents, then follow each update.
          </p>
        </header>

        <div className="ca-hiw__body">
          {/* A div rather than an ordered list: `role="tablist"` replaces list
              semantics anyway, so marking it up as a list only to override
              that is misleading. Sequence is carried by the visible numbers. */}
          <div
            className="ca-hiw__steps"
            role="tablist"
            aria-label="How to apply"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
          >
            {PROCESS_STEPS.map((step, index) => {
              const isActive = index === activeIndex;

              return (
                <div key={step.id} className="ca-hiw__step-item">
                  <button
                    type="button"
                    ref={(node) => {
                      stepRefs.current[index] = node;
                    }}
                    className={`ca-hiw__step ${isActive ? 'is-active' : ''}`.trim()}
                    role="tab"
                    id={`ca-step-${step.id}`}
                    aria-selected={isActive}
                    aria-controls="ca-hiw-stage"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => select(index)}
                  >
                    <span className="ca-label ca-hiw__step-num" data-numeric>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="ca-hiw__step-label">{step.label}</span>
                    <span className="ca-hiw__step-detail">{step.detail}</span>

                    <span className="ca-hiw__step-rail" aria-hidden="true">
                      <span
                        className={`ca-hiw__step-fill ${
                          isActive && isAuto && isInView ? 'is-running' : ''
                        }`.trim()}
                        style={{ '--ca-dwell': `${DWELL}ms` }}
                      />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div
            className="ca-hiw__stage"
            id="ca-hiw-stage"
            role="tabpanel"
            aria-labelledby={`ca-step-${activeStep.id}`}
          >
            {/* Keyed on the step, so React remounts and the CSS timeline
                replays from the top without any imperative reset. */}
            <Stage key={activeStep.id} id={activeStep.id} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
