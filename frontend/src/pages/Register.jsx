import React, { useState } from 'react';
import { ArrowRight, CircleAlert, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

function Register({ navigate }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ name: name.trim(), email: email.trim(), password, confirm_password: confirmPassword });
      navigate('dashboard');
    } catch (err) {
      setError(err.message || 'Unable to create the account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'rounded-lg border border-[#4C6A57] bg-[#0C2C1E] px-3.5 py-2.5 text-sm text-parchment outline-none transition placeholder:text-[#7E9A88] focus:border-turmeric';

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a farmer to unlock your private detection dashboard."
      onBack={() => navigate('home')}
      footer={<>Already have an account? <button type="button" onClick={() => navigate('login')} className="font-semibold text-turmeric underline underline-offset-2 hover:text-[#E6AB3B]">Sign in</button></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BFD5C3]">Full name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Priya Patel"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BFD5C3]">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="farmer@example.com"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BFD5C3]">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BFD5C3]">Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            className={inputClass}
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
          {loading ? <><Loader2 size={17} className="animate-spin" /> Creating account...</> : <><UserPlus size={17} /> Create account <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;