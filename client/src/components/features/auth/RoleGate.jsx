import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShieldX } from 'lucide-react';

export default function RoleGate({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Access Denied</h1>
          <p className="text-surface-500 mb-6">
            You don't have permission to access this page.{' '}
            {user
              ? `Your role (${user.role}) is not authorized.`
              : 'Please log in with an authorized account.'}
          </p>
          <a href="/" className="btn-primary">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return children || <Outlet />;
}
