import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { fmtDate } from '../utils.js';

export default function Dashboard() {
  const [events, setEvents] = useState(null);
  const [open, setOpen] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/events/mine').then((r) => setEvents(r.data.events));
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    if (open === id) return setOpen(null);
    const { data } = await api.get(`/events/${id}/attendees`);
    setAttendees(data.attendees);
    setOpen(id);
  };

  const remove = async (e) => {
    if (!window.confirm(`Delete "${e.title}"? ${e.registeredCount} registrations will be removed.`)) return;
    try {
      await api.delete(`/events/${e._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (!events) return <p className="muted">Loading…</p>;
  const totalSeats = events.reduce((n, e) => n + e.registeredCount, 0);

  return (
    <>
      <div className="row-between">
        <h1>Your events</h1>
        <Link className="btn accent" to="/dashboard/new">Create event</Link>
      </div>
      {error && <div className="alert error">{error}</div>}

      <div className="stats">
        <div><strong>{events.length}</strong><span>events</span></div>
        <div><strong>{totalSeats}</strong><span>registrations</span></div>
        <div><strong>{events.filter((e) => new Date(e.date) > new Date()).length}</strong><span>upcoming</span></div>
      </div>

      {events.length === 0 ? (
        <div className="empty"><h3>You have not created an event yet</h3><Link className="btn" to="/dashboard/new">Create your first event</Link></div>
      ) : (
        <div className="list">
          {events.map((e) => (
            <div key={e._id} className="list-block">
              <div className="list-item static">
                <div>
                  <h3><Link to={`/events/${e._id}`}>{e.title}</Link></h3>
                  <p className="muted">{fmtDate(e.date)} · {e.registeredCount}/{e.capacity} registered</p>
                </div>
                <div className="actions">
                  <button className="btn ghost" onClick={() => toggle(e._id)}>{open === e._id ? 'Hide attendees' : 'Attendees'}</button>
                  <Link className="btn ghost" to={`/dashboard/${e._id}/edit`}>Edit</Link>
                  <button className="btn danger" onClick={() => remove(e)}>Delete</button>
                </div>
              </div>
              {open === e._id && (
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Ticket</th></tr></thead>
                  <tbody>
                    {attendees.length === 0 ? <tr><td colSpan="3" className="muted">No one has registered yet.</td></tr> :
                      attendees.map((a) => <tr key={a._id}><td>{a.user?.name}</td><td>{a.user?.email}</td><td><code>{a.ticketCode}</code></td></tr>)}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
