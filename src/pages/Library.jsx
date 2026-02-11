import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const BASE_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

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

  if (!user) return <p>Please sign in to view libraries.</p>;
  if (loading) return <p>Loading library...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <h1>
        {isOwnLibrary
          ? `${user.username}'s Game Library`
          : `${otherUser?.username || "User"}'s Game Library`}
      </h1>

      {games.length === 0 ? (
        <p>No games in this library.</p>
      ) : (
        <ul>
          {games.map((item) => (
            <li key={item._id}>
              <h2
                className="game-link"
                onClick={() => navigate(`/games/details/${item.gameId?.igdbGameId}`)}
                style={{ cursor: "pointer" }}
              >
                {item.gameId?.title}
              </h2>
              <p>Status: {item.status}</p>
              <p>Hours: {item.hoursPlayed}</p>
              {item.notes && <p>Notes: {item.notes}</p>}

              {isOwnLibrary ? (
                <div className="library-actions">
                  <button onClick={() => navigate(`/games/${item._id}/edit`)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(item._id)}>Remove</button>
                </div>
              ) : (
                <button
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
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Library;