import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Settings,
  MessageSquare,
  Dumbbell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  Bell,
  Moon
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/slot-booking', label: 'Slot Booking', icon: Dumbbell },
  { path: '/history', label: 'My History', icon: Clock },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const coordinatorItems = [
  { path: '/coordinator/events', label: 'Manage Events', icon: CalendarDays },
  { path: '/coordinator/venues', label: 'Book Venue', icon: LayoutDashboard },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isCoordinator = user?.roles?.some(r => ['coordinator', 'executive', 'admin'].includes(r));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-sidebar
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-400/20 border border-brand-400/30 flex items-center justify-center mr-3">
             <span className="text-brand-400 font-bold text-lg leading-none">P</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            PATANG
          </h1>
          <div className="flex-1" />
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-brand-100 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} className={({ isActive }) => isActive ? 'text-white' : 'text-brand-200'} />
              {label}
            </NavLink>
          ))}

          {isCoordinator && (
            <>
              <div className="my-6 border-t border-white/10" />
              <p className="px-4 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-3">
                Coordinators
              </p>
              {coordinatorItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-brand-100 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} className={({ isActive }) => isActive ? 'text-white' : 'text-brand-200'} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Logout (Bottom of Sidebar based on mockup) */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-brand-100 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} className="text-brand-200" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Topbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-20 bg-transparent flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center">
         <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 mr-2"
        >
          <Menu size={20} />
        </button>
        {/* Breadcrumb / Title area could go here, left empty for now to match layout context */}
      </div>

      <div className="flex items-center gap-4">
        {/* Mock Topbar Icons */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
          <Moon size={20} />
        </button>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        {/* Profile Dropdown Area */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="hidden md:block text-right">
               <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {user?.email?.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ') || 'User Name'}
               </p>
               <p className="text-xs text-gray-500">
                 Student
               </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <User size={20} className="text-brand-600" />
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-14 z-50 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
