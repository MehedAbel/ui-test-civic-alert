import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { CivicShieldLogo } from './CivicBrand.jsx';
import { CIVIC_INPUT_CLASS, FormField } from './FormField.jsx';

export function AuthViews({ mode, onSuccessRedirect }) {
  const { login, registerCitizen } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotHint, setShowForgotHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const passwordsMismatch =
    mode === 'register' &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (combinedName.length < 2) {
        setError('Please enter your first and last name.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        if (user.role === 'Citizen') onSuccessRedirect('map');
        else if (user.role === 'Official') onSuccessRedirect('official');
        else onSuccessRedirect('admin');
      } else {
        const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await registerCitizen({
          fullName: combinedName,
          email,
          password,
          phoneNumber: phoneNumber || undefined,
          neighborhood: neighborhood || undefined,
        });
        onSuccessRedirect('map');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-civic-auth-bg flex flex-col items-center justify-center p-4 sm:p-6 relative transition-colors">
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-civic-pill bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <main className="w-full max-w-[var(--civic-auth-max-w)]">
        <div className="rounded-civic-card bg-civic-surface dark:border dark:border-civic-border shadow-civic-modal px-7 py-8 sm:px-9 sm:py-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-civic-text">
              <span>Civic</span>
              <CivicShieldLogo variant="blue" className="w-8 h-8" />
              <span>Alert</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-civic-text">
              {mode === 'login' ? 'Welcome' : 'Register'}
            </h1>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-civic-control border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <FormField id="auth-firstname" label="First Name">
                  <input
                    id="auth-firstname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className={CIVIC_INPUT_CLASS}
                  />
                </FormField>

                <FormField id="auth-lastname" label="Last Name">
                  <input
                    id="auth-lastname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Rivera"
                    className={CIVIC_INPUT_CLASS}
                  />
                </FormField>
              </>
            )}

            <FormField id="auth-email" label="Email">
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={CIVIC_INPUT_CLASS}
              />
            </FormField>

            <FormField id="auth-password" label="Password">
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 8 : 6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'register'
                      ? 'Minimum 8 characters'
                      : 'Enter your password'
                  }
                  className={`${CIVIC_INPUT_CLASS} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-civic-text-faint hover:text-civic-text-muted cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            {mode === 'register' && (
              <>
                <FormField
                  id="auth-confirm-password"
                  label="Confirm Password"
                  error={passwordsMismatch ? 'Passwords do not match' : null}
                >
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={CIVIC_INPUT_CLASS}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField id="auth-phone" label="Phone (optional)">
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className={CIVIC_INPUT_CLASS}
                    />
                  </FormField>
                  <FormField id="auth-neighborhood" label="Neighborhood (optional)">
                    <input
                      id="auth-neighborhood"
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Central District"
                      className={CIVIC_INPUT_CLASS}
                    />
                  </FormField>
                </div>
              </>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="inline-flex items-center gap-2 text-civic-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-civic-border-strong accent-civic-primary"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotHint((prev) => !prev)}
                  className="text-civic-accent hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'login' && showForgotHint && (
              <p className="rounded-civic-control bg-civic-surface-subtle px-3 py-2 text-xs text-civic-text-muted">
                Contact your municipal system administrator to reset Official/Admin passwords, or use the demo accounts below.
              </p>
            )}

            <div className="text-center text-xs text-civic-text-muted pt-1">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    onClick={() => setError(null)}
                    className="text-civic-accent font-semibold hover:underline"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    onClick={() => setError(null)}
                    className="text-civic-accent font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {mode === 'register' && (
              <p className="text-center text-[11px] text-civic-text-subtle">
                Public registration creates Citizen accounts only. Official and Admin roles are assigned by an administrator.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-civic-pill bg-civic-primary hover:bg-civic-primary-hover disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              {submitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>

          {/* {mode === 'login' && (
            <div className="pt-3 border-t border-civic-border space-y-2">
              <p className="text-center text-[11px] font-medium text-civic-text-subtle">
                Quick-fill demo roles:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyDemoCredentials('citizen@civicalert.org', 'Citizen123!')
                  }
                  className="rounded-civic-control border border-civic-border-soft bg-civic-pill hover:bg-civic-pill-hover px-2 py-1.5 text-xs font-medium text-civic-text-secondary transition-colors cursor-pointer"
                >
                  Fill Citizen
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyDemoCredentials('official@civicalert.org', 'Official123!')
                  }
                  className="rounded-civic-control border border-civic-border-soft bg-civic-pill hover:bg-civic-pill-hover px-2 py-1.5 text-xs font-medium text-civic-text-secondary transition-colors cursor-pointer"
                >
                  Fill Official
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyDemoCredentials('admin@civicalert.org', 'Admin123!')
                  }
                  className="rounded-civic-control border border-civic-border-soft bg-civic-pill hover:bg-civic-pill-hover px-2 py-1.5 text-xs font-medium text-civic-text-secondary transition-colors cursor-pointer"
                >
                  Fill Admin
                </button>
              </div>
            </div>
          )} */}
        </div>
      </main>
    </div>
  );
}
