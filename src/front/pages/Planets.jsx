import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getPlanets, postPlanetFavorite, deletePlanetFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const Planets = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const planets = store.planets;
    const planetFavorites = store.planetFavorites;

    useEffect(() => {
        const initializePlanets = async () => {
            const planetsGot = await getPlanets();
            dispatch({
                type: "PLANETS",
                payload: planetsGot
            });
        };
        initializePlanets();
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handlePlanetDetails = (itemId) => {
        navigate(`/planets/${itemId}`);
    }

    const handlePlanetFavorites = async (itemId, isPlanetFavorite) => {
        try {
            if (!isPlanetFavorite) {
                const planetFavorite = await postPlanetFavorite(itemId);
                dispatch({
                    type: "POST-PLANET-FAVORITE",
                    payload: planetFavorite
                });
            } else {
                const responseStatus = await deletePlanetFavorite(itemId);
                if (responseStatus == 200) {
                    dispatch({
                        type: "DELETE-PLANET-FAVORITE",
                        payload: itemId
                    });
                }
            } 
        } catch (error) {
            dispatch({
                type: "SET-NOTIFICATION",
                payload: error.message 
            });
        }
    }

    return (
        <div className="container text-center my-4">
            <h3 className="text-center mb-3">Planets</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {planets.map((item) => {
                    const isPlanetFavorite = planetFavorites.find(favorite => favorite.planet_id === item.id);
                    return (
                        <div className="col d-flex" key={item.id}>
                            <div className="card d-flex flex-fill mb-3">
                                <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/planets/${item.id}.jpg`}
                                    onError={handleImageError} className="css-card-image" />
                                <div className="card-body">
                                    <h5 className="card-title text-start mb-0">{item.name}</h5>
                                </div>
                                <div className="card-footer d-flex justify-content-start gap-3 bg-transparent border-0 pt-0 pb-3 ps-3">
                                    <button onClick={() => handlePlanetDetails(item.id)} className="btn btn-dark">
                                        Details
                                    </button>
                                    <button onClick={() => handlePlanetFavorites(item.id, isPlanetFavorite)} type="button" className="p-0 border-0 bg-transparent">
                                        <i className={`fa-${isPlanetFavorite ? "solid" : "regular"} fa-xl fa-heart`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div >
    )
}
