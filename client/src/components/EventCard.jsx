import { Link } from 'react-router-dom';
import { fmtPrice, fmtTime, seatsLeft } from '../utils.js';

export default function EventCard({ event }) {
  const d = new Date(event.date);
  const left = seatsLeft(event);
  return (
    <Link to={`/events/${event._id}`} className="ticket">
      <div className="ticket-date">
        <span className="ticket-day">{d.getDate()}</span>
        <span>{d.toLocaleString('en-IN', { month: 'short' })}</span>
      </div>
      <div className="ticket-body">
        {event.imageUrl && <img src={event.imageUrl} alt="" loading="lazy" />}
        <div className="ticket-text">
          <span className="chip">{event.category}</span>
          <h3>{event.title}</h3>
          <p className="muted">{fmtTime(event.date)} · {event.location}</p>
          <div className="ticket-foot">
            <strong>{fmtPrice(event.price)}</strong>
            <span className={left === 0 ? 'bad' : left < 10 ? 'warn' : 'muted'}>
              {left === 0 ? 'Sold out' : `${left} seats left`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
