import { Component } from 'react';
import Logo from '../Logo/Logo';
import Icon from '../../ui/Icon/Icon';
import '../../../pages/NotFound.css';

/**
 * Catches a render crash anywhere below it and shows a page instead of a blank
 * screen.
 *
 * A class component because `componentDidCatch` has no hook equivalent — this is
 * the one place in the codebase that has to be one.
 *
 * The message is written for a citizen, not a developer: it says what did and did
 * not happen to their data, and gives them a way out. The stack is shown only in
 * development, because in production it is noise to the person reading it and a
 * small information leak to anyone else.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // TODO(monitoring): report to a service here if one is ever added.
    console.error('Citizen Assist crashed while rendering:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="ca-oops">
        <div className="ca-oops__bar">
          <a href="/" aria-label="Citizen Assist, home">
            <Logo size={28} />
          </a>
        </div>

        <div className="ca-oops__body">
          <p className="ca-label ca-oops__code">
            <Icon name="close" size={13} />
            Something broke
          </p>

          <h1 className="ca-oops__title">This page stopped working</h1>

          <p className="ca-oops__text">
            Sorry — the fault is ours, not yours. Nothing you had already submitted has been lost,
            and no request has been changed. Reloading usually clears it.
          </p>

          <div className="ca-oops__actions">
            {/* A full reload rather than router navigation: whatever put the tree
                into this state is still in memory, so remounting is not enough. */}
            <button
              type="button"
              className="ca-pill ca-pill--solid ca-oops__action"
              onClick={() => window.location.reload()}
            >
              Reload the page
              <span className="ca-pill__disc">
                <Icon name="refresh" size={15} />
              </span>
            </button>

            <a className="ca-pill ca-pill--outline ca-oops__action" href="/">
              Back to home
              <span className="ca-pill__disc">
                <Icon name="arrowRight" size={15} />
              </span>
            </a>
          </div>

          {import.meta.env.DEV && (
            <pre className="ca-oops__detail">{error.message ?? String(error)}</pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
