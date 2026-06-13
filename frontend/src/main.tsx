import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

console.log('Locus Frontend Starting...');
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:4000');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find root element!');
  throw new Error('Root element not found');
}

console.log('Root element found, rendering app...');

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

console.log('App rendered successfully');
