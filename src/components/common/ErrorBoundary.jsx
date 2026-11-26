import { Component } from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Hook for a real error-reporting service (Sentry, etc.) later.
    console.error('TravelSphere UI error:', error, info?.componentStack);
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.handleReset);
    window.addEventListener('popstate', this.handleReset);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleReset);
    window.removeEventListener('popstate', this.handleReset);
  }

  handleReset = () => {
    if (this.state.hasError) {
      this.setState({ hasError: false });
    }
  };

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="error-boundary" role="alert">
        <div className="error-boundary-inner">
          <span className="error-boundary-eyebrow">Something went wrong</span>
          <h1>A small detour on <em>an otherwise good trip.</em></h1>
          <p>This page hit an unexpected problem. Your data is safe. Try again, or head back home.</p>
          <div className="error-boundary-actions">
            <button type="button" onClick={this.handleRetry}>Try again</button>
            <a href="#/" onClick={this.handleRetry}>Back to home</a>
          </div>
        </div>
      </main>
    );
  }
}
