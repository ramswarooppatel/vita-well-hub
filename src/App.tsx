import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import RouteGuard from "@/components/auth/RouteGuard";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Telemedicine from "./pages/Telemedicine";
import SymptomChecker from "./pages/SymptomChecker";
import NotFound from "./pages/NotFound";
import CognitiveTests from "./pages/CognitiveTests";
import MemoryChallenge from "./pages/MemoryChallenge";
import CognitiveTestResult from "./pages/CognitiveTestResult";
import Admin from "./pages/Admin";
import DoctorDashboard from "./pages/DoctorDashboard";
import Rewards from "./pages/Rewards";
import Records from "./pages/Records";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DoctorOS from "./pages/DoctorOS";
import FindDoctors from "./pages/FindDoctors";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Patient routes */}
              <Route path="/dashboard" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Dashboard />
                </RouteGuard>
              } />
              <Route path="/appointments" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Appointments />
                </RouteGuard>
              } />
              <Route path="/telemedicine" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Telemedicine />
                </RouteGuard>
              } />
               <Route path="/records" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Records />
                </RouteGuard>
              } />
              <Route path="/symptoms" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <SymptomChecker />
                </RouteGuard>
              } />
              <Route path="/cognitive-tests" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <CognitiveTests />
                </RouteGuard>
              } />
              <Route path="/cognitive-tests/:testId" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <MemoryChallenge />
                </RouteGuard>
              } />
              <Route path="/cognitive-tests/results/:resultId" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <CognitiveTestResult />
                </RouteGuard>
              } />
              <Route path="/rewards" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Rewards />
                </RouteGuard>
              } />
              <Route path="/profile" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Profile />
                </RouteGuard>
              } />
              <Route path="/settings" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <Settings />
                </RouteGuard>
              } />
              <Route path="/doctors" element={
                <RouteGuard allowedRoles={["patient", "doctor", "admin"]}>
                  <FindDoctors />
                </RouteGuard>
              } />
              
              {/* Doctor routes */}
              <Route path="/doctor-dashboard" element={
                <RouteGuard allowedRoles={["doctor", "admin"]}>
                  <DoctorDashboard />
                </RouteGuard>
              } />
              <Route path="/doctoros" element={
                <RouteGuard allowedRoles={["doctor", "admin"]}>
                  <DoctorOS />
                </RouteGuard>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <RouteGuard allowedRoles={["admin"]}>
                  <Admin />
                </RouteGuard>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
