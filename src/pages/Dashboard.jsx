import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { getAllUsers } from '../services/userService';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await getAllUsers();
      const filteredUsers = allUsers.users.filter((u) => u._id !== user._id);
      setUsers(filteredUsers);
    };
    fetchData();
  }, [user]);

  return (
    <main className="main-content">
      <div className="dashboard-welcome">
        <h1>
          Welcome back, <span className="gradient-text">{user.username}</span>
        </h1>
        <p>Check out what the community has been playing.</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No other users found yet.</p>
        </div>
      ) : (
        <div className="user-grid">
          {users.map((u) => (
            <div key={u._id} className="user-card">
              <h3>{u.username}</h3>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/library/${u._id}`)}
              >
                View Library
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Dashboard;