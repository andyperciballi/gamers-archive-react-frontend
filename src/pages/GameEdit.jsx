import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/UserContext";

const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const initialForm = {
  status: "Want to Play",
  hoursPlayed: 0,
  notes: "",
  owned: false,
};

export default function LibraryEdit() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [libraryItem, setLibraryItem] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate(`/games/${gameId}`);
      return;
    }

    async function fetchLibraryItem() {
      try {
        setError("");
        const res = await fetch(`${BASE_URL}/api/library?gameId=${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) {
          navigate(`/games/${gameId}`);
          return;
        }

        const data = await res.json();
        setLibraryItem(data);

        setFormData({
          status: data.status ?? "Want to Play",
          hoursPlayed: data.hoursPlayed ?? 0,
          notes: data.notes ?? "",
          owned: data.owned ?? false,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load library entry.");
      }
    }

    fetchLibraryItem();
  }, [gameId, user, navigate]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!libraryItem?._id) return;

    try {
      setError("");
      const res = await fetch(`${BASE_URL}/api/library/${libraryItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.error || "Failed to save changes.");
        return;
      }

      navigate(`/games/${gameId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    }
  }

  if (!user) return null;
  if (!libraryItem) return <p>Loading library entry...</p>;

  return (
    <main>
      <h1>Edit Library Entry</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Save</button>
        <Link style={{ marginLeft: 12 }} to={`/games/${gameId}`}>
          Cancel
        </Link>
      </form>
    </main>
  );
}
