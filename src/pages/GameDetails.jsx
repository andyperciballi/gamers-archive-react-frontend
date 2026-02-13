// src/pages/GameDetails.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getGameDetails } from "../services/gameService";
import { UserContext } from "../contexts/UserContext";

const GameDetails = () => {
  const { igdbId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

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
    return resizedUrl.startsWith("//") ? `https:${resizedUrl}` : resizedUrl;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) return <div className="spinner" />;
  if (error) return <p className="error-text">{error}</p>;
  if (!game) return <p className="error-text">Game not found.</p>;

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
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  return (
    <main className="main-content">

      {/* Back Button */}
      <button
        className="btn-back"
        onClick={() => {
          if (location.state?.fromSearch) {
            navigate("/search", {
              state: {
                query: location.state.query,
                results: location.state.results,
              },
            });
          } else {
            navigate("/");
          }
        }}
      >
        ← {location.state?.fromSearch ? "Back to Search Results" : "Back to Home"}
      </button>

      {/* Game Header */}
      <div className="game-details-layout">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={game.name}
            className="game-details-cover"
          />
        )}
        <div className="game-details-info">
          <h1 className="game-details-title">{game.name}</h1>
          <div className="game-meta-tags">
            <span className="tag">📅 {formatDate(game.first_release_date)}</span>
            {game.total_rating && (
              <span className="tag">⭐ {Math.round(game.total_rating)}/100</span>
            )}
          </div>
          {game.genres && (
            <div className="game-meta-tags">
              {game.genres.map((g) => (
                <span key={g.id} className="tag">{g.name}</span>
              ))}
            </div>
          )}
          {game.platforms && (
            <p className="game-details-platforms">
              {game.platforms.map((p) => p.name).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* About */}
      {game.summary && (
        <section className="game-details-section">
          <h2>About</h2>
          <p>{game.summary}</p>
        </section>
      )}

      {/* Library Status */}
      <section className="game-details-section library-section">
        <h2>Your Library</h2>
        {libraryItem ? (
          <div className="library-info">
            <p>This title is in your library.</p>
            <div className="library-stats">
              <span className="tag"> {libraryItem.status}</span>
              <span className="tag"> {libraryItem.hoursPlayed}hrs</span>
              {libraryItem.owned && <span className="tag"> Owned</span>}
            </div>
            {libraryItem.notes && (
              <p className="library-notes">"{libraryItem.notes}"</p>
            )}
            <button
              className="btn-secondary"
              onClick={() => navigate(`/games/${libraryItem._id}/edit`)}
            >
              Edit Library Entry
            </button>
          </div>
        ) : (
          <div className="library-info">
            <p>This game is not in your library yet.</p>
            <button
              className="btn-primary"
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
      <section className="game-details-section">
        <h2>Reviews</h2>

        {user && !reviews.some((r) => r.author?._id === user._id) && (
          <div className="review-form-wrapper">
            {showReviewForm ? (
              <form className="review-form" onSubmit={handleAddReview}>
                <div className="form-group">
                  <label htmlFor="rating">Rating (1–10)</label>
                  <input
                    id="rating"
                    type="number"
                    min="1"
                    max="10"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reviewText">Review</label>
                  <textarea
                    id="reviewText"
                    rows="4"
                    value={reviewForm.Text}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, Text: e.target.value })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Submit Review</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn-primary" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </button>
            )}
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>No reviews yet. Be the first!</p>
          </div>
        ) : (
          <ul className="reviews-list" style={{ listStyle: "none", padding: 0 }}>
            {reviews.map((review) => (
              <li key={review._id} className="review-card">
                <div className="review-card-header">
                  <span className="review-username">
                    {review.author?.username || "Unknown"}
                  </span>
                  <span className="review-rating">{review.rating}/10</span>
                </div>
                {review.Text && <p>{review.Text}</p>}
                <small className="text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
                {user && user._id === review.author?._id && (
                  <div className="review-actions">
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        navigate(`/reviews/${review._id}/edit`, {
                          state: { review, igdbId },
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteReview(review._id)}
                    >
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