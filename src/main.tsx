import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@/assets/fonts/fonts.css';

// Setze Titel und Favicon basierend auf Build-Modus
const setPageTitleAndFavicon = () => {
  const mode = import.meta.env.MODE;
  const isDev = mode === 'dev' || mode === 'dev-local';

  // Setze Titel
  const titleElement = document.getElementById('app-title') || document.querySelector('title');
  const title = isDev ? 'DEV - Admin Nürnbergspots' : 'Admin Nürnbergspots';

  if (titleElement) {
    titleElement.textContent = title;
  } else {
    document.title = title;
  }

  // Setze Favicon
  const faviconElement = document.getElementById('app-favicon') as HTMLLinkElement | null;
  if (faviconElement) {
    faviconElement.href = isDev ? '/app_icon_dev.jpeg' : '/app_icon_prod.png';
    faviconElement.type = isDev ? 'image/jpeg' : 'image/png';
  } else {
    // Fallback: Erstelle neues Favicon-Element falls nicht vorhanden
    const link = document.createElement('link');
    link.id = 'app-favicon';
    link.rel = 'icon';
    link.type = isDev ? 'image/jpeg' : 'image/png';
    link.href = isDev ? '/app_icon_dev.jpeg' : '/app_icon_prod.png';
    document.head.appendChild(link);
  }
};

// Setze Titel und Favicon beim Laden
setPageTitleAndFavicon();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
