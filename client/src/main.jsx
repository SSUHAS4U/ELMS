import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// The document.documentElement.setAttribute('data-theme') is handled strictly by useThemeStore inside App.jsx now.
// We removed ClerkProvider and BrowserRouter here because App.jsx explicitly handles its own Router map.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
