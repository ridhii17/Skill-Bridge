import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, LayoutDashboard, UserCircle, Target, FileCheck,
  BarChart3, Briefcase, BookOpen, Map, LogOut, Menu, X,
  ChevronRight, Upload, Bot, FlaskConical, FileText, Shield, TrendingUp, Gauge,
} from 'lucide-react';

const baseNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/career-readiness', label: 'Career Readiness', icon: Gauge },
  { path: '/profile', label: 'Profile', icon: UserCircle },
  { path: '/career-explorer', label: 'Career Explorer', icon: Target },
  { path: '/assessment', label: 'Assessments', icon: FileCheck },
  { path: '/skills', label: 'Skill Analysis', icon: BarChart3 },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/learning', label: 'Learning', icon: BookOpen },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/resume', label: 'Resume Analyzer', icon: Upload },
  { path: '/resume-builder', label: 'Resume Builder', icon: FileText },
  { path: '/simulator', label: 'Career Simulator', icon: FlaskConical },
  { path: '/market-insights', label: 'Market Insights', icon: TrendingUp },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
];

const adminNavItems = [
  { path: '/admin', label: 'Admin', icon: Shield },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-surface-800">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Skill<span className="text-brand-400">Bridge</span>
            </span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-surface-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-surface-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center px-4 sm:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3 text-surface-600 hover:text-surface-900">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-surface-900">{user?.name}</p>
              <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
