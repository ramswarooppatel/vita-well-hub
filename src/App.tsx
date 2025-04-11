
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import RouteGuard from '@/components/auth/RouteGuard';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import DoctorDashboard from '@/pages/DoctorDashboard';
import DoctorOS from '@/pages/DoctorOS';
import Appointments from '@/pages/Appointments';
import CognitiveTests from '@/pages/CognitiveTests';
import MemoryChallenge from '@/pages/MemoryChallenge';
import CognitiveTestResult from '@/pages/CognitiveTestResult';
import Records from '@/pages/Records';
import Rewards from '@/pages/Rewards';
import SymptomChecker from '@/pages/SymptomChecker';
import Telemedicine from '@/pages/Telemedicine';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import FindDoctors from '@/pages/FindDoctors';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import Admin from '@/pages/Admin';

// Admin pages
import AdminIndex from '@/pages/admin/index';
import UserManagement from '@/pages/admin/UserManagement';
import ContentManagement from '@/pages/admin/ContentManagement';
import Analytics from '@/pages/admin/Analytics';
import ActivityLogs from '@/pages/admin/ActivityLogs';

import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vwh-theme">
      <AuthProvider>
        <Router>
          <Helmet>
            <title>VitaWellHub - Your Health Platform</title>
            <meta name="description" content="Comprehensive healthcare platform for patients and healthcare providers" />
          </Helmet>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Patient Routes */}
            <Route path="/dashboard" element={
              <RouteGuard allowedRoles={['patient', 'admin']}>
                <Dashboard />
              </RouteGuard>
            } />
            <Route path="/appointments" element={
              <RouteGuard allowedRoles={['patient', 'doctor', 'admin']}>
                <Appointments />
              </RouteGuard>
            } />
            <Route path="/cognitive-tests" element={
              <RouteGuard allowedRoles={['patient', 'admin']}>
                <CognitiveTests />
              </RouteGuard>
            } />
            <Route path="/cognitive-tests/:testId" element={
              <RouteGuard allowedRoles={['patient', 'admin']}>
                <MemoryChallenge />
              </RouteGuard>
            } />
            <Route path="/cognitive-tests/result/:resultId" element={
              <RouteGuard allowedRoles={['patient', 'doctor', 'admin']}>
                <CognitiveTestResult />
              </RouteGuard>
            } />
            <Route path="/records" element={
              <RouteGuard allowedRoles={['patient', 'doctor', 'admin']}>
                <Records />
              </RouteGuard>
            } />
            <Route path="/rewards" element={
              <RouteGuard allowedRoles={['patient', 'admin']}>
                <Rewards />
              </RouteGuard>
            } />
            <Route path="/symptom-checker" element={
              <RouteGuard allowedRoles={['patient', 'admin']}>
                <SymptomChecker />
              </RouteGuard>
            } />
            <Route path="/telemedicine" element={
              <RouteGuard allowedRoles={['patient', 'doctor', 'admin']}>
                <Telemedicine />
              </RouteGuard>
            } />
            <Route path="/find-doctors" element={
              <RouteGuard allowedRoles={['patient', 'admin']}>
                <FindDoctors />
              </RouteGuard>
            } />
            
            {/* Doctor Routes */}
            <Route path="/doctor-dashboard" element={
              <RouteGuard allowedRoles={['doctor', 'admin']}>
                <DoctorDashboard />
              </RouteGuard>
            } />
            <Route path="/doctor-os" element={
              <RouteGuard allowedRoles={['doctor', 'admin']}>
                <DoctorOS />
              </RouteGuard>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RouteGuard allowedRoles={['admin']}>
                <Admin />
              </RouteGuard>
            } />
            <Route path="/admin/dashboard" element={
              <RouteGuard allowedRoles={['admin']}>
                <AdminIndex />
              </RouteGuard>
            } />
            <Route path="/admin/users" element={
              <RouteGuard allowedRoles={['admin']}>
                <UserManagement />
              </RouteGuard>
            } />
            <Route path="/admin/content" element={
              <RouteGuard allowedRoles={['admin']}>
                <ContentManagement />
              </RouteGuard>
            } />
            <Route path="/admin/analytics" element={
              <RouteGuard allowedRoles={['admin']}>
                <Analytics />
              </RouteGuard>
            } />
            <Route path="/admin/activity-logs" element={
              <RouteGuard allowedRoles={['admin']}>
                <ActivityLogs />
              </RouteGuard>
            } />
            
            {/* Common Routes */}
            <Route path="/profile" element={
              <RouteGuard>
                <Profile />
              </RouteGuard>
            } />
            <Route path="/settings" element={
              <RouteGuard>
                <Settings />
              </RouteGuard>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
