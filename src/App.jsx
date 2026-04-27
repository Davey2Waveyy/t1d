import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PublicPage from './pages/PublicPage';
import { SettingsProvider } from './contexts/SettingsContext';
import Home from './components/v2/screens/Home';
import Glucose from './components/v2/screens/Glucose';
import Meals from './components/v2/screens/Meals';
import More from './components/v2/screens/More';
import MoreInsulin from './components/v2/screens/MoreInsulin';
import MoreSettings from './components/v2/screens/MoreSettings';
import GlucoseLogSheet from './components/v2/sheets/GlucoseLogSheet';
import MealLogSheet from './components/v2/sheets/MealLogSheet';
import InsulinLogSheet from './components/v2/sheets/InsulinLogSheet';

function ProtectedRoute({ children }) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/documentation" element={<PublicPage pageKey="documentation" />} />
        <Route path="/api-reference" element={<PublicPage pageKey="apiReference" />} />
        <Route path="/changelog" element={<PublicPage pageKey="changelog" />} />
        <Route path="/privacy-policy" element={<PublicPage pageKey="privacyPolicy" />} />
        <Route path="/terms-of-service" element={<PublicPage pageKey="termsOfService" />} />
        <Route path="/contact" element={<PublicPage pageKey="contact" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="glucose" element={<Glucose />} />
          <Route path="meals" element={<Meals />} />
          <Route path="more" element={<More />} />
          <Route path="more/insulin" element={<MoreInsulin />} />
          <Route path="more/settings" element={<MoreSettings />} />
          <Route path="glucose/log" element={<GlucoseLogSheet />} />
          <Route path="meals/log" element={<MealLogSheet />} />
          <Route path="insulin/log" element={<InsulinLogSheet />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppRoutes />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
