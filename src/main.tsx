import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/components/theme-provider';
import { migrateLegacyStorage } from '@/lib/legacy-storage';
import '@/lib/i18n';
import './index.css';

// Before the first render: useStored reads its keys when the components mount.
migrateLegacyStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
