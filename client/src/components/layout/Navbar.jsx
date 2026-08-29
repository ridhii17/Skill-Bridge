import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Menu, X, Search, LogOut, ChevronDown,
  LayoutDashboard, Target, FileCheck, BarChart3, Briefcase,
  BookOpen, Map, Shield, User, FlaskConical, Bot, FileText, Upload, TrendingUp,
} from 'lucide-react';

const publicLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Careers', to: '/career-explorer' },
  { label: 'Jobs', to: '/jobs' },
];

const candidateLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Careers', to: '/career-explorer', icon: Target },
  { label: 'Assess', to: '/assessment', icon: FileCheck },
  { label: 'Skills', to: '/skills', icon: BarChart3 },
  { label: 'Jobs', to: '/jobs', icon: Briefcase },
  { label: 'Learn', to: '/learning', icon: BookOpen },
  { label: 'Roadmap', to: '/roadmap', icon: Map },
];

const moreLinks = [
  { label: 'Resume Analyzer', to: '/resume', icon: Upload },
  { label: 'Resume Builder', to: '/resume-builder', icon: FileText },
  { label: 'AI Assistant', to: '/assistant', icon: Bot },
  { label: 'Simulator', to: '/simulator', icon: FlaskConical },
  { label: 'Market Insights', to: '/market-insights', icon: TrendingUp },
];

export default function Navbar({ onSearchOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-brand-600'
        : isLanding
          ? 'text-surface-600 hover:text-surface-900'
          : 'text-surface-500 hover:text-surface-900'
    }`;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
      isLanding ? 'bg-white/80 backdrop-blur-lg border-b border-surface-100' : 'bg-white border-b border-surface-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900 hidden sm:block">
              Skill<span className="text-brand-600">Bridge</span> AI
            </span>
          </Link>

          {/* Center nav — desktop */}
          {!isAuthenticated && (
            <div className="hidden lg:flex items-center gap-6">
              {publicLinks.map((link) =>
                link.to ? (
                  <Link key={link.label} to={link.to} className={navLinkClass(link.to)}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className={navLinkClass('')}>
                    {link.label}
                  </a>
                )
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {candidateLinks.map((link) => (
                <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
              {/* More dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    moreOpen ? 'text-brand-600' : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  More <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-surface-200 shadow-lg py-1 z-50">
                      {moreLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                        >
                          <link.icon className="w-4 h-4 text-surface-400" />
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <>
                          <div className="border-t border-surface-100 my-1" />
                          <Link
                            to="/admin"
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-surface-400" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth buttons — desktop */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* User menu — desktop */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-surface-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {!isAuthenticated && (
              <>
                {publicLinks.map((link) =>
                  link.to ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                    >
                      {link.label}
                    </a>
                  )
                )}
                <div className="border-t border-surface-100 my-2" />
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 text-center mt-2">
                  Get Started
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {candidateLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      location.pathname === link.to
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-surface-100 my-2" />
                <p className="px-3 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">More</p>
                {moreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <div className="border-t border-surface-100 my-2" />
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
