import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/useAuth';

import Home from '../pages/customer/Home';
import Destinations from '../pages/customer/Destinations';
import DestinationDetail from '../pages/customer/DestinationDetail';
import TourPackages from '../pages/customer/TourPackages';
import Hotels from '../pages/customer/Hotels';
import Vehicles from '../pages/customer/Vehicles';
import About from '../pages/customer/About';
import Contact from '../pages/customer/Contact';
import Support from '../pages/customer/Support';
import Legal from '../pages/customer/Legal';
import NotFound from '../pages/NotFound';
import CustomerDashboard from '../pages/customer/Dashboard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AgentDashboard from '../pages/agent/AgentDashboard';
import HotelDashboard from '../pages/hotel/HotelDashboard';
import TransportDashboard from '../pages/transport/TransportDashboard';
import GuideDashboard from '../pages/guide/GuideDashboard';

function RouteLoading() {
  return null;
}

function LazyPage({ component: Component, ...props }) {
  return <Component {...props} />;
}

// Protected Route Guard: never manufacture a client-side user or bypass authorization.
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <LayoutGroup id="travelsphere-route-layout">
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          className="route-transition-stage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
          <Route path="/login" element={<LazyPage component={Login} />} />
          <Route path="/register" element={<LazyPage component={Register} />} />

          {/* Separate protected role dashboards */}
          <Route
            path="/admin"
            element={(
              <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']}>
                <LazyPage component={AdminDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']}>
                <LazyPage component={AdminDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/user-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}>
                <LazyPage component={CustomerDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/customer-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}>
                <LazyPage component={CustomerDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/agent-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['TRAVEL_AGENT']}>
                <LazyPage component={AgentDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/hotel-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['HOTEL_MANAGER']}>
                <LazyPage component={HotelDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/transport-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['TRANSPORT_PROVIDER']}>
                <LazyPage component={TransportDashboard} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/guide-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['TOUR_GUIDE']}>
                <LazyPage component={GuideDashboard} />
              </ProtectedRoute>
            )}
          />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<LazyPage component={Home} />} />
            <Route path="destinations" element={<LazyPage component={Destinations} />} />
            <Route path="destinations/:id" element={<LazyPage component={DestinationDetail} />} />
            <Route path="packages" element={<LazyPage component={TourPackages} />} />
            <Route path="hotels" element={<LazyPage component={Hotels} />} />
            <Route path="vehicles" element={<LazyPage component={Vehicles} />} />
            <Route path="about" element={<LazyPage component={About} />} />
            <Route path="contact" element={<LazyPage component={Contact} />} />
            <Route path="faq" element={<LazyPage component={Support} />} />
            <Route path="support" element={<LazyPage component={Support} />} />
            <Route path="terms" element={<LazyPage component={Legal} type="terms" />} />
            <Route path="privacy" element={<LazyPage component={Legal} type="privacy" />} />
            <Route path="*" element={<LazyPage component={NotFound} />} />
          </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}

export default AppRoutes;
