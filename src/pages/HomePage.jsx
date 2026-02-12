import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { getAllUsers } from '../services/userService';
import * as gameService from '../services/gameService';

const HomePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [feed, setFeed] = useState({ upcoming: [], trending: [], popular: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [communityUsers, setCommunityUsers] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setError('');
        const data = await gameService.getHomeFeed();
        setFeed({
          upcoming: data?.upcoming || [],
          trending: data?.trending || [],
          popular: data?.popular || [],
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load homepage feed.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setCommunityUsers(
        data.users.filter((u) => u._id !== user._id).slice(0, 4),
      );
    };
    fetchUsers();
  }, [user]);

  const fixImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('//') ? `https:${url}` : url;
  };

  const formatDate = (unixSeconds) => {
    if (!unixSeconds) return '';
    return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <p>Loading homepage games...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <main>
      <h1>Home</h1>
      {user && communityUsers.length > 0 && (
        <section>
          <h2>Community</h2>
          <div className="user-grid">
            {communityUsers.map((u) => (
              <div key={u._id} className="user-card">
                <h3>{u.username}</h3>
                <button onClick={() => navigate(`/library/${u._id}`)}>
                  View Library
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {['Upcoming Releases', 'Trending', 'Popular'].map((title) => {
        const key =
          title === 'Upcoming Releases' ? 'upcoming' : title.toLowerCase();
        const games = feed[key] || [];

        return (
          <section key={title}>
            <h2>{title}</h2>
            {games.length === 0 ? (
              <p>Nothing to show yet.</p>
            ) : (
              <ul className="game-grid">
                {games.map((game) => (
                  <li
                    key={game.id}
                    className="game-card"
                    onClick={() => navigate(`/games/details/${game.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {fixImageUrl(game.cover?.url) ? (
                      <img src={fixImageUrl(game.cover.url)} alt={game.name} />
                    ) : (
                      <span>No cover</span>
                    )}
                    <h3>{game.name}</h3>
                    {formatDate(game.first_release_date) && (
                      <p>{formatDate(game.first_release_date)}</p>
                    )}
                    {game.total_rating && (
                      <p>{Math.round(game.total_rating)}/100</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
};

export default HomePage;
