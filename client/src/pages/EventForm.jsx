import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { toLocalInput } from '../utils.js';

const CATEGORIES = ['Music', 'Tech', 'Business', 'Art', 'Food', 'Sports', 'Education', 'Community'];
const blank = { title: '', description: '', category: 'Tech', date: '', location: '', imageUrl: '', price: 0, capacity: 50 };

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`).then(({ data }) => setForm({ ...data.event, date: toLocalInput(data.event.date) }));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      title: form.title, description: form.description, category: form.category, location: form.location,
      imageUrl: form.imageUrl, date: new Date(form.date).toISOString(),
      price: Number(form.price), capacity: Number(form.capacity),
    };
    try {
      if (id) await api.put(`/events/${id}`, body);
      else await api.post('/events', body);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth wide" onSubmit={submit}>
      <h1>{id ? 'Edit event' : 'Create event'}</h1>
      {error && <div className="alert error">{error}</div>}
      <label>Title<input required maxLength={120} value={form.title} onChange={set('title')} /></label>
      <label>Description<textarea required rows={5} value={form.description} onChange={set('description')} /></label>
      <div className="two">
        <label>Category
          <select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label>Date and time<input type="datetime-local" required value={form.date} onChange={set('date')} /></label>
      </div>
      <label>Location<input required value={form.location} onChange={set('location')} /></label>
      <label>Image link (optional)<input type="url" placeholder="https://" value={form.imageUrl} onChange={set('imageUrl')} /></label>
      <div className="two">
        <label>Price in ₹ (0 for free)<input type="number" min="0" value={form.price} onChange={set('price')} /></label>
        <label>Capacity<input type="number" min="1" required value={form.capacity} onChange={set('capacity')} /></label>
      </div>
      <button className="btn block" disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Publish event'}</button>
    </form>
  );
}
