import { useContext, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast('Successfully Logged Out');
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src="/Gamers-Archive-Logo.png" alt="Gamers Archive" />
          <span className="navbar-logo-text">Gamers Archive</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          {user ? (
            <>
              <li>
                <NavLink to="/library" end className={({ isActive }) => isActive ? 'active' : ''}>
                  My Library
                </NavLink>
              </li>
              <li>
                <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
                  Search
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                  Community
                </NavLink>
              </li>
            </>
          ) : null}
        </ul>

        {/* Desktop Auth Actions */}
        <div className="navbar-actions">
          {user ? (
            <button className="btn-secondary" onClick={handleLogOut}>
              Log Out
            </button>
          ) : (
            <>
              <Link to="/sign-in">
                <button className="btn-secondary">Sign In</button>
              </Link>
              <Link to="/sign-up">
                <button className="btn-primary">Sign Up</button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Button — mobile only */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
        </button>

      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <ul className="mobile-menu-links">
            <li>
              <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                Home
              </NavLink>
            </li>
            {user ? (
              <>
                <li>
                  <NavLink to="/library" end onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                    My Library
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/search" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                    Search
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                    Community
                  </NavLink>
                </li>
              </>
            ) : null}
          </ul>
          <div className="mobile-menu-actions">
            {user ? (
              <button className="btn-secondary" style={{ width: '100%' }} onClick={handleLogOut}>
                Log Out
              </button>
            ) : (
              <>
                <Link to="/sign-in" onClick={closeMenu}>
                  <button className="btn-secondary" style={{ width: '100%' }}>Sign In</button>
                </Link>
                <Link to="/sign-up" onClick={closeMenu}>
                  <button className="btn-primary" style={{ width: '100%' }}>Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;