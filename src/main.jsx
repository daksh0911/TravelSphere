import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

// Dismiss the HTML splash screen once React is hydrated
const dismissSplash = () => {
  const splash = document.getElementById('ts-splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 120);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Splash fades out after first paint
requestAnimationFrame(() => requestAnimationFrame(dismissSplash));
