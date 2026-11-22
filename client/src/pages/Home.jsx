import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import EventCard from "../components/EventCard.jsx";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/events", { params: { limit: 6 } })
      .then((r) => setEvents(r.data.events) || [])
      .catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/events?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Find something worth leaving the house for.</h1>
        <p>
          Concerts, workshops, runs and meetups near you. Reserve a seat in
          under a minute, or host your own.
        </p>
        <form onSubmit={search} className="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by event, place or topic"
            aria-label="Search events"
          />
          <button className="btn accent">Search</button>
        </form>
      </section>

      <section>
        <div className="row-between">
          <h2>Coming up</h2>
          <Link to="/events">See all events</Link>
        </div>
        {events.length === 0 ? (
          <div className="empty">
            <p>
              No upcoming events yet. Run <code>npm run seed</code> to add
              sample events.
            </p>
          </div>
        ) : (
          <div className="grid">
            {events.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        )}
      </section>

      <section className="cta">
        <h2>Hosting something?</h2>
        <p>
          Create an organizer account to publish events, set capacity and see
          who is coming.
        </p>
        <Link className="btn accent" to="/register">
          Create organizer account
        </Link>
      </section>
    </>
  );
}
