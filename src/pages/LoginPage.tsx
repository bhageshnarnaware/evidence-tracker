import { useState } from 'react';
import { Fingerprint, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-border">
            <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">DSET System</h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            Digital Device Seizure & Evidence Tracking
          </p>
        </div>

        <form onSubmit={handleLogin} className="card-forensic space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <Label className="text-xs">Email Address</Label>
            <Input
              type="email"
              placeholder="agent@cyber.gov"
              className="mt-1"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>

          <div className="pt-2 border-t border-border space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">Demo Accounts:</p>
            <div className="grid grid-cols-1 gap-1">
              {[
                { email: 'schen@cyber.gov', role: 'Admin', pass: 'admin123' },
                { email: 'jrivera@cyber.gov', role: 'Investigator', pass: 'pass123' },
              ].map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                  className="text-left text-[10px] px-2 py-1.5 rounded bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <span className="text-primary font-medium">{acc.role}</span>
                  <span className="text-muted-foreground ml-2">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Authorized personnel only. All access is monitored and logged.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
