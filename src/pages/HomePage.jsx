import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { getAllUsers } from '../services/userService';
import * as gameService from '../services/gameService';

const TABS = [
  { key: 'upcoming', label: 'Upcoming Releases' },
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Popular' },
];

const HomePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [feed, setFeed] = useState({ upcoming: [], trending: [], popular: [] });
  const [activeTab, setActiveTab] = useState('upcoming');
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
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setCommunityUsers(
        data.users.filter((u) => u._id !== user._id).slice(0, 4)
      );
    };
    fetchUsers();
  }, [user]);

  const fixImageUrl = (url, size = 'cover_big') => {
    if (!url) return null;
    const resized = url.replace(/t_[^/]+/, `t_${size}`);
    return resized.startsWith('//') ? `https:${resized}` : resized;
  };

  const formatDate = (unixSeconds) => {
    if (!unixSeconds) return 'TBA';
    const date = new Date(unixSeconds * 1000);
    const day = date.getDate();
    const month = date.getMonth();
    if (day === 12 && month === 1) return date.getFullYear() + ' (TBA)';
    if (day === 1 || day === 13 || (day === 31 && month === 11))
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) + ' (TBA)';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="spinner" />;
  if (error) return <p className="error-text">{error}</p>;

  const activeGames = feed[activeTab] || [];

  return (
    <main className="main-content">

      {/* Community Section — only shown when logged in */}
      {user && communityUsers.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">Community</h2>
          <div className="user-grid">
            {communityUsers.map((u) => (
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
        </section>
      )}

      {/* Tab Switcher */}
      <section className="home-section">
        <div className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        {activeGames.length === 0 ? (
          <div className="empty-state">
            <p>Nothing to show yet.</p>
          </div>
        ) : (
          <ul className="game-grid" style={{ listStyle: 'none', padding: 0 }}>
            {activeGames.map((game) => (
              <li
                key={game.id}
                className="game-card"
                onClick={() => navigate(`/games/details/${game.id}`)}
              >
                {fixImageUrl(game.cover?.url) ? (
                  <img
                    className="game-card-image"
                    src={fixImageUrl(game.cover.url)}
                    alt={game.name}
                  />
                ) : (
                  <div className="game-card-image game-card-no-cover">
                    <span>No Cover</span>
                  </div>
                )}
                <div className="game-card-body">
                  <p className="game-card-title">{game.name}</p>
                  <p className="game-card-meta">{formatDate(game.first_release_date)}</p>
                  {game.total_rating && (
                    <p className="game-card-meta">
                       ⭐ {Math.round(game.total_rating)}/100
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default HomePage;