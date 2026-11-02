import { HashRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import GlobalExperienceLayer from './components/common/GlobalExperienceLayer';
import SiteCommandCenter from './components/common/SiteCommandCenter';
import Toaster from './components/common/Toaster';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CurrencyProvider>
          <GlobalExperienceLayer />
          <HashRouter>
            <SiteCommandCenter />
            <Toaster />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </HashRouter>
        </CurrencyProvider>
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
