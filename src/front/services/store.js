export const initialStore = () => {

  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const storedCharacterFavorites = localStorage.getItem("character-favorites");
  const storedPlanetFavorites = localStorage.getItem("planet-favorites");
  const storedStarshipFavorites = localStorage.getItem("starship-favorites");

  return {
    login: {
      token: storedToken || "",
      isLogged: storedToken ? true : false
    },
    currentUser: storedToken && storedUser ? JSON.parse(storedUser) : {},

    contacts: [],
    contactToEdit: {},

    characters: [],
    characterDetails: {},
    characterFavorites: storedToken && storedCharacterFavorites ? JSON.parse(storedCharacterFavorites) : [],

    planets: [],
    planetDetails: {},
    planetFavorites: storedToken && storedPlanetFavorites ? JSON.parse(storedPlanetFavorites) : [],

    starships: [],
    starshipDetails: {},
    starshipFavorites: storedToken && storedStarshipFavorites ? JSON.parse(storedStarshipFavorites) : [],
  };
};


export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case "LOGIN":
      return { ...store, login: action.payload };

    case "LOGOUT":
      return initialStore();

    case "CURRENT-USER":
      return { ...store, currentUser: action.payload };
      
    case "GET-AGENDA":
      return { ...store, contacts: action.payload };

    case "EDIT-CONTACT":
      return { ...store, contactToEdit: action.payload };

    case "CHARACTERS":
      return { ...store, characters: action.payload };

    case "CHARACTER-DETAILS":
      return { ...store, characterDetails: action.payload};

    case "CHARACTER-FAVORITES":
      return { ...store, characterFavorites: action.payload };

    case "POST-CHARACTER-FAVORITE":
      return { ...store, characterFavorites: store.characterFavorites.push(action.payload) };

    case "DELETE-CHARACTER-FAVORITE":
      return { ...store, characterFavorites: store.characterFavorites.filter(favorite => favorite.character_id !== action.payload) };

    case "PLANETS":
      return { ...store, planets: action.payload };

    case "PLANET-DETAILS":
      return { ...store, planetDetails: action.payload };

    case "PLANET-FAVORITES":
      return { ...store, planetFavorites: action.payload };

    case "POST-PLANET-FAVORITE":
      return { ...store, planetFavorites: store.planetFavorites.push(action.payload) };

    case "DELETE-PLANET-FAVORITE":
      return { ...store, planetFavorites: store.planetFavorites.filter(favorite => favorite.planet_id !== action.payload) };  

    case "STARSHIPS":
      return { ...store, starships: action.payload };

    case "STARSHIP-DETAILS":
      return { ...store, starshipDetails: action.payload };  

    case "STARSHIP-FAVORITES":
      return { ...store, starshipFavorites: action.payload };

    case "POST-STARSHIP-FAVORITE":
      return { ...store, starshipFavorites: store.starshipFavorites.push(action.payload) };

    case "DELETE-STARSHIP-FAVORITE":
      return { ...store, starshipFavorites: store.starshipFavorites.filter(favorite => favorite.starship_id !== action.payload) };
    
    default:
      throw Error("Unknown action.");
  }
}
