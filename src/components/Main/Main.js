import React, { useState, useEffect } from "react";
import "./Main.css";

const genreMap = {
  1: "Personal Growth",
  2: "True Crime and Investigative Journalism",
  3: "History",
  4: "Comedy",
  5: "Entertainment",
  6: "Business",
  7: "Fiction",
  8: "News",
  9: "Kids and Family",
};

function Main() {
  // State variables
  const [data, setData] = useState([]); // Podcast data
  const [loading, setLoading] = useState(true); // Loading state
  const [sortType, setSortType] = useState("title"); // Sorting type (title or date)
  const [sortOrder, setSortOrder] = useState("asc"); // Sorting order (ascending or descending)
  const [filterText, setFilterText] = useState(""); // Text for filtering by title
  const [selectedGenre, setSelectedGenre] = useState(""); // Selected genre filter
  const [selectedPodcastDetails, setSelectedPodcastDetails] = useState(null); // Details of the selected podcast
  const [seasonVisibility, setSeasonVisibility] = useState({}); // Visibility of podcast seasons
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Audio playing state
  const [favorites, setFavorites] = useState([]);

  // Now, groupedFavorites is an object where keys are in the format "show-season"

  // Function to toggle the visibility of episodes for a specific season
  const toggleSeasonVisibility = (seasonTitle) => {
    setSeasonVisibility((prevState) => ({
      ...prevState,
      [seasonTitle]: !prevState[seasonTitle],
    }));
  };

  // Fetch podcast data when the component mounts

  useEffect(() => {
    fetch("https://podcast-api.netlify.app/shows")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Helper function to format an ISO date as a long date

  function formatDateToLongDate(isoDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(isoDate).toLocaleDateString(undefined, options);
  }

  // Sort and filter podcast data

  const sortedData = [...data].sort((a, b) => {
    if (sortType === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortType === "date") {
      return sortOrder === "asc"
        ? new Date(a.updated) - new Date(b.updated)
        : new Date(b.updated) - new Date(a.updated);
    }
  });

  const filteredData = sortedData.filter((show) => {
    const titleMatches = show.title
      .toLowerCase()
      .includes(filterText.toLowerCase());
    const genreMatches = selectedGenre
      ? show.genres.includes(Number(selectedGenre))
      : true;
    return titleMatches && genreMatches;
  });

  // Function to handle clicking a podcast image and open the overlay
  const openOverlay = (show) => {
    fetchPodcastDetails(show);
  };

  // Function to close the overlay
  const closeOverlay = () => {
    setSelectedPodcastDetails(null);
  };

  // Fetch detailed information about a podcast

  const fetchPodcastDetails = async (show) => {
    try {
      const response = await fetch(
        `https://podcast-api.netlify.app/id/${show.id}`
      );
      if (response.ok) {
        const data = await response.json();

        // Calculate the count of episodes in each season
        const seasonsWithCount = data.seasons.map((season) => ({
          ...season,
          count: season.episodes.length,
        }));

        data.seasons = seasonsWithCount;
        setSelectedPodcastDetails(data);
      } else {
        console.error("Error fetching podcast details");
      }
    } catch (error) {
      console.error("Error fetching podcast details:", error);
    }
  };

  // Attach an event listener for beforeunload when audio is playing

  useEffect(() => {
    // Add an event listener for beforeunload
    const handleBeforeUnload = (e) => {
      if (isAudioPlaying) {
        // Display a confirmation message
        e.returnValue =
          "Audio is currently playing. Are you sure you want to leave?";
      }
    };

    // Attach the event listener when audio is playing
    if (isAudioPlaying) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    // Remove the event listener when audio stops playing
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAudioPlaying]);

  //Function to add and remove episodes from the favorites list

  const toggleFavorite = (episode) => {
    if (favorites.includes(episode)) {
      // Episode is already in favorites, so remove it
      setFavorites(favorites.filter((fav) => fav !== episode));
    } else {
      // Episode is not in favorites, so add it
      setFavorites([...favorites, episode]);
    }
  };

  // Function to add an episode to favorites
  const addEpisodeToFavorites = (episode) => {
    setFavorites([...favorites, episode]);
  };

  // Sort favorites by show title (A-Z)
  const sortFavoritesByTitleAZ = () => {
    const sortedFavorites = [...favorites].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    setFavorites(sortedFavorites);
  };

  // Sort favorites by show title (Z-A)
  const sortFavoritesByTitleZA = () => {
    const sortedFavorites = [...favorites].sort((a, b) =>
      b.title.localeCompare(a.title)
    );
    setFavorites(sortedFavorites);
  };


  
  // Render the component

  return (
    <div className="filtering">
      <div>
        <label className="sort-label">
          Sort by:
          <select
            className="sort-select"
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="title">Title</option>
            <option value="date">Date</option>
          </select>
          <select
            className="sort-select"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <label className="filter-label">
          Filter by Title:
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
          />
        </label>
        <label className="genre-label">
          Filter by Genre:
          <select
            className="genre-select"
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All</option>
            {Object.keys(genreMap).map((key) => (
              <option key={key} value={key} className="genre-option">
                {genreMap[key]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="podcast-list">
          <div className="favorites-section">
            <h2>Favorites</h2>
            <button className="title-order" onClick={sortFavoritesByTitleAZ}>Sort A-Z</button>
            <button className="title-order" onClick={sortFavoritesByTitleZA}>Sort Z-A</button>
            {favorites.map((favorite) => (
              <div key={favorite.id}>
                <p>Episode: {favorite.title}</p>
                <button onClick={() => toggleFavorite(favorite)}>Remove</button>
              </div>
            ))}
          </div>
          {filteredData.map((show) => (
            <div key={show.id} className="podcast-item">
              <img
                src={show.image}
                alt={show.title}
                className="podcast-image"
                onClick={() => openOverlay(show)}
              />
              <div className="podcast-details">
                <h2 className="podcast-title">{show.title}</h2>
                <p className="podcast-season">Seasons: {show.seasons}</p>
                <p className="podcast-genres">
                  Genres:{" "}
                  {show.genres.map((genre) => genreMap[genre]).join(", ")}
                </p>
                <p className="podcast-updated">
                  Updated: {formatDateToLongDate(show.updated)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overlay */}
      {selectedPodcastDetails && (
        <div className="overlay">
          <div className="overlay-content">
            <button className="button" onClick={closeOverlay}>
              Close
            </button>
            <img
              className="overlay-img"
              src={selectedPodcastDetails.image}
              alt={selectedPodcastDetails.title}
            />
            <h2 className="podcast-title">{selectedPodcastDetails.title}</h2>
            <div className="overlay-scrollable-content">
              <p className="podcast-description">
                {selectedPodcastDetails.description}
              </p>
              <div className="podcast-seasons">
                {selectedPodcastDetails.seasons.map((season) => (
                  <div className="Season-title" key={season.title}>
                    <button
                      onClick={() => toggleSeasonVisibility(season.title)}
                    >
                      {season.title} ({season.count} episodes)
                    </button>
                    {seasonVisibility[season.title] && (
                      <div className="episodes">
                        <img
                          className="overlay-img"
                          src={season.image}
                          alt={season.title}
                        />
                        <ul>
                          {season.episodes.map((episode) => (
                            <li key={episode.title}>
                              <button className="heart" onClick={() => toggleFavorite(episode)}>
                                {favorites.includes(episode) ? "❤️" : "🤍"}
                              </button>
                              <h4>{episode.title}</h4>
                              <p>{episode.description}</p>
                              <div className="audio-player-container">
                                <audio
                                  controls
                                  onPlay={() => setIsAudioPlaying(true)}
                                  onPause={() => setIsAudioPlaying(false)}
                                >
                                  <source
                                    src={episode.file}
                                    type="audio/mpeg"
                                  />
                                  Your browser does not support the audio
                                  element.
                                </audio>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
