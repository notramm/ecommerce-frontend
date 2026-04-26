import { Component } from 'react';
import { Link }      from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="eyebrow text-vermillion/50 mb-4 text-xs">Something went wrong</p>
            <h2 className="font-display text-3xl text-cream mb-3">Unexpected Error</h2>
            <p className="text-stone text-sm mb-3 leading-relaxed">
              {this.state.error?.message || 'An unknown error occurred.'}
            </p>
            <p className="text-stone/40 text-xs font-mono mb-8">
              Try refreshing the page. If the issue persists, contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-primary"
              >
                Reload Page
              </button>
              <Link to="/" className="btn-outline">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}