import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { deleteCharacterFavorite, deletePlanetFavorite, deleteStarshipFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const Favorites = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const characterFavorites = store.characterFavorites;
    const planetFavorites = store.planetFavorites;
    const starshipFavorites = store.starshipFavorites;

    const handleCharacterFavorites = async (characterId) => {
            try {
                if (characterFavorites.find(favorite => Number(favorite.character_id) === Number(characterId))) {
                    const responseStatus = await deleteCharacterFavorite(characterId);
                    if (responseStatus == 204) {
                        dispatch({
                            type: "DELETE-CHARACTER-FAVORITE",
                            payload: characterId
                        });
                    }
                } 
            } catch (error) {
                return alert(error.message);
            }
        }
        
    const handlePlanetFavorites = async (planetId) => {
            try {
                if (planetFavorites.find(favorite => Number(favorite.planet_id) === Number(planetId))) {
                    const responseStatus = await deletePlanetFavorite(planetId);
                    if (responseStatus == 204) {
                        dispatch({
                            type: "DELETE-PLANET-FAVORITE",
                            payload: planetId
                        });
                    }
                } 
            } catch (error) {
                return alert(error.message);
            }
        }

    const handleStarshipFavorites = async (starshipId) => {
            try {
                if (starshipFavorites.find(favorite => Number(favorite.starship_id) === Number(starshipId))) {
                    const responseStatus = await deleteStarshipFavorite(starshipId);
                    if (responseStatus == 204) {
                        dispatch({
                            type: "DELETE-STARSHIP-FAVORITE",
                            payload: starshipId
                        });
                    }
                } 
            } catch (error) {
                return alert(error.message);
            }
        }
    
    return (
        <div className="my-4">
            <div className="container">
                <div className="row justify-content-center mb-3"> 
                    <div className="col-md-4 d-flex flex-column justify-content-center align-items-center p-3">
                        <h3 className="mb-3">Character Favorites</h3>
                        <ul className="list-group w-100">
                            {characterFavorites.map(item => {
                                return (
                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                                        <Link to={`/characters/${item.character_id}`} className="my-0 text-decoration-none text-dark">
                                            {item.character_name}
                                        </Link>
                                        <button onClick={() => handleCharacterFavorites(item.character_id)} type="button" className="border-0 bg-transparent text-dark">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="col-md-4 d-flex flex-column justify-content-center align-items-center p-3">
                        <h3 className="mb-3">Planet Favorites</h3>
                        <ul className="list-group w-100">
                            {planetFavorites.map(item => {
                                return (
                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                                        <Link to={`/planets/${item.planet_id}`} className="my-0 text-decoration-none text-dark">
                                            {item.planet_name}
                                        </Link>
                                        <button onClick={() => handlePlanetFavorites(item.planet_id)} type="button" className="border-0 bg-transparent text-dark">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="col-md-4 d-flex flex-column justify-content-center align-items-center p-3">
                        <h3 className="mb-3">Starship Favorites</h3>
                        <ul className="list-group w-100">
                            {starshipFavorites.map(item => {
                                return (
                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                                        <Link to={`/starships/${item.starship_id}`} className="my-0 text-decoration-none text-dark">
                                            {item.starship_name}
                                        </Link>
                                        <button onClick={() => handleStarshipFavorites(item.starship_id)} type="button" className="border-0 bg-transparent text-dark">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}