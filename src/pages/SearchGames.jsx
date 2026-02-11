import { useState } from "react";
import { searchGames } from "../services/gameService";
import { useNavigate } from "react-router-dom";

const SearchGames = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setQuery(e.target.value);
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const games = await searchGames(query);

      if (Array.isArray(games)) {
        setResults(games);
      } else {
        setError("No results found.");
      }
    } catch (err) {
      setError("Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Search Games</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for a game..."
          value={query}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {results.length === 0 && !loading && !error && hasSearched && <p>No games found.</p>}
        {results.map((game) => (
          <li
            key={game.id || game._id}
            onClick={() => navigate(`/games/details/${game.id}`)}
            style={{ cursor: "pointer" }}
          >
            <h3>{game.name || game.title}</h3>
            {game.cover?.url && (
              <img
                src={game.cover.url.startsWith("//") ? `https:${game.cover.url}` : game.cover.url}
                alt={game.name || game.title}
              />
            )}
            <p>{game.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default SearchGames;