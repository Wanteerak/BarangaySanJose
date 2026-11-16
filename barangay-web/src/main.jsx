import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './sidebar.css';

// PWA: register service worker (kung supported ng browser)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
