import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Ocurrió un error inesperado al mostrar esta vista.',
    };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-white border border-rose-200 p-6 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-black text-slate-900">
              Algo salió mal en esta pantalla
            </h1>
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm px-5 py-2.5 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recargar Portal Pastoral</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
