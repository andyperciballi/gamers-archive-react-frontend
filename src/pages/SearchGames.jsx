import { useState, useEffect } from "react";
import { searchGames } from "../services/gameService";
import { useNavigate, useLocation } from "react-router-dom";

const fixImageUrl = (url, size = "cover_big") => {
  if (!url) return null;
  let fixed = url.startsWith("//") ? `https:${url}` : url;
  if (/t_[^/]+/.test(fixed)) {
    fixed = fixed.replace(/t_[^/]+/, `t_${size}`);
  }
  return fixed;
};

const ReadMore = ({ text, limit = 80 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= limit) return <p className="game-card-meta">{text}</p>;
  return (
    <p className="game-card-meta">
      {expanded ? text : `${text.slice(0, limit)}...`}
      <button
        className="read-more-btn"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        {expanded ? " Less" : " More"}
      </button>
    </p>
  );
};

const SearchGames = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
      setQuery(location.state.query || "");
      setHasSearched(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
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
    <main className="main-content">

      {/* Header */}
      <div className="page-header">
        <h1>Search <span className="gradient-text">Games</span></h1>
        <p>Find any game in the IGDB database.</p>
      </div>

      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for a game..."
          value={query}
          onChange={handleChange}
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {/* States */}
      {loading && <div className="spinner" />}
      {error && <p className="error-text">{error}</p>}
      {results.length === 0 && !loading && !error && hasSearched && (
        <div className="empty-state">
          <p>No games found for "{query}".</p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && !loading && (
        <>
          <p className="search-results-count text-muted text-sm mt-sm">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </p>
          <ul className="game-grid mt-md" style={{ listStyle: "none", padding: 0 }}>
            {results.map((game) => {
              const coverUrl = fixImageUrl(game.cover?.url);
              return (
                <li
                  key={game.id || game._id}
                  className="game-card"
                  onClick={() =>
                    navigate(`/games/details/${game.id}`, {
                      state: { fromSearch: true, query, results },
                    })
                  }
                >
                  {coverUrl ? (
                    <img
                      className="game-card-image"
                      src={coverUrl}
                      alt={game.name || game.title}
                    />
                  ) : (
                    <div className="game-card-image game-card-no-cover">
                      <span>No Cover</span>
                    </div>
                  )}
                  <div className="game-card-body">
                    <p className="game-card-title">{game.name || game.title}</p>
                  {game.summary && (
                      <ReadMore text={game.summary} limit={80} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
};

export default SearchGames;