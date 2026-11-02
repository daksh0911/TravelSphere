import { useEffect } from 'react';
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
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
