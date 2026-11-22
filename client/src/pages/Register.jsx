import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'organizer' ? '/dashboard' : '/events');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <h1>Create your account</h1>
      {error && <div className="alert error">{error}</div>}
      <label>Name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
      <fieldset>
        <legend>I want to</legend>
        <label className="radio"><input type="radio" name="role" checked={form.role === 'user'} onChange={() => setForm({ ...form, role: 'user' })} /> Attend events</label>
        <label className="radio"><input type="radio" name="role" checked={form.role === 'organizer'} onChange={() => setForm({ ...form, role: 'organizer' })} /> Host events</label>
      </fieldset>
      <button className="btn block" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
