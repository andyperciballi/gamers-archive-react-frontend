import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const BASE_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

const initialForm = {
  status: "Want to Play",
  hoursPlayed: 0,
  notes: "",
  owned: false,
};

export default function LibraryEdit() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const igdbGame = location.state?.igdbGame || null;
  const isAdding = location.state?.isAdding || false;

  const [libraryItem, setLibraryItem] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isAdding);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (isAdding) return;

    async function fetchLibraryItem() {
      try {
        const res = await fetch(`${BASE_URL}/games`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) { setError("Failed to load library."); setLoading(false); return; }
        const library = await res.json();
        const match = library.find((item) => item._id === gameId);
        if (!match) { setError("Library item not found."); setLoading(false); return; }
        setLibraryItem(match);
        setFormData({
          status: match.status ?? "Want to Play",
          hoursPlayed: match.hoursPlayed ?? 0,
          notes: match.notes ?? "",
          owned: match.owned ?? false,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load library entry.");
      } finally {
        setLoading(false);
      }
    }
    fetchLibraryItem();
  }, [gameId, user, navigate, isAdding]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "hoursPlayed" ? Number(value) : value,
    }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!igdbGame) return;
    try {
      setError("");
      const res = await fetch(`${BASE_URL}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          igdbGameId: igdbGame.id,
          title: igdbGame.name,
          coverUrl: igdbGame.cover?.url || "",
          summary: igdbGame.summary || "",
          platform: igdbGame.platforms?.map((p) => p.name) || [],
          genre: igdbGame.genres?.map((g) => g.name) || [],
          status: formData.status,
          hoursPlayed: formData.hoursPlayed,
          notes: formData.notes,
          owned: formData.owned,
        }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.err || "Failed to add game.");
        return;
      }
      navigate(`/games/details/${igdbGame.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to add game.");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!libraryItem?._id) return;
    try {
      setError("");
      const res = await fetch(`${BASE_URL}/games/${libraryItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.err || "Failed to save changes.");
        return;
      }
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    }
  }

  async function handleDelete() {
    if (!libraryItem?._id) return;
    if (!window.confirm("Remove this game from your library?")) return;
    try {
      setError("");
      const res = await fetch(`${BASE_URL}/games/${libraryItem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.err || "Failed to remove game.");
        return;
      }
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Failed to remove game.");
    }
  }

  if (!user) return null;
  if (loading) return <div className="spinner" />;

  return (
    <main className="main-content">
      <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 'var(--space-xl)' }}>
        <div className="auth-form-container">

          {/* Header */}
          <h2>
            {isAdding ? "Add to Library" : "Edit Entry"}
          </h2>
          {isAdding && igdbGame?.name && (
            <p className="text-center text-muted mt-sm" style={{ marginBottom: 'var(--space-lg)' }}>
              {igdbGame.name}
            </p>
          )}

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={isAdding ? handleAdd : handleUpdate}>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="Want to Play">Want to Play</option>
                <option value="Playing">Playing</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            {/* Hours Played */}
            <div className="form-group">
              <label htmlFor="hoursPlayed">Hours Played</label>
              <input
                id="hoursPlayed"
                name="hoursPlayed"
                type="number"
                min="0"
                step="1"
                value={formData.hoursPlayed}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                placeholder="Any thoughts on this game..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Owned checkbox */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  id="owned"
                  name="owned"
                  type="checkbox"
                  checked={formData.owned}
                  onChange={handleChange}
                />
                <span>I own this game</span>
              </label>
            </div>

            {/* Actions */}
            <div className="form-actions mt-md">
              <button type="submit" className="btn-primary">
                {isAdding ? "Add to Library" : "Save Changes"}
              </button>
              <Link to={isAdding ? `/games/details/${igdbGame?.id}` : "/library"}>
                <button type="button" className="btn-secondary">Cancel</button>
              </Link>
            </div>

            {/* Delete — only when editing */}
            {!isAdding && (
              <div style={{ marginTop: 'var(--space-lg)' }}>
                <hr />
                <button
                  type="button"
                  className="btn-danger"
                  style={{ width: '100%', marginTop: 'var(--space-md)' }}
                  onClick={handleDelete}
                >
                  Remove from Library
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </main>
  );
}