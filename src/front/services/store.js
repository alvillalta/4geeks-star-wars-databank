export const initialStore = () => {
  return {
    contacts: [],
    contactToEdit: {},
    characters: [],
    characterDetails: {},
    planets: [],
    planetDetails: {},
    starships: [],
    starshipDetails: {},
    favorites: [],
    login: {
      token: "",
      isLogged: false
    },
    currentUser: {}
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case "LOGIN":
      return { ...store, login: action.payload };

    case "CURRENT-USER":
      return { ...store, currentUser: action.payload };
      
    case "GET-AGENDA":
      return { ...store, contacts: action.payload };

    case "EDIT-CONTACT":
      return { ...store, contactToEdit: action.payload };

    case "GET-CHARACTERS":
      return { ...store, characters: action.payload };

    case "GET-CHARACTER-DETAILS":
      return { ...store, characterDetails: action.payload};

    case "GET-PLANETS":
      return { ...store, planets: action.payload };

    case "GET-PLANET-DETAILS":
      return { ...store, planetDetails: action.payload };

    case "GET-STARSHIPS":
      return { ...store, starships: action.payload };

    case "GET-STARSHIP-DETAILS":
      return { ...store, starshipDetails: action.payload };

    case "ADD-FAVORITES":
      return { ...store, favorites: [...store.favorites, action.payload] };

    case "REMOVE-FAVORITES":
      return { ...store, favorites: store.favorites.filter(item => item.id !== action.payload.id) };
    
    default:
      throw Error("Unknown action.");
  }
}
