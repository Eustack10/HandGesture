"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="crash">
        <p className="crash-kicker">Something went wrong</p>
        <h1>The studio hit an unexpected error.</h1>
        <p className="crash-detail">{this.state.error.message}</p>
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          Reload app
        </button>
      </div>
    );
  }
}
