import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 mb-3">Unauthorized Access</h1>
        <p className="text-surface-500 mb-8 leading-relaxed">
          You don't have the required permissions to view this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
