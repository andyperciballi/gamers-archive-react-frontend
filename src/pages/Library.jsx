import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const Library = () => {
  const { user } = useContext(UserContext);
  const { userId } = useParams();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);

  const isOwnLibrary = !userId || user?._id === userId;

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const endpoint = isOwnLibrary
          ? `${import.meta.env.VITE_BACKEND_SERVER_URL}/games`
          : `${import.meta.env.VITE_BACKEND_SERVER_URL}/games/user/${userId}`;

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();
        if (data.err) throw new Error(data.err);
        setGames(data);

        if (!isOwnLibrary) {
          const userRes = await fetch(
            `${import.meta.env.VITE_BACKEND_SERVER_URL}/users/${userId}/public`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          const userData = await userRes.json();
          if (userData.err) throw new Error(userData.err);
          setOtherUser(userData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchLibrary();
  }, [user, userId, isOwnLibrary]);

  if (!user) return <p>Please sign in to view libraries.</p>;
  if (loading) return <p>Loading library...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <h1>
        {isOwnLibrary
          ? `${user.username}'s Game Library`
          : `${otherUser?.username || 'User'}'s Game Library`}
      </h1>

      {games.length === 0 ? (
        <p>No games in this library.</p>
      ) : (
        <ul>
          {games.map((item) => (
            <li key={item._id}>
              <h2>{item.gameId.title}</h2>
              <p>Status: {item.status}</p>
              <p>Hours Played: {item.hoursPlayed}</p>
              <p>Notes: {item.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Library;
