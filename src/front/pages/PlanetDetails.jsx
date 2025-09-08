import React, { useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";

import { getPlanetDetails } from "../services/star-wars-services.js";

import starWarsImageError from "../assets/star-wars-image-error.jpg";


export const PlanetDetails = () => {

    const navigate = useNavigate();
    const { planetId } = useParams();

    const { store, dispatch } = useGlobalReducer();
    const planetDetails = store.planetDetails;
    const favorites = store.favorites;
    const planetFavoriteId = planetId + 100;
    const favoriteTrue = favorites.find(favorite => favorite.id === planetFavoriteId && favorite.like === true);


    useEffect(() => {
        const getPlanetDetailsInComponent = async () => {
            const planetDetailsInComponent = await getPlanetDetails(planetId);
            dispatch({
                type: "GET-PLANET-DETAILS",
                payload: planetDetailsInComponent
            })
        };
        getPlanetDetailsInComponent();
    }, [])


    const handleImageError = (imageError) => {
        event.target.src = starWarsImageError;
    }

    const handleBack = () => {
        navigate("/planets");
    }

    const handleFavorites = () => {
        const favoriteExists = favorites.find(favorite => favorite.id === planetFavoriteId);
        if (!favoriteExists) {
            dispatch({
                type: "ADD-FAVORITES",
                payload: { name: planetDetails.name, like: true, id: planetFavoriteId }
            });
        } else {
            dispatch({
                type: "REMOVE-FAVORITES",
                payload: { name: planetDetails.name, like: false, id: planetFavoriteId }
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
                            <li className="list-group-item"><b>Climate:</b>{` ${planetDetails.climate}`}</li>
                            <li className="list-group-item"><b>Surface water:</b>{` ${planetDetails.surface_water}`}</li>
                            <li className="list-group-item"><b>Diameter:</b>{` ${planetDetails.diameter}`}</li>
                            <li className="list-group-item"><b>Rotation Period:</b>{` ${planetDetails.rotation_period}`}</li>
                            <li className="list-group-item"><b>Terrain:</b>{` ${planetDetails.terrain}`}</li>
                            <li className="list-group-item"><b>Gravity:</b>{` ${planetDetails.gravity}`}</li>
                            <li className="list-group-item"><b>Orbital Period:</b>{` ${planetDetails.orbital_period}`}</li>
                            <li className="list-group-item"><b>Population:</b>{` ${planetDetails.population}`}</li>
                        </ul>
                        <div className="d-flex justify-content-start gap-3 py-3 ps-3">
                            <button onClick={handleBack} className="btn btn-secondary">Back</button>
                            <button onClick={handleFavorites}
                                type="button" className="p-0 border-0 bg-transparent">
                                <i className={`fa-${favoriteTrue ? "solid" : "regular"} fa-xl fa-heart`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}