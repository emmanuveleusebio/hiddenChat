import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global Production CSS Reset
const style = document.createElement('style');
style.innerHTML = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body, #root {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw;
    height: 100dvh;
    height: -webkit-fill-available; /* Fix for iOS Safari */
    overflow: hidden;
    background-color: #000;
    position: fixed; /* Prevents bounce scroll */
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);