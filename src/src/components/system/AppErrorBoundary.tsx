import React from 'react'

interface State { hasError: boolean; message?: string }

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[IncomeOS] Unhandled render error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="system-fallback" role="alert">
        <img src="/favicon.png" alt="IncomeOS" />
        <h1>IncomeOS encountered an unexpected error</h1>
        <p>The application stopped safely before corrupting portfolio data.</p>
        {this.state.message && <pre>{this.state.message}</pre>}
        <button type="button" onClick={() => window.location.reload()}>Reload application</button>
      </main>
    )
  }
}
