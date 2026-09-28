import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MissionProvider } from './context/MissionContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MissionProvider>
      <App />
    </MissionProvider>
  </React.StrictMode>
);
