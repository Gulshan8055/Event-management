import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isOrganizer } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">Gatherly</Link>
      <nav>
        <NavLink to="/events">Events</NavLink>
        {user && <NavLink to="/tickets">My tickets</NavLink>}
        {isOrganizer && <NavLink to="/dashboard">Dashboard</NavLink>}
      </nav>
      <div className="nav-end">
        {user ? (
          <>
            <span className="muted hide-sm">{user.name}</span>
            <button className="btn ghost" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">Log in</Link>
            <Link className="btn" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
