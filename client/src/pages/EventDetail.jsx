import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate, fmtPrice, fmtTime, seatsLeft } from '../utils.js';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then((r) => setEvent(r.data.event)).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
  }, [id]);

  useEffect(() => {
    if (!user) return setRegistered(null);
    api.get('/registrations/mine').then((r) => setRegistered(r.data.registrations.find((x) => x.event._id === id) || false));
  }, [user, id]);

  const act = async (fn, okText) => {
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await fn();
      setMsg({ type: 'ok', text: okText });
    } catch (e) {
      setMsg({ type: 'error', text: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  const reserve = () => {
    if (!user) return navigate('/login', { state: { from: `/events/${id}` } });
    act(async () => {
      const { data } = await api.post(`/events/${id}/register`);
      setEvent((prev) => ({ ...prev, registeredCount: data.event.registeredCount }));
      setRegistered(data.registration);
    }, 'You are in. Your ticket is saved under My tickets.');
  };

  const cancel = () =>
    act(async () => {
      const { data } = await api.delete(`/events/${id}/register`);
      if (data.event) setEvent((prev) => ({ ...prev, registeredCount: data.event.registeredCount }));
      setRegistered(false);
    }, 'Registration cancelled.');

  if (!event) return msg.text ? <div className="alert error">{msg.text}</div> : <p className="muted">Loading…</p>;

  const left = seatsLeft(event);
  const past = new Date(event.date) < new Date();

  return (
    <article className="detail">
      {event.imageUrl && <img className="detail-img" src={event.imageUrl} alt="" />}
      <div className="detail-grid">
        <div>
          <span className="chip">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="muted">Hosted by {event.organizer?.name}</p>
          <p className="prose">{event.description}</p>
        </div>

        <aside className="panel">
          <dl>
            <dt>Date</dt><dd>{fmtDate(event.date)}, {fmtTime(event.date)}</dd>
            <dt>Place</dt><dd>{event.location}</dd>
            <dt>Price</dt><dd>{fmtPrice(event.price)}</dd>
            <dt>Seats</dt><dd>{past ? 'Event has ended' : left === 0 ? 'Sold out' : `${left} of ${event.capacity} left`}</dd>
          </dl>

          {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}

          {registered ? (
            <>
              <p className="ticket-code">Ticket <strong>{registered.ticketCode}</strong></p>
              {!past && <button className="btn ghost block" onClick={cancel} disabled={busy}>Cancel registration</button>}
            </>
          ) : (
            <button className="btn accent block" onClick={reserve} disabled={busy || past || left === 0}>
              {past ? 'Event ended' : left === 0 ? 'Sold out' : event.price > 0 ? `Reserve a seat · ${fmtPrice(event.price)}` : 'Reserve a free seat'}
            </button>
          )}
          {!user && !past && <p className="muted small-text">You will be asked to <Link to="/login" state={{ from: `/events/${id}` }}>log in</Link> first.</p>}
        </aside>
      </div>
    </article>
  );
}
