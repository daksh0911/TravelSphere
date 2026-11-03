import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/useAuth';

const Home = lazy(() => import('../pages/customer/Home'));
const Destinations = lazy(() => import('../pages/customer/Destinations'));
const DestinationDetail = lazy(() => import('../pages/customer/DestinationDetail'));
const TourPackages = lazy(() => import('../pages/customer/TourPackages'));
const Hotels = lazy(() => import('../pages/customer/Hotels'));
const Vehicles = lazy(() => import('../pages/customer/Vehicles'));
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

// Protected Route Guard: checks auth status and role permissions
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
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
          <Suspense fallback={<div className="route-loading" role="status">Loading TravelSphere...</div>}>
            <Routes location={location}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

            {/* Separate protected role dashboards */}
            <Route
              path="/admin"
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
                <ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent-dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRAVEL_AGENT']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotel-dashboard"
              element={
                <ProtectedRoute allowedRoles={['HOTEL_MANAGER']}>
                  <HotelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transport-dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRANSPORT_PROVIDER']}>
                  <TransportDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide-dashboard"
              element={
                <ProtectedRoute allowedRoles={['TOUR_GUIDE']}>
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="destinations/:id" element={<DestinationDetail />} />
              <Route path="packages" element={<TourPackages />} />
              <Route path="itinerary-planner" element={<ItineraryPlanner />} />
              <Route path="trip-planner" element={<ItineraryPlanner />} />
              <Route path="hotels" element={<Hotels />} />
              <Route path="vehicles" element={<Vehicles />} />
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
