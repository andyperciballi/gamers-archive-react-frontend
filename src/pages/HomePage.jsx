import React, { useEffect, useState } from "react";
import * as gameService from "../services/gameService"; // adjust path if needed

const HomePage = () => {
  const [feed, setFeed] = useState({ upcoming: [], trending: [], popular: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setError("");
        // expects backend route: GET /games/home -> { upcoming: [], trending: [], popular: [] }
        const data = await gameService.getHomeFeed();
        setFeed({
          upcoming: data?.upcoming || [],
          trending: data?.trending || [],
          popular: data?.popular || [],
        });
      } catch (err) {
        console.error(err);
        setError(err?.message || "Failed to load homepage feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user]);

  const normalizeCoverUrl = (url) => {
    if (!url) return "";
    // IGDB often returns URLs starting with //...
    if (url.startsWith("//")) return `https:${url}`;
    return url;
  };

  const formatReleaseDate = (unixSeconds) => {
    if (!unixSeconds) return "";
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const GameRow = ({ game }) => {
    const coverUrl = normalizeCoverUrl(game?.cover?.url);
    const release = formatReleaseDate(game?.first_release_date);

    return (
      <article
        style={{
          width: 180,
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "3 / 4",
            borderRadius: 8,
            overflow: "hidden",
            background: "#f4f4f4",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={game?.name || "Game cover"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <span style={{ fontSize: 12, color: "#666" }}>No cover</span>
          )}
        </div>

        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
          {game?.name || "Untitled"}
        </div>

        {release && (
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {release}
          </div>
        )}
      </article>
    );
  };

  const Section = ({ title, games }) => (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ marginBottom: 10 }}>{title}</h2>

      {games.length === 0 ? (
        <p style={{ color: "#666" }}>Nothing to show yet.</p>
      ) : (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {games.map((g) => (
            <GameRow key={g.id} game={g} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Home</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Upcoming releases + trending/popular picks pulled from IGDB.
      </p>

      {loading && <p>Loading homepage games...</p>}

      {!loading && error && (
        <div
          style={{
            border: "1px solid #f3b3b3",
            background: "#ffecec",
            padding: 12,
            borderRadius: 10,
            marginTop: 12,
          }}
        >
          <p style={{ margin: 0, color: "#8a1f1f" }}>
            {error}{" "}
            <span style={{ color: "#8a1f1f" }}>
              (Make sure your backend has <code>/games/home</code>.)
            </span>
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <Section title="Upcoming Releases" games={feed.upcoming} />
          <Section title="Trending" games={feed.trending} />
          <Section title="Popular" games={feed.popular} />
        </>
      )}

      <hr style={{ marginTop: 24 }} />

      <p style={{ color: "#666", fontSize: 13 }}>
        Note: this page expects your backend to expose <code>GET /games/home</code>{" "}
        that returns <code>{`{ upcoming: [], trending: [], popular: [] }`}</code>.
        If you only have separate endpoints instead, tell me what they are and I’ll
        swap the fetch calls.
      </p>
    </div>
  );
};

export default HomePage;
