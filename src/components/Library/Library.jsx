import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

const Library = () => {
  const { user } = useContext(UserContext);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/games`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();

        if (data.err) throw new Error(data.err);

        setGames(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchGames();
  }, [user]);

  if (!user) return <p>Please sign in to view your library.</p>;
  if (loading) return <p>Loading your library...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <h1>{user.username}'s Game Library</h1>
      {games.length === 0 ? (
        <p>You have no games in your library.</p>
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
