import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const BASE_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

const fixImageUrl = (url, size = "cover_big") => {
  if (!url) return null;
  let fixed = url.startsWith("//") ? `https:${url}` : url;
  if (/t_[^/]+/.test(fixed)) {
    fixed = fixed.replace(/t_[^/]+/, `t_${size}`);
  }
  return fixed;
};

const Library = () => {
  const { user } = useContext(UserContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  const isOwnLibrary = !userId || user?._id === userId;

  useEffect(() => {
    if (!user) return;

    const fetchLibrary = async () => {
      try {
        const endpoint = isOwnLibrary
          ? `${BASE_URL}/games`
          : `${BASE_URL}/games/user/${userId}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.err) throw new Error(data.err);
        setGames(data);

        if (!isOwnLibrary) {
          const userRes = await fetch(`${BASE_URL}/users/${userId}/public`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
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
    fetchLibrary();
  }, [user, userId, isOwnLibrary]);

  async function handleDelete(itemId) {
    if (!window.confirm("Remove this game from your library?")) return;
    try {
      const res = await fetch(`${BASE_URL}/games/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) return;
      setGames((prev) => prev.filter((g) => g._id !== itemId));
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return <p className="error-text">Please sign in to view libraries.</p>;
  if (loading) return <div className="spinner" />;
  if (error) return <p className="error-text">Error: {error}</p>;

  const ownerName = isOwnLibrary
    ? user.username
    : otherUser?.username || "User";

  return (
    <main className="main-content">

      {/* Header */}
      <div className="page-header">
        <h1>
          <span className="gradient-text">{ownerName}</span>'s Library
        </h1>
        <p>{games.length} {games.length === 1 ? "game" : "games"} in collection</p>
      </div>

      {games.length === 0 ? (
        <div className="empty-state">
          <p>No games in this library yet.</p>
          {isOwnLibrary && (
            <button
              className="btn-primary mt-md"
              onClick={() => navigate("/search")}
            >
              Find Games to Add
            </button>
          )}
        </div>
      ) : (
        <ul className="library-grid" style={{ listStyle: "none", padding: 0 }}>
          {games.map((item) => {
            const coverUrl = fixImageUrl(item.gameId?.coverUrl);
            return (
              <li key={item._id} className="game-card">

                {/* Cover Image */}
                {coverUrl ? (
                  <img
                    className="game-card-image"
                    src={coverUrl}
                    alt={item.gameId?.title}
                    onClick={() => navigate(`/games/details/${item.gameId?.igdbGameId}`)}
                  />
                ) : (
                  <div
                    className="game-card-image game-card-no-cover"
                    onClick={() => navigate(`/games/details/${item.gameId?.igdbGameId}`)}
                  >
                    <span>No Cover</span>
                  </div>
                )}

                {/* Card Body */}
                <div className="game-card-body">
                  <p
                    className="game-card-title"
                    onClick={() => navigate(`/games/details/${item.gameId?.igdbGameId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.gameId?.title}
                  </p>

                  {/* Status + Hours tags */}
                  <div className="library-card-tags">
                    <span className="tag">{item.status}</span>
                    {item.hoursPlayed > 0 && (
                      <span className="tag">{item.hoursPlayed}hrs</span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="game-card-meta" style={{ fontStyle: "italic" }}>
                      "{item.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  {isOwnLibrary ? (
                    <div className="library-card-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => navigate(`/games/${item._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate(`/games/add/${item.gameId?.igdbGameId}`, {
                          state: {
                            igdbGame: {
                              id: item.gameId?.igdbGameId,
                              name: item.gameId?.title,
                              cover: { url: item.gameId?.coverUrl },
                              summary: item.gameId?.summary,
                              platforms: item.gameId?.platform?.map((p) => ({ name: p })),
                              genres: item.gameId?.genre?.map((g) => ({ name: g })),
                            },
                            isAdding: true,
                          },
                        })
                      }
                    >
                      Add to My Library
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default Library;