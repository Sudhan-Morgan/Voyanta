import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  MapPin,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  Route,
  Heart,
  Camera,
  ChevronDown,
  Sliders,
  Users,
  Copy,
  Check,
  Mail,
  Phone
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Route Map', path: '/routes', icon: Route },
    { name: 'AI Planner', path: '/ai-planner', icon: Sparkles },
    ...(isAuthenticated
      ? [
          { name: 'My Trips', path: '/trips', icon: Calendar },
          { name: 'Dashboard', path: '/dashboard', icon: MapPin },
        ]
      : []),
  ];

  const favoritePlacesCount = user?.favoritePlaces?.length || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Voy<span className="text-indigo-600">anta</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                AI Travel Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative flex items-center" ref={dropdownRef}>
                {/* Profile Pill Button: Direct link to /profile + dropdown toggle arrow */}
                <div className="flex items-center rounded-full border border-slate-200/90 hover:border-indigo-300 transition-all bg-white shadow-xs hover:shadow-sm">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-l-full hover:bg-slate-50 transition-colors group cursor-pointer"
                    title="Open Profile & Settings"
                  >
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all"
                    />
                    <div className="text-left">
                      <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate block leading-tight">
                        {user?.name}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-medium block leading-none">
                        {user?.phoneNumber ? user.phoneNumber : 'Profile & Settings'}
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="pl-1 pr-2.5 py-2.5 rounded-r-full text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer border-l border-slate-100"
                    title="Toggle Profile Quick Menu"
                    aria-label="Toggle profile quick menu"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Direct Visible Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out of Voyanta"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/80 transition-all cursor-pointer shadow-xs hover:shadow-sm hover:scale-[1.02]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-900/10 py-2 z-50 animate-in fade-in zoom-in-95">
                    {/* User Summary Header - clickable to full profile */}
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-3 border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      title="Go to Full Profile & Settings"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={user?.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                        />
                        <div className="overflow-hidden flex-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600">{user?.name}</h4>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {user?.email}
                          </p>
                          <p className="text-[11px] text-indigo-600 truncate flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                            {user?.phoneNumber ? user.phoneNumber : '+ Add phone number'}
                          </p>
                        </div>
                      </div>

                      {/* Unique User ID Badge */}
                      <div className="mt-2.5 flex items-center justify-between bg-indigo-50/80 border border-indigo-100/90 rounded-lg px-2.5 py-1">
                        <span className="text-[11px] font-mono font-bold text-indigo-950 flex items-center gap-1">
                          User ID: #{user?.userNumber || '------'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (user?.userNumber) {
                              navigator.clipboard.writeText(user.userNumber.toString());
                              setCopiedId(true);
                              setTimeout(() => setCopiedId(false), 2000);
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer ml-2"
                          title="Copy your User ID"
                        >
                          {copiedId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </Link>

                    {/* Menu Links */}
                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/profile?tab=personal"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Camera className="w-4 h-4 text-indigo-500" />
                          <span>Profile & Contact Info</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Edit</span>
                      </Link>

                      <Link
                        to="/profile?tab=friends"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-indigo-500" />
                          <span>Friends & Connections</span>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                          Connect
                        </span>
                      </Link>

                      <Link
                        to="/profile?tab=favorites"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>Favorite Places</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                          {favoritePlacesCount}
                        </span>
                      </Link>

                      <Link
                        to="/profile?tab=preferences"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-indigo-500" />
                        <span>Travel Preferences</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Full Profile & Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="p-1 pt-1.5 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Icon className="w-4 h-4 text-indigo-500" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile?tab=personal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>Profile & Photo ({user?.name})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Edit</span>
                </Link>

                <Link
                  to="/profile?tab=friends"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Friends & Connections</span>
                  </div>
                  {user?.userNumber && (
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      ID: #{user.userNumber}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile?tab=favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Favorite Places</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 font-bold">
                    {favoritePlacesCount}
                  </span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Full Profile & Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
