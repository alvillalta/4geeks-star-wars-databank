import React, { useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";

import { getStarshipDetails } from "../services/star-wars-services.js";

import starWarsImageError from "../assets/star-wars-image-error.jpg";


export const StarshipDetails = () => {

    const navigate = useNavigate();
    const { starshipId } = useParams();

    const { store, dispatch } = useGlobalReducer();
    const starshipDetails = store.starshipDetails;
    const favorites = store.favorites;
    const starshipFavoriteId = starshipId + 200;
    const favoriteTrue = favorites.find(favorite => favorite.id === starshipFavoriteId && favorite.like === true);


    useEffect(() => {
        const getStarshipDetailsInComponent = async () => {
            const starshipDetailsInComponent = await getStarshipDetails(starshipId);
            dispatch({
                type: "GET-STARSHIP-DETAILS",
                payload: starshipDetailsInComponent
            })
        };
        getStarshipDetailsInComponent();
    }, [])


    const handleImageError = (imageError) => {
        event.target.src = starWarsImageError;
    }

    const handleBack = () => {
        navigate("/starships");
    }

    const handleFavorites = () => {
        const favoriteExists = favorites.find(favorite => favorite.id === starshipFavoriteId);
        if (!favoriteExists) {
            dispatch({
                type: "ADD-FAVORITES",
                payload: { name: starshipDetails.name, like: true, id: starshipFavoriteId }
            });
        } else {
            dispatch({
                type: "REMOVE-FAVORITES",
                payload: { name: starshipDetails.name, like: false, id: starshipFavoriteId }
            });
        }
    }

    return (
        <div className="container my-4">
            <div className="card mb-3">
                <div className="row g-0">
                    <div className="col-lg-4 d-flex justify-content-center justify-content-md-start">
                        <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/starships/${starshipId}.jpg`}
                            onError={handleImageError} className="css-card-image-details rounded-start" />
                    </div>
                    <div className="col-lg-8">
                        <h2 className="card-title py-3 ps-3">{starshipDetails.name}</h2>
                        <ul className="list-group">
                            <li className="list-group-item"><b>Consumables:</b>{` ${starshipDetails.consumables}`}</li>
                            <li className="list-group-item"><b>Cargo capacity:</b>{` ${starshipDetails.cargo_capacity}`}</li>
                            <li className="list-group-item"><b>Passengers:</b>{` ${starshipDetails.passengers}`}</li>
                            <li className="list-group-item"><b>Max atmospheric speed:</b>{` ${starshipDetails.max_atmosphering_speed}`}</li>
                            <li className="list-group-item"><b>Crew:</b>{` ${starshipDetails.crew}`}</li>
                            <li className="list-group-item"><b>Length:</b>{` ${starshipDetails.length}`}</li>
                            <li className="list-group-item"><b>Model:</b>{` ${starshipDetails.model}`}</li>
                            <li className="list-group-item"><b>Cost in credits:</b>{` ${starshipDetails.cost_in_credits}`}</li>
                            <li className="list-group-item"><b>Manufacturer:</b>{` ${starshipDetails.manufacturer}`}</li>
                            <li className="list-group-item"><b>Starship class:</b>{` ${starshipDetails.starship_class}`}</li>
                            <li className="list-group-item"><b>Hyperdrive rating:</b>{` ${starshipDetails.hyperdrive_rating}`}</li>
                        </ul>
                        <div className="d-flex justify-content-start gap-3 py-3 ps-3">
                            <button onClick={handleBack} className="btn btn-secondary ">Back</button>
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