import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/useAuth';
import Home from '../pages/customer/Home';
import Vehicles from '../pages/customer/Vehicles';
import VehicleBooking from '../pages/customer/VehicleBooking';

const Destinations = lazy(() => import('../pages/customer/Destinations'));
const DestinationDetail = lazy(() => import('../pages/customer/DestinationDetail'));
const TourPackages = lazy(() => import('../pages/customer/TourPackages'));
const PackageDetail = lazy(() => import('../pages/customer/PackageDetail'));
const Hotels = lazy(() => import('../pages/customer/Hotels'));
const About = lazy(() => import('../pages/customer/About'));
const Contact = lazy(() => import('../pages/customer/Contact'));
const Support = lazy(() => import('../pages/customer/Support'));
const Legal = lazy(() => import('../pages/customer/Legal'));
const NotFound = lazy(() => import('../pages/NotFound'));
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AgentDashboard = lazy(() => import('../pages/agent/AgentDashboard'));
const HotelDashboard = lazy(() => import('../pages/hotel/HotelDashboard'));
const TransportDashboard = lazy(() => import('../pages/transport/TransportDashboard'));
const GuideDashboard = lazy(() => import('../pages/guide/GuideDashboard'));
const ItineraryPlanner = lazy(() => import('../pages/customer/ItineraryPlanner'));
const Transit = lazy(() => import('../pages/customer/Transit'));

// Protected Route Guard: checks auth status and role permissions
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <RouteLoadingBar />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  const userRole = (user?.role || '').toUpperCase();
  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RouteLoadingBar() {
  return (
    <div className="ts-route-loading-bar" role="progressbar" aria-label="Loading page">
      <div className="ts-route-loading-progress" />
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    let idleId = 0;
    let cancelled = false;

    const prefetchCommonRoutes = () => {
      if (cancelled) return;
      void Promise.all([
        import('../pages/customer/Destinations'),
        import('../pages/customer/TourPackages'),
        import('../pages/customer/Hotels'),
      ]);
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(prefetchCommonRoutes, { timeout: 2200 });
    } else {
      idleId = window.setTimeout(prefetchCommonRoutes, 1200);
    }

    return () => {
      cancelled = true;
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  return (
    <LayoutGroup id="travelsphere-route-layout">
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          className="route-transition-stage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Suspense fallback={<RouteLoadingBar />}>
            <Routes location={location}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

            {/* Separate protected role dashboards with slash and hyphen aliases */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'USER', 'ADMIN', 'SUPER_ADMIN']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'USER', 'ADMIN', 'SUPER_ADMIN']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'USER', 'ADMIN', 'SUPER_ADMIN']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'USER', 'ADMIN', 'SUPER_ADMIN']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent-dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRAVEL_AGENT', 'ADMIN', 'SUPER_ADMIN']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRAVEL_AGENT', 'ADMIN', 'SUPER_ADMIN']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotel-dashboard"
              element={
                <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
                  <HotelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotel/dashboard"
              element={
                <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
                  <HotelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transport-dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRANSPORT_PROVIDER', 'ADMIN', 'SUPER_ADMIN']}>
                  <TransportDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transport/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRANSPORT_PROVIDER', 'ADMIN', 'SUPER_ADMIN']}>
                  <TransportDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide-dashboard"
              element={
                <ProtectedRoute allowedRoles={['TOUR_GUIDE', 'ADMIN', 'SUPER_ADMIN']}>
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TOUR_GUIDE', 'ADMIN', 'SUPER_ADMIN']}>
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="destinations/:id" element={<DestinationDetail />} />
              <Route path="packages" element={<TourPackages />} />
              <Route path="tour-packages" element={<TourPackages />} />
              <Route path="packages/:id" element={<PackageDetail />} />
              <Route path="tour-packages/:id" element={<PackageDetail />} />
              <Route path="itinerary-planner" element={<ItineraryPlanner />} />
              <Route path="trip-planner" element={<ItineraryPlanner />} />
              <Route path="transport" element={<Transit />} />
              <Route path="flights" element={<Transit />} />
              <Route path="trains" element={<Transit />} />
              <Route path="buses" element={<Transit />} />
              <Route path="transit" element={<Transit />} />
              <Route path="hotels" element={<Hotels />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vehicles/:id" element={<VehicleBooking />} />
              <Route path="vehicles/book/:id" element={<VehicleBooking />} />
              <Route path="vehicle-booking/:id" element={<VehicleBooking />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<Support />} />
              <Route path="support" element={<Support />} />
              <Route path="terms" element={<Legal type="terms" />} />
              <Route path="privacy" element={<Legal type="privacy" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
