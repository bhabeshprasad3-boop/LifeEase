import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import DocumentListPage from '../pages/DocumentListPage';
import AddDocumentPage from '../pages/AddDocumentPage';
import EditDocumentPage from '../pages/EditDocumentPage';
import DocumentDetailPage from '../pages/DocumentDetailPage';
import RemindersPage from '../pages/RemindersPage';
import ProfileSettingsPage from '../pages/ProfileSettingsPage';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Loading screen while session validates
function SessionLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
        <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'var(--font-display)', fontSize: '0.875rem' }}>Loading your vault…</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <SessionLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Redirect authenticated users away from auth pages
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <SessionLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected — wrapped in AppLayout (sidebar + topbar) */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentListPage />} />
        <Route path="/documents/add" element={<AddDocumentPage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />
        <Route path="/documents/:id/edit" element={<EditDocumentPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
