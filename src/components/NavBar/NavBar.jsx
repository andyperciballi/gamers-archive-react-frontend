import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleLogOut = () => {
    e.preventDefault();
    localStorage.removeItem('token');
    setUser(null);
    toast('Successfully Logged Out');
    navigate('/');
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>

        {user ? (
          <>
            <li>{`Welcome back ${user.username}`}</li>
            <li>
              <Link to="/library">My Library</Link>
            </li>
            <li>
              <Link to="/search">Search Games</Link>
            </li>
            <li>
              <Link to="/" onClick={handleLogOut}>
                Log Out
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/sign-up">Sign Up</Link>
            </li>
            <li>
              <Link to="/sign-in">Sign In</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
