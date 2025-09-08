import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";
import { getPlanets } from "../services/star-wars-services.js";

import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const Planets = () => {

    const navigate = useNavigate();

    const { store, dispatch } = useGlobalReducer();
    const planets = store.planets;
    const favorites = store.favorites;

    useEffect(() => {
        const getPlanetsInComponent = async () => {
            const planetsInComponent = await getPlanets();
            dispatch({
                type: "GET-PLANETS",
                payload: planetsInComponent
            });
        };
        getPlanetsInComponent();
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handlePlanetDetails = (item) => {
        navigate(`/planets/${item.uid}`);
    }

    const handleFavorites = (item) => {
        const planetFavoriteId = item.uid + 100;
        const favoriteExists = favorites.find(favorite => favorite.id === planetFavoriteId);
        if (!favoriteExists) {
            dispatch({
                type: "ADD-FAVORITES",
                payload: { name: item.name, like: true, id: planetFavoriteId }
            });
        } else {
            dispatch({
                type: "REMOVE-FAVORITES",
                payload: { name: item.name, like: false, id: planetFavoriteId }
            });
        }
    }

    return (
        <div className="container text-center my-4">
            <h3 className="text-center mb-3">Planets</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {planets.map((item) => {
                    const planetFavoriteId = item.uid + 100;
                    const favoriteTrue = favorites.find(favorite => favorite.id === planetFavoriteId && favorite.like === true);
                    return (
                        <div className="col" key={item.uid}>
                            <div className="card mb-3">
                                <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/planets/${item.uid}.jpg`}
                                    onError={handleImageError} className="css-card-image card-img-top" />
                                <div className="col-md-10 d-flex align-items-start">
                                    <div className="card-body text-start">
                                        <h5 className="card-title">{item.name}</h5>
                                        <div className="d-flex justify-content-start gap-3">
                                            <button onClick={() => handlePlanetDetails(item)} className="btn btn-dark">
                                                Details
                                            </button>
                                            <button onClick={() => handleFavorites(item)} type="button" className="p-0 border-0 bg-transparent">
                                                <i className={`fa-${favoriteTrue ? "solid" : "regular"} fa-xl fa-heart`}></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div >
    )
}