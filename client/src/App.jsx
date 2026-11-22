import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyTickets from './pages/MyTickets.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventForm from './pages/EventForm.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute organizer><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/new" element={<ProtectedRoute organizer><EventForm /></ProtectedRoute>} />
          <Route path="/dashboard/:id/edit" element={<ProtectedRoute organizer><EventForm /></ProtectedRoute>} />
          <Route path="*" element={<div className="empty"><h2>Page not found</h2><Link className="btn" to="/events">Browse events</Link></div>} />
        </Routes>
      </main>
      <footer className="footer">Gatherly · Built with MongoDB, Express, React and Node</footer>
    </>
  );
}
