import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Registrar Service Worker para habilitar instalación PWA (PC, Android y tablets)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL || './'}sw.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('No se pudo registrar el Service Worker PWA:', err);
    });
  });
}
