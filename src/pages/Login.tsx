import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Fingerprint, Lock, ShieldAlert } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication sequence failed');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-quantum-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
        transformOrigin: 'top center'
      }}></div>

      <div className="w-full max-w-md space-y-8 glass-panel p-10 rounded-2xl relative z-10 neon-border before:absolute before:inset-0 before:bg-gradient-to-b before:from-neon-cyan/5 before:to-transparent before:rounded-2xl before:pointer-events-none">
        
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-quantum-800 border border-neon-cyan/50 shadow-[0_0_20px_rgba(0,243,255,0.4)] relative">
            <div className="absolute inset-0 rounded-full border border-neon-cyan animate-ping opacity-50"></div>
            <Fingerprint className="h-8 w-8 text-neon-cyan neon-text-cyan" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-widest text-white uppercase font-mono neon-text-cyan">
            Neural Sync
          </h2>
          <p className="mt-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            Establish connection to Warlord Mainframe
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/30 flex items-center gap-3">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-mono uppercase text-xs">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="sr-only">Ident (Email)</label>
              <input
                type="email"
                required
                className="block w-full rounded-md border border-slate-700 bg-quantum-800/80 py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan sm:text-sm font-mono transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                placeholder="IDENT // admin@miracars.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only">Security Key</label>
              <input
                type="password"
                required
                className="block w-full rounded-md border border-slate-700 bg-quantum-800/80 py-3 px-4 text-slate-200 placeholder:text-slate-500 focus:border-neon-magenta focus:outline-none focus:ring-1 focus:ring-neon-magenta sm:text-sm font-mono transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                placeholder="KEY // **********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-transparent border border-neon-cyan px-4 py-3 text-sm font-bold uppercase tracking-widest text-neon-cyan transition-all duration-300 hover:bg-neon-cyan hover:text-quantum-900 hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] focus:outline-none disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neon-cyan disabled:hover:shadow-none"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 transition-colors group-hover:text-quantum-900" aria-hidden="true" />
              </span>
              {loading ? 'Authenticating...' : 'Initialize Uplink'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}