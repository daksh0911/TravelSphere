import { lazy, Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import GlobalExperienceLayer from './components/common/GlobalExperienceLayer';
import SiteCommandCenter from './components/common/SiteCommandCenter';
import Toaster from './components/common/Toaster';
import ErrorBoundary from './components/common/ErrorBoundary';
const LiveTravelMessenger = lazy(() => import('./components/common/LiveTravelMessenger'));

function App() {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches);

  return (
    <MotionConfig reducedMotion={isMobile ? 'always' : 'user'}>
      <AuthProvider>
        <CurrencyProvider>
          <GlobalExperienceLayer />
          <HashRouter>
            <SiteCommandCenter />
            <Toaster />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <Suspense fallback={null}>
              <LiveTravelMessenger />
            </Suspense>
          </HashRouter>
        </CurrencyProvider>
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
