import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getPlanetDetails, postPlanetFavorite, deletePlanetFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const PlanetDetails = () => {
    const navigate = useNavigate();
    const { planetId } = useParams();
    const planetIdInt = parseInt(planetId, 10);
    if (!planetIdInt) {
        navigate("/planets");
    }
    const { store, dispatch } = useGlobalReducer();
    const planetDetails = store.planetDetails;
    const planetFavorites = store.planetFavorites;
    const isPlanetFavorite = planetFavorites.find(favorite => favorite.planet_id === planetIdInt);

    useEffect(() => {
        const initializePlanetDetails = async () => {
            const planetDetailsGot = await getPlanetDetails(planetIdInt);
            dispatch({
                type: "PLANET-DETAILS",
                payload: planetDetailsGot
            });
        };
        initializePlanetDetails();
        return () => {
            dispatch({ 
                type: "PLANET-DETAILS", 
                payload: {} 
            });
        };
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handleBack = () => {
        navigate("/planets");
    }

    const handlePlanetFavorites = async (planetIdInt, isPlanetFavorite) => {
        try {
            if (!isPlanetFavorite) {
                const planetFavorite = await postPlanetFavorite(planetIdInt);
                dispatch({
                    type: "POST-PLANET-FAVORITE",
                    payload: planetFavorite
                });
            } else {
                const responseStatus = await deletePlanetFavorite(planetIdInt);
                if (responseStatus == 200) {
                    dispatch({
                        type: "DELETE-PLANET-FAVORITE",
                        payload: planetIdInt
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
        <div className="container my-4">
            <div className="card mb-3">
                <div className="row g-0">
                    <div className="col-lg-4 d-flex justify-content-center justify-content-md-start">
                        <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/planets/${planetId}.jpg`}
                            onError={handleImageError} className="css-card-image-details rounded-start" />
                    </div>
                    <div className="col-lg-8">
                        <h2 className="card-title py-3 ps-3">{planetDetails.name}</h2>
                        <ul className="list-group">
                            <li className="list-group-item border-start-0 border-end-0"><b>Climate:</b>{` ${planetDetails.climate}`}</li>
                            <li className="list-group-item border-start-0 border-end-0"><b>Diameter:</b>{` ${planetDetails.diameter}`}</li>
                            <li className="list-group-item border-start-0 border-end-0"><b>Rotation Period:</b>{` ${planetDetails.rotation_period}`}</li>
                            <li className="list-group-item border-start-0 border-end-0"><b>Terrain:</b>{` ${planetDetails.terrain}`}</li>
                            <li className="list-group-item border-start-0 border-end-0"><b>Gravity:</b>{` ${planetDetails.gravity}`}</li>
                            <li className="list-group-item border-start-0 border-end-0"><b>Orbital Period:</b>{` ${planetDetails.orbital_period}`}</li>
                            <li className="list-group-item border-start-0 border-end-0"><b>Population:</b>{` ${planetDetails.population}`}</li>
                        </ul>
                        <div className="d-flex justify-content-start gap-3 py-3 ps-3">
                            <button onClick={handleBack} className="btn btn-dark">Back</button>
                            <button onClick={() => handlePlanetFavorites(planetIdInt, isPlanetFavorite)}
                                type="button" className="p-0 border-0 bg-transparent">
                                <i className={`fa-${isPlanetFavorite ? "solid" : "regular"} fa-xl fa-heart`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
