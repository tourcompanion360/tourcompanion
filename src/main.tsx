// Ensure the scheduler fix runs before any React/ReactDOM imports.
// This helps avoid runtime errors where vendor bundles access
// unstable_scheduleCallback before a scheduler implementation exists.
import './react-scheduler-fix.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { runDeploymentDiagnostics } from './utils/deploymentDiagnostics'

// Simple test to see if React is working
console.log('🚀 Main.tsx loaded successfully');

// Ensure favicon loads immediately
const updateFavicon = () => {
  const favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = '/favicon.ico?v=' + Date.now();
  }
  
  // Also update other favicon links
  const faviconPng = document.querySelector('link[rel="icon"][type="image/png"]') as HTMLLinkElement;
  if (faviconPng) {
    faviconPng.href = '/favicon-96x96.png?v=' + Date.now();
  }
  
  const faviconSvg = document.querySelector('link[rel="icon"][type="image/svg+xml"]') as HTMLLinkElement;
  if (faviconSvg) {
    faviconSvg.href = '/favicon.svg?v=' + Date.now();
  }
};

// Update favicon immediately when the app loads
updateFavicon();

// Initialize PWA features only in production to avoid dev caching/blank screens
if (import.meta.env.PROD) {
  import('./utils/pwaUtils').then(({ registerServiceWorker, setupOfflineDetection }) => {
    registerServiceWorker();
    setupOfflineDetection();
  }).catch((error) => {
    console.warn('PWA utils not available:', error);
  });
} else {
  // In development, proactively unregister any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
}

// Run deployment diagnostics
runDeploymentDiagnostics();

// Try to render the app with error handling
try {
  console.log('🎯 Attempting to render App component...');
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to render app:', error);
  
  // Fallback: render a simple error message
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>App Loading Error</h1>
        <p>There was an error loading the application.</p>
        <p>Error: ${error.message}</p>
        <button onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
  }
}
