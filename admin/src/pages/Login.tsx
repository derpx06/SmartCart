import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ShieldCheck, Sparkles, User } from 'lucide-react';

export default function Login() {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="login-shell">
      <div className="login-card glass">
        <section className="login-brand-panel">
          <div className="login-brand-badge">
            <ShieldCheck size={16} />
            <span>SmartCart Core</span>
          </div>

          <h1 className="login-brand-title">Operations Control Center</h1>
          <p className="login-brand-subtext">
            Monitor products, orders, and storefront performance from one secure workspace.
          </p>

          <div className="login-brand-points">
            <div className="login-point">
              <Sparkles size={14} />
              <span>Real-time product and order visibility</span>
            </div>
            <div className="login-point">
              <Sparkles size={14} />
              <span>Protected admin-only workflows</span>
            </div>
            <div className="login-point">
              <Sparkles size={14} />
              <span>Fast actions with clean dashboard controls</span>
            </div>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p className="text-muted">Sign in to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span className="login-field-label">Username</span>
              <div className="login-input-wrap">
                <User className="login-input-icon" size={18} />
                <input
                  type="text"
                  className="input-field login-input"
                  placeholder="admin@smartcart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field-label">Password</span>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" size={18} />
                <input
                  type="password"
                  className="input-field login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="btn btn-primary login-submit-btn">
              Access Dashboard
            </button>
            {authError ? <p className="login-error">{authError}</p> : null}
          </form>

          <p className="login-help text-muted">
            Need access? Contact your system administrator to provision credentials.
          </p>
        </section>
      </div>
    </div>
  );
}
