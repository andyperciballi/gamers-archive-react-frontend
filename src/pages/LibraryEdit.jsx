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
    if (!user) {
      navigate("/");
      return;
    }

    if (isAdding) return;

    async function fetchLibraryItem() {
      try {
        setError("");
        const res = await fetch(`${BASE_URL}/games`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) {
          setError("Failed to load library.");
          setLoading(false);
          return;
        }

        const library = await res.json();
        const match = library.find((item) => item._id === gameId);

        if (!match) {
          setError("Library item not found.");
          setLoading(false);
          return;
        }

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
      [name]:
        type === "checkbox"
          ? checked
          : name === "hoursPlayed"
          ? Number(value)
          : value,
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
          notes: formData.notes,
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

  if (!user) return null;
  if (loading) return <p>Loading...</p>;

  const title = isAdding
    ? `Add "${igdbGame?.name}" to Library`
    : "Edit Library Entry";

  return (
    <main>
      <h1>{title}</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={isAdding ? handleAdd : handleUpdate}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Want to Play">Want to Play</option>
          <option value="Playing">Playing</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
          <option value="Dropped">Dropped</option>
        </select>

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

        <label htmlFor="owned">
          <input
            id="owned"
            name="owned"
            type="checkbox"
            checked={formData.owned}
            onChange={handleChange}
          />
          Owned
        </label>

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="4"
          value={formData.notes}
          onChange={handleChange}
        />

        <button type="submit">{isAdding ? "Add to Library" : "Save"}</button>
        <Link style={{ marginLeft: 12 }} to={isAdding ? `/games/details/${igdbGame?.id}` : "/library"}>
          Cancel
        </Link>
      </form>
    </main>
  );
}