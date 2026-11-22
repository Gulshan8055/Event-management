import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { fmtDate, fmtTime } from '../utils.js';

export default function MyTickets() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/registrations/mine').then((r) => setItems(r.data.registrations));
  }, []);

  if (!items) return <p className="muted">Loading your tickets…</p>;
  if (items.length === 0)
    return (
      <div className="empty">
        <h2>No tickets yet</h2>
        <p>Reserve a seat and your ticket will show up here.</p>
        <Link className="btn" to="/events">Browse events</Link>
      </div>
    );

  return (
    <>
      <h1>My tickets</h1>
      <div className="list">
        {items.map(({ _id, ticketCode, event }) => (
          <Link key={_id} to={`/events/${event._id}`} className="list-item">
            <div>
              <h3>{event.title}</h3>
              <p className="muted">{fmtDate(event.date)}, {fmtTime(event.date)} · {event.location}</p>
            </div>
            <code className="code">{ticketCode}</code>
          </Link>
        ))}
      </div>
    </>
  );
}
