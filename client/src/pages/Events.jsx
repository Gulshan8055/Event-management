import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import EventCard from '../components/EventCard.jsx';

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ events: [], pages: 1, categories: [] });
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(params.get('q') || '');

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const when = params.get('when') || 'upcoming';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    api.get('/events', { params: { q, category, when, page, limit: 9 } })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [q, category, when, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  return (
    <>
      <h1>Events</h1>
      <div className="filters">
        <form onSubmit={(e) => { e.preventDefault(); update({ q: text }); }} className="search small">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search events" aria-label="Search events" />
          <button className="btn">Search</button>
        </form>
        <select value={category} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {data.categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={when} onChange={(e) => update({ when: e.target.value })} aria-label="When">
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All dates</option>
        </select>
      </div>

      {loading ? <p className="muted">Loading events…</p> : data.events.length === 0 ? (
        <div className="empty">
          <h3>No events match those filters</h3>
          <button className="btn" onClick={() => { setText(''); setParams({}); }}>Clear filters</button>
        </div>
      ) : (
        <div className="grid">{data.events.map((e) => <EventCard key={e._id} event={e} />)}</div>
      )}

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>Previous</button>
          <span className="muted">Page {page} of {data.pages}</span>
          <button className="btn ghost" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next</button>
        </div>
      )}
    </>
  );
}
