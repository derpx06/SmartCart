import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>Admin Console</h2>
          <p className="text-muted" style={{ fontSize: '14px' }}>Sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <User style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Username"
              style={{ paddingLeft: '40px' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password"
              style={{ paddingLeft: '40px' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
            Access Dashboard
          </button>
          {authError ? <p style={{ color: 'var(--danger)', fontSize: '13px' }}>{authError}</p> : null}
        </form>
      </div>
    </div>
  );
}
