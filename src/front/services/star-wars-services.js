const host = import.meta.env.VITE_BACKEND_URL;


export const getFavorites = async (userId) => {
  const uri = `${host}/api/users/${userId}/favorites`;
  const options = { 
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const favorites = {
    characterFavorites: [],
    planetFavorites: [],
    starshipFavorites: []
  }
  const characterFavoritesStorage = localStorage.getItem(`character-favorites`);
  const planetFavoritesStorage = localStorage.getItem(`planet-favorites`);
  const starshipFavoritesStorage = localStorage.getItem(`starship-favorites`);
  if (!characterFavoritesStorage && !planetFavoritesStorage && !starshipFavoritesStorage) {
    const response = await fetch(uri, options);
    if (!response.ok) {
      const backError = await response.json();
      throw new Error(backError.message || `Error ${response.status}`);
    }
    const backData = await response.json();
    localStorage.setItem(`character-favorites`, JSON.stringify(backData.characterFavorites));
    localStorage.setItem(`planet-favorites`, JSON.stringify(backData.planetFavorites));
    localStorage.setItem(`starship-favorites`, JSON.stringify(backData.starshipFavorites));
    favorites.characterFavorites = backData.characterFavorites;
    favorites.planetFavorites = backData.planetFavorites;
    favorites.starshipFavorites = backData.starshipFavorites;
    return favorites;
  };
  if (!characterFavoritesStorage || !planetFavoritesStorage || !starshipFavoritesStorage) {
    throw new Error("Error saving favorites in local storage");
  }
  favorites.characterFavorites = JSON.parse(characterFavoritesStorage);
  favorites.planetFavorites = JSON.parse(planetFavoritesStorage);
  favorites.starshipFavorites = JSON.parse(starshipFavoritesStorage);
  return favorites;
};


export const getCharacters = async () => {
  const uri = `${host}/api/characters`
  const options = { method: "GET" };
  const charactersStorage = localStorage.getItem("characters");
  if (charactersStorage) {
    return JSON.parse(charactersStorage);
  }
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const charactersData = await response.json();
  localStorage.setItem("characters", JSON.stringify(charactersData.results));
  return charactersData.results;
};


export const getCharacterDetails = async (characterId) => {
  const uri = `${host}/api/characters/${characterId}`
  const options = { method: "GET" };
  const characterDetailsStorage = localStorage.getItem(`character-details-${characterId}`);
  if (characterDetailsStorage) {
    return JSON.parse(characterDetailsStorage);
  }
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const characterDetailsData = await response.json();
  localStorage.setItem(`character-details-${characterId}`, JSON.stringify(characterDetailsData.results));
  return characterDetailsData.results;
};


export const postCharacterFavorite = async (characterId) => {
  const uri = `${host}/api/characters/${characterId}`
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    if (response.status === 401 || response.status === 422) {
        throw new Error("Please log in to manage favorites")
    }
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const characterFavorite = await response.json();
  const storedCharacterFavorites = JSON.parse(localStorage.getItem("character-favorites"));
  const updatedCharacterFavorites = [...storedCharacterFavorites, characterFavorite.results];
  localStorage.setItem("character-favorites", JSON.stringify(updatedCharacterFavorites));
  return characterFavorite.results;
};


export const deleteCharacterFavorite = async (characterId) => {
  const uri = `${host}/api/characters/${characterId}`
  const options = {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const storedCharacterFavorites = JSON.parse(localStorage.getItem("character-favorites"));
  const updatedCharacterFavorites = storedCharacterFavorites.filter(favorite => favorite.character_id !== characterId);
  localStorage.setItem("character-favorites", JSON.stringify(updatedCharacterFavorites));
  return response.status;
};


export const getPlanets = async () => {
  const uri = `${host}/api/planets`
  const options = { method: "GET" };
  const planetsStorage = localStorage.getItem(`planets`);
  if (planetsStorage) {
    return JSON.parse(planetsStorage);
  }
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const planetsData = await response.json();
  localStorage.setItem("planets", JSON.stringify(planetsData.results));
  return planetsData.results;
};


export const getPlanetDetails = async (planetId) => {
  const uri = `${host}/api/planets/${planetId}`
  const options = { method: "GET" };
  const planetDetailsStorage = localStorage.getItem(`planet-details-${planetId}`);
  if (planetDetailsStorage) {
    return JSON.parse(planetDetailsStorage);
  }
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const planetDetailsData = await response.json();
  localStorage.setItem(`planet-details-${planetId}`, JSON.stringify(planetDetailsData.results));
  return planetDetailsData.results;
};


export const postPlanetFavorite = async (planetId) => {
  const uri = `${host}/api/planets/${planetId}`
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    if (response.status === 401 || response.status === 422) {
        throw new Error("Please log in to manage favorites")
    }
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const planetFavorite = await response.json();
  const storedPlanetFavorites = JSON.parse(localStorage.getItem("planet-favorites"));
  const updatedPlanetFavorites = [...storedPlanetFavorites, planetFavorite.results];
  localStorage.setItem("planet-favorites", JSON.stringify(updatedPlanetFavorites));
  return planetFavorite.results;
};


export const deletePlanetFavorite = async (planetId) => {
  const uri = `${host}/api/planets/${planetId}`
  const options = {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const storedPlanetFavorites = JSON.parse(localStorage.getItem("planet-favorites"));
  const updatedPlanetFavorites = storedPlanetFavorites.filter(favorite => favorite.planet_id !== planetId);
  localStorage.setItem("planet-favorites", JSON.stringify(updatedPlanetFavorites));
  return response.status;
};


export const getStarships = async () => {
  const uri = `${host}/api/starships`
  const options = { method: "GET" };
  const starshipsStorage = localStorage.getItem(`starships`);
  if (starshipsStorage) {
    return JSON.parse(starshipsStorage);
  }
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const starshipsData = await response.json();
  localStorage.setItem("starships", JSON.stringify(starshipsData.results));
  return starshipsData.results;
};


export const getStarshipDetails = async (starshipId) => {
  const uri = `${host}/api/starships/${starshipId}`
  const options = { method: "GET" };
  const starshipDetailsStorage = localStorage.getItem(`starship-details-${starshipId}`);
  if (starshipDetailsStorage) {
    return JSON.parse(starshipDetailsStorage);
  }
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const starshipDetailsData = await response.json();
  localStorage.setItem(`starship-details-${starshipId}`, JSON.stringify(starshipDetailsData.results));
  return starshipDetailsData.results;
};


export const postStarshipFavorite = async (starshipId) => {
  const uri = `${host}/api/starships/${starshipId}`
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    if (response.status === 401 || response.status === 422) {
        throw new Error("Please log in to manage favorites")
    }
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const starshipFavorite = await response.json();
  const storedStarshipFavorites = JSON.parse(localStorage.getItem("starship-favorites"));
  const updatedStarshipFavorites = [...storedStarshipFavorites, starshipFavorite.results];
  localStorage.setItem("starship-favorites", JSON.stringify(updatedStarshipFavorites));
  return starshipFavorite.results;
};


export const deleteStarshipFavorite = async (starshipId) => {
  const uri = `${host}/api/starships/${starshipId}`
  const options = {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const storedStarhipFavorites = JSON.parse(localStorage.getItem("starship-favorites"));
  const updatedStarshipFavorites = storedStarhipFavorites.filter(favorite => favorite.starship_id !== starshipId);
  localStorage.setItem("starship-favorites", JSON.stringify(updatedStarshipFavorites));
  return response.status;
};
