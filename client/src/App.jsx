import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/features/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CareerExplorer from './pages/CareerExplorer';
import AssessmentPage from './pages/Assessment';
import Skills from './pages/Skills';
import JobsPage from './pages/Jobs';
import Learning from './pages/Learning';
import Roadmap from './pages/Roadmap';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes with app layout */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/career-explorer"
        element={<ProtectedRoute><AppLayout><CareerExplorer /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/assessment"
        element={<ProtectedRoute><AppLayout><AssessmentPage /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/assessment/:id"
        element={<ProtectedRoute><AppLayout><AssessmentPage /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/assessment/:id/result/:attemptId"
        element={<ProtectedRoute><AppLayout><AssessmentPage /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/skills"
        element={<ProtectedRoute><AppLayout><Skills /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/jobs"
        element={<ProtectedRoute><AppLayout><JobsPage /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/jobs/:id"
        element={<ProtectedRoute><AppLayout><JobsPage /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/learning"
        element={<ProtectedRoute><AppLayout><Learning /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/roadmap"
        element={<ProtectedRoute><AppLayout><Roadmap /></AppLayout></ProtectedRoute>}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
