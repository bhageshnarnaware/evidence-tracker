import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Array<User & { password: string }> = [
  { id: 'u1', name: 'Sarah Chen', email: 'schen@cyber.gov', role: 'admin', department: 'Cybercrime Unit', created_at: '2024-01-15', password: 'admin123' },
  { id: 'u2', name: 'James Rivera', email: 'jrivera@cyber.gov', role: 'investigator', department: 'Digital Forensics', created_at: '2024-02-01', password: 'pass123' },
  { id: 'u3', name: 'Dr. Aisha Patel', email: 'apatel@cyber.gov', role: 'forensic_analyst', department: 'Digital Forensics', created_at: '2024-02-10', password: 'pass123' },
  { id: 'u4', name: 'Marcus Johnson', email: 'mjohnson@cyber.gov', role: 'evidence_custodian', department: 'Evidence Management', created_at: '2024-03-01', password: 'pass123' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('dset_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const { password: _, ...userWithoutPass } = found;
    setUser(userWithoutPass);
    localStorage.setItem('dset_auth_user', JSON.stringify(userWithoutPass));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dset_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
