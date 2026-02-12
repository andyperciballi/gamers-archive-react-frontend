// src/pages/GameDetails.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getGameDetails } from "../services/gameService";
import { UserContext } from "../contexts/UserContext";

const GameDetails = () => {
  const { igdbId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useContext(UserContext);

  const [game, setGame] = useState(null);
  const [libraryItem, setLibraryItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, Text: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);


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


  const handleAddReview = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_SERVER_URL}/reviews/game/${igdbId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(reviewForm),
      }
    );
    if (!res.ok) {
      const msg = await res.json().catch(() => null);
      alert(msg?.err || "Failed to add review.");
      return;
    }
    const newReview = await res.json();
    setReviews((prev) => [...prev, newReview]);
    setShowReviewForm(false);
    setReviewForm({ rating: 5, Text: "" });
  } catch (err) {
    console.error(err);
  }
};

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

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
        {/* Only show "Write a Review" if user hasn't already reviewed */}
{user && !reviews.some((r) => r.author?._id === user._id) && (
  <div>
    {showReviewForm ? (
      <form onSubmit={handleAddReview}>
        <label htmlFor="rating">Rating (1-10)</label>
        <input
          id="rating"
          type="number"
          min="1"
          max="10"
          value={reviewForm.rating}
          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
        />
        <label htmlFor="reviewText">Review</label>
        <textarea
          id="reviewText"
          rows="4"
          value={reviewForm.Text}
          onChange={(e) => setReviewForm({ ...reviewForm, Text: e.target.value })}
        />
        <div className="form-actions">
          <button type="submit">Submit Review</button>
          <button type="button" onClick={() => setShowReviewForm(false)}>Cancel</button>
        </div>
      </form>
    ) : (
      <button onClick={() => setShowReviewForm(true)}>Write a Review</button>
    )}
  </div>
)}

{reviews.length === 0 ? (
  <p>No reviews yet.</p>
) : (
          <ul>
            {reviews.map((review) => (
              <li
                key={review._id}
              >
                <p>
                  <strong>{review.author?.username || "Unknown"}</strong> — {review.rating}/10
                </p>
                {review.Text && <p>{review.Text}</p>}
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>

                {user && user._id === review.author?._id && (
                  <div className="review-actions">
                    <button onClick={() => navigate(`/reviews/${review._id}/edit`, {
                      state: { review, igdbId }
                    })}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteReview(review._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default GameDetails;
