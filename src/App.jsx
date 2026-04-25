import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PublicPage from './pages/PublicPage';
import { SettingsProvider } from './contexts/SettingsContext';

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
        />
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
