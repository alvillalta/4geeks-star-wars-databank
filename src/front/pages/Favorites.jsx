import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { deleteCharacterFavorite, deletePlanetFavorite, deleteStarshipFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const Favorites = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("All");
    const { store, dispatch } = useGlobalReducer();
    // sort() and reverse() methods modify the original array, so it's copied in order to operate without changing the one saved in the store
    const characterFavorites = [...store.characterFavorites].reverse();
    const planetFavorites = [...store.planetFavorites].reverse();
    const starshipFavorites = [...store.starshipFavorites].reverse();
    const allFavorites = [...store.characterFavorites, ...store.planetFavorites, ...store.starshipFavorites]
    const allFavoritesSorted = [...allFavorites].sort((favoriteA, favoriteB) => new Date(favoriteB.created_at) - new Date(favoriteA.created_at));

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    };

    const handleFilters = (event) => {
        setFilter(event.target.value);
    };

    const filteredFavorites = (filter) => {
        if (filter === "All") return allFavoritesSorted;
        if (filter === "Character") return characterFavorites;
        if (filter === "Planet") return planetFavorites;
        if (filter === "Starship") return starshipFavorites;
    };

    const getType = (item) => {
        if (item.character_id) return "character";
        if (item.planet_id) return "planet";
        if (item.starship_id) return "starship";
    };

    const cardConfiguration = {
        character: {
            type: "character",
            id: item => item.character_id,
            favoriteName: item => item.character_name,
            image: item => `https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/characters/${item.character_id}.jpg`,
            icon: <i className="fa-solid fa-user fa-lg"></i>,
            route: item => handleFavoriteDetails(`/characters/${item.character_id}`),
            deleteFavorite: item => handleDeleteFavorite(item.character_id, "character")
        },
        planet: {
            type: "planet",
            id: item => item.planet_id,
            favoriteName: item => item.planet_name,
            image: item => `https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/planets/${item.planet_id}.jpg`,
            icon: <i className="fa-solid fa-earth-oceania fa-lg"></i>,
            route: item => handleFavoriteDetails(`/planets/${item.planet_id}`),
            deleteFavorite: item => handleDeleteFavorite(item.planet_id, "planet")
        },
        starship: {
            type: "starship",
            id: item => item.starship_id,
            favoriteName: item => item.starship_name,
            image: item => `https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/starships/${item.starship_id}.jpg`,
            icon: <i className="fa-solid fa-shuttle-space fa-lg"></i>,
            route: item => handleFavoriteDetails(`/starships/${item.starship_id}`),
            deleteFavorite: item => handleDeleteFavorite(item.starship_id, "starship")
        }
    };

    const handleFavoriteDetails = (route) => {
        navigate(route);
    };

    const handleDeleteFavorite = async (itemId, type) => {
        try {
            if (store[`${type}Favorites`].find(favorite => favorite[`${type}_id`] === itemId)) {
                const deleteFavorite = {
                    character: deleteCharacterFavorite,
                    planet: deletePlanetFavorite,
                    starship: deleteStarshipFavorite
                };
                const deleteFunction = deleteFavorite[type]
                const responseStatus = await deleteFunction(itemId);
                if (responseStatus === 200) {
                    dispatch({
                        type: `DELETE-${type.toUpperCase()}-FAVORITE`,
                        payload: itemId
                    });
                };
            };
        } catch (error) {
            dispatch({
                type: "SET-NOTIFICATION",
                payload: error.message
            });
        }
    };

    return (
        <div className="container text-center my-4">
            <div className="d-flex justify-content-start align-items-center gap-3 mb-4">
                <div className="btn-group bg-white" role="group">
                    <input type="radio" className="btn-check" name="btnradio" id="btnAllFavorites" autocomplete="off"
                        onChange={handleFilters} value="All" checked={filter === "All"} />
                    <label className="btn btn-outline-dark" htmlFor="btnAllFavorites">
                        <i className="fa-solid fa-border-all fa-lg"></i>
                    </label>
                    <input type="radio" className="btn-check" name="btnradio" id="btnCharacters" autocomplete="off"
                        onChange={handleFilters} value="Character" checked={filter === "Character"} />
                    <label className="btn btn-outline-dark" htmlFor="btnCharacters">
                        <i className="fa-solid fa-user fa-lg"></i>
                    </label>
                    <input type="radio" className="btn-check" name="btnradio" id="btnPlanets" autocomplete="off"
                        onChange={handleFilters} value="Planet" checked={filter === "Planet"} />
                    <label className="btn btn-outline-dark" htmlFor="btnPlanets">
                        <i className="fa-solid fa-earth-oceania fa-lg"></i>
                    </label>
                    <input type="radio" className="btn-check" name="btnradio" id="btnStarships" autocomplete="off"
                        onChange={handleFilters} value="Starship" checked={filter === "Starship"} />
                    <label className="btn btn-outline-dark" htmlFor="btnStarships">
                        <i className="fa-solid fa-shuttle-space fa-lg"></i>
                    </label>
                </div>
                <h3 className="mb-0">{filter} Favorites</h3>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {allFavorites.length === 0 ?
                    <div class="alert alert-dark" role="alert">
                        There are no favorites left
                    </div>
                    :
                    filteredFavorites(filter).map((item) => {
                        const type = (filter === "All") ? getType(item) : filter.toLowerCase();
                        const card = cardConfiguration[type];
                        return (
                            <div className="col d-flex" key={card.type + "-" + card.id(item)}>
                                <div className="card d-flex flex-fill mb-3">
                                    <img src={card.image(item)} onError={handleImageError} className="css-card-image" />
                                    <div className="card-body">
                                        <h5 className="card-title text-start mb-0">{card.favoriteName(item)}</h5>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between align-items-center bg-transparent border-0 pt-0 pb-3 ps-3">
                                        <div className="d-flex justify-content-start gap-3">
                                            <button onClick={() => card.route(item)} className="btn btn-dark">
                                                Details
                                            </button>
                                            <button onClick={() => card.deleteFavorite(item)} type="button" className="p-0 border-0 bg-transparent">
                                                <i className="fa-heart fa-solid fa-xl"></i>
                                            </button>
                                        </div>
                                        {filter === "All" ?
                                            <div className="text-secondary">
                                                {card.icon}
                                            </div>
                                            :
                                            <div className="d-none"></div>
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div >
    )
}