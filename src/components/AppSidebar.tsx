import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Smartphone, Shield, Link2,
  Archive, FlaskConical, FileText, ScrollText, Users, LogOut, Fingerprint
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cases', icon: FolderOpen, label: 'Cases' },
  { to: '/devices', icon: Smartphone, label: 'Devices' },
  { to: '/evidence', icon: Shield, label: 'Evidence' },
  { to: '/custody', icon: Link2, label: 'Chain of Custody' },
  { to: '/storage', icon: Archive, label: 'Storage' },
  { to: '/forensics', icon: FlaskConical, label: 'Forensics' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/users', icon: Users, label: 'User Management' },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const roleLabel = user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">DSET System</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Evidence Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-sidebar-accent text-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-muted-foreground hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
