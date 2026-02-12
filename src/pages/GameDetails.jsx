// src/pages/GameDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getGameDetails } from "../services/gameService";

const GameDetails = () => {
  const { igdbId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [game, setGame] = useState(null);
  const [libraryItem, setLibraryItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getGameDetails(igdbId);
        setGame(data.igdb);
        setLibraryItem(data.libraryItem);
        setReviews(data.reviews || []);
      } catch (err) {
        setError("Failed to load game details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [igdbId]);

  const fixImageUrl = (url, size = "t_cover_big") => {
    if (!url) return null;

    const resizedUrl = url.replace(/t_[^/]+/, size);

    return resizedUrl.startsWith("//")
      ? `https:${resizedUrl}`
      : resizedUrl;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!game) return <p>Game not found.</p>;

  const coverUrl = fixImageUrl(game.cover?.url, "t_cover_big");

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>

      <button
  onClick={() => {
    if (location.state?.fromSearch) {
      navigate("/search", {
        state: {
          query: location.state.query,
          results: location.state.results
        }
      });
    } else {
      navigate("/");
    }
  }}
  style={{
    marginBottom: "20px",
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    padding: 0,
    fontSize: "14px"
  }}
>
  ← {location.state?.fromSearch ? "Back to Search Results" : "Back to Home"}
</button>

      {/* Game Header */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        {coverUrl && (
          <img
            src={coverUrl}
            alt={game.name}
            style={{ width: "200px", borderRadius: "8px" }}
          />
        )}
        <div>
          <h1>{game.name}</h1>
          <p><strong>Released:</strong> {formatDate(game.first_release_date)}</p>
          {game.total_rating && (
            <p><strong>IGDB Rating:</strong> {Math.round(game.total_rating)}/100</p>
          )}
          {game.genres && (
            <p><strong>Genres:</strong> {game.genres.map((g) => g.name).join(", ")}</p>
          )}
          {game.platforms && (
            <p><strong>Platforms:</strong> {game.platforms.map((p) => p.name).join(", ")}</p>
          )}
        </div>
      </div>

      {/* Summary */}
      {game.summary && (
        <section style={{ marginBottom: "30px" }}>
          <h2>About</h2>
          <p>{game.summary}</p>
        </section>
      )}

      {/* Library Status */}
      <section style={{ marginBottom: "30px", padding: "15px", backgroundColor: "light-dark(#f5f5f5, #242424)", borderRadius: "8px" }}>
        <h2>Your Library</h2>
       {libraryItem ? (
          <div>
            <p>This title is in your library.</p>
            <p><strong>Status:</strong> {libraryItem.status}</p>
            <p><strong>Hours Played:</strong> {libraryItem.hoursPlayed}</p>
            {libraryItem.notes && <p><strong>Notes:</strong> {libraryItem.notes}</p>}
            <p><strong>Owned:</strong> {libraryItem.owned ? "Yes" : "No"}</p>
            <button onClick={() => navigate(`/games/${libraryItem._id}/edit`)}>
              Edit Library Entry
            </button>
          </div>
        ) : (
          <div>
            <p>This game is not in your library yet.</p>
           <button
              onClick={() =>
                  navigate(`/games/add/${igdbId}`, {
                  state: { igdbGame: game, isAdding: true },
                  })
                  }
              >
            Add to Library
            </button>
          </div>
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reviews.map((review) => (
              <li
                key={review._id}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>{review.author?.username || "Unknown"}</strong> — {review.rating}/10
                </p>
                {review.Text && <p>{review.Text}</p>}
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default GameDetails;
