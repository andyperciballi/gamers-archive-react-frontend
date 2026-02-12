import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogOut = () => {
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
            <li>
              <Link to="/library">My Library</Link>
            </li>
            <li>
              <Link to="/search">Search Games</Link>
            </li>
            <li>
              <Link to="/dashboard">Community</Link>
            </li>
            <li>
               <button onClick={handleLogOut}>Log Out</button>
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
