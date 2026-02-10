import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../contexts/UserContext";

const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

export default function GameShow() {
  const { gameId } = useParams();
  const { user } = useContext(AuthContext);

  const [game, setGame] = useState(null);
  const [libraryItem, setLibraryItem] = useState(null);

  useEffect(() => {
    async function fetchGame() {
      const res = await fetch(`${BASE_URL}/api/games/${gameId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setGame(data);
    }

    async function fetchLibraryItem() {
      const res = await fetch(`${BASE_URL}/api/library?gameId=${gameId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLibraryItem(data);
      }
    }

    fetchGame();
    if (user) fetchLibraryItem();
  }, [gameId, user]);

  async function handleAddToLibrary() {
    const res = await fetch(`${BASE_URL}/api/library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ gameId }),
    });
    if (res.ok) {
      const data = await res.json();
      setLibraryItem(data);
    }
  }

  if (!game) return <p>Loading...</p>;

  return (
    <main>
      <header>
        {game.coverUrl && <img src={game.coverUrl} alt={game.title} />}
        <h1>{game.title}</h1>
        {game.releaseDate && (
          <p>{new Date(game.releaseDate).getFullYear()}</p>
        )}
        {game.genre?.length > 0 && <p>{game.genre.join(", ")}</p>}
        {game.platform?.length > 0 && <p>{game.platform.join(", ")}</p>}
      </header>

      {game.summary && (
        <section>
          <h2>About</h2>
          <p>{game.summary}</p>
        </section>
      )}

      {user && (
        <section>
          {libraryItem ? (
            <>
              <p>Status: {libraryItem.status}</p>
              <p>Hours Played: {libraryItem.hoursPlayed}</p>
              <p>Owned: {libraryItem.owned ? "Yes" : "No"}</p>
              {libraryItem.notes && <p>Notes: {libraryItem.notes}</p>}
              <Link to={`/games/${gameId}/edit`}>Edit Entry</Link>
            </>
          ) : (
            <button onClick={handleAddToLibrary}>Add to Library</button>
          )}
        </section>
      )}
    </main>
  );
}
