import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MyTripsPage from './pages/trips/MyTripsPage';
import CreateTripPage from './pages/trips/CreateTripPage';
import TripDetailsPage from './pages/trips/TripDetailsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Placeholder Pages for upcoming integrations
const ExplorePage = () => (
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold text-slate-900">Explore Destinations</h1>
    <p className="text-slate-500 mt-2">Discover popular spots, filter by category and plan stops.</p>
  </div>
);

const AIPlannerPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold text-slate-900">AI Trip Planner</h1>
    <p className="text-slate-500 mt-2">Tell us your destination and budget — our AI builds your day-by-day plan.</p>
  </div>
);

const ProfilePage = () => (
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <h1 className="text-3xl font-bold text-slate-900">Profile & Travel Preferences</h1>
    <p className="text-slate-500 mt-2">Manage your interests, budget tier, and account settings.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/ai-planner" element={<AIPlannerPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <MyTripsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/create"
                element={
                  <ProtectedRoute>
                    <CreateTripPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id"
                element={
                  <ProtectedRoute>
                    <TripDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
