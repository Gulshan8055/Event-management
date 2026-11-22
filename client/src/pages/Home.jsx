
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import EventCard from "../components/EventCard.jsx";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/events", { params: { limit: 6 } })
      .then((r) => {
        const eventList = Array.isArray(r.data?.events)
          ? r.data.events
          : [];

        setEvents(eventList);
      })
      .catch((error) => {
        console.error("Home events error:", error);
        setEvents([]);
      })
      .finally(() => setLoading(false));
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
          Concerts, workshops, runs and meetups near you.
          Reserve a seat in under a minute, or host your own.
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

        {loading ? (
          <p className="muted">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="empty">
            <p>No upcoming events yet.</p>
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
          Create an organizer account to publish events,
          set capacity and see who is coming.
        </p>
        <Link className="btn accent" to="/register">
          Create organizer account
        </Link>
      </section>
    </>
  );
}
