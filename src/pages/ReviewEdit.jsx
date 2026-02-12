import { useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const BASE_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

export default function ReviewEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const review = location.state?.review;
  const igdbId = location.state?.igdbId;

  const [rating, setRating] = useState(review?.rating || 1);
  const [text, setText] = useState(review?.Text || "");
  const [error, setError] = useState("");

  if (!user) return <p>Please sign in.</p>;
  if (!review) return <p>Review not found.</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      const res = await fetch(`${BASE_URL}/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rating, Text: text }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.err || "Failed to update review.");
        return;
      }

      navigate(`/games/details/${igdbId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update review.");
    }
  }

  return (
    <main>
      <h1>Edit Review</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="rating">Rating (1-10)</label>
        <input
          id="rating"
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />

        <label htmlFor="text">Review</label>
        <textarea
          id="text"
          rows="4"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="form-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate(`/games/details/${igdbId}`)}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}