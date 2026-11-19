import React, { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AdminUsersView } from './components/AdminUsersView.jsx';
import { AuthViews } from './components/AuthViews.jsx';
import { CitizenMapView } from './components/CitizenMapView.jsx';
import { MyReportsView } from './components/MyReportsView.jsx';
import { OfficialQueueView } from './components/OfficialQueueView.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { TopBar } from './components/TopBar.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import {
  canAccessView,
  getHomePathForRole,
  getPathForView,
  getViewFromPath,
} from './utils/civicLogic.js';

function RequireGuest({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }
  return children;
}

function RequireRole({ view, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!canAccessView(user.role, view)) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }
  return children;
}

function AuthenticatedLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const currentView = getViewFromPath(location.pathname) || 'map';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-civic-canvas text-civic-text">
      <TopBar currentView={currentView} />
      {children}
    </div>
  );
}

function CivicAlertShell() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [focusIssueId, setFocusIssueId] = useState(null);
  const [pinDropTrigger, setPinDropTrigger] = useState(0);
  const [autoStarted, setAutoStarted] = useState(false);

  // Optional ?autostart=1 support for automated checks
  useEffect(() => {
    if (loading || user || autoStarted) return;
    const params = new URLSearchParams(location.search);
    if (params.get('autostart') === '1') {
      setAutoStarted(true);
      login('citizen@civicalert.org', 'Citizen123!')
        .then(() => navigate('/map', { replace: true }))
        .catch(() => {});
    }
  }, [loading, user, autoStarted, login, location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-canvas flex items-center justify-center text-sm font-medium text-civic-text-muted">
        Loading Civic Alert...
      </div>
    );
  }

  const handleStartReport = () => {
    navigate('/map');
    setPinDropTrigger((prev) => prev + 1);
  };

  const homePath = user ? getHomePathForRole(user.role) : '/login';

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RequireGuest>
            <AuthViews
              mode="login"
              onSuccessRedirect={(nextView) =>
                navigate(getPathForView(nextView), { replace: true })
              }
            />
          </RequireGuest>
        }
      />
      <Route
        path="/register"
        element={
          <RequireGuest>
            <AuthViews
              mode="register"
              onSuccessRedirect={(nextView) =>
                navigate(getPathForView(nextView), { replace: true })
              }
            />
          </RequireGuest>
        }
      />

      <Route
        path="/map"
        element={
          <RequireRole view="map">
            <AuthenticatedLayout>
              <CitizenMapView
                focusIssueId={focusIssueId}
                pinDropTrigger={pinDropTrigger}
                onClearFocus={() => setFocusIssueId(null)}
              />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      <Route
        path="/reports"
        element={
          <RequireRole view="reports">
            <AuthenticatedLayout>
              <MyReportsView
                onLocateOnMap={(issueId) => {
                  setFocusIssueId(issueId);
                  navigate('/map');
                }}
                onReportNew={handleStartReport}
              />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      <Route
        path="/profile"
        element={
          <RequireRole view="profile">
            <AuthenticatedLayout>
              <ProfileView />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      <Route
        path="/official"
        element={
          <RequireRole view="official">
            <AuthenticatedLayout>
              <OfficialQueueView />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireRole view="admin">
            <AuthenticatedLayout>
              <AdminUsersView />
            </AuthenticatedLayout>
          </RequireRole>
        }
      />

      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CivicAlertShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
