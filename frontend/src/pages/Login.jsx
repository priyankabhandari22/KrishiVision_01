import React, { useState } from 'react';
import { ArrowRight, CircleAlert, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

function Login({ navigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter both your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your farmer workspace to run scans and review your grove."
      onBack={() => navigate('home')}
      footer={<>New to KrishiVision? <button type="button" onClick={() => navigate('register')} className="font-semibold text-turmeric underline underline-offset-2 hover:text-[#E6AB3B]">Create an account</button></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BFD5C3]">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="farmer@example.com"
            className="rounded-lg border border-[#4C6A57] bg-[#0C2C1E] px-3.5 py-2.5 text-sm text-parchment outline-none transition placeholder:text-[#7E9A88] focus:border-turmeric"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BFD5C3]">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className="rounded-lg border border-[#4C6A57] bg-[#0C2C1E] px-3.5 py-2.5 text-sm text-parchment outline-none transition placeholder:text-[#7E9A88] focus:border-turmeric"
          />
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rust/50 bg-rust/15 px-3 py-2.5 text-sm text-[#FFD9C9]">
            <CircleAlert size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-turmeric px-4 py-3 text-sm font-semibold text-forestDeep shadow-[0_8px_20px_rgba(217,154,43,0.2)] transition hover:bg-[#E6AB3B] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in...</> : <><LogIn size={17} /> Sign in <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;