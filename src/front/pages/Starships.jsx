import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";
import { getStarships } from "../services/star-wars-services.js";

import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const Starships = () => {

    const navigate = useNavigate();

    const { store, dispatch } = useGlobalReducer();
    const starships = store.starships;
    const favorites = store.favorites;

    useEffect(() => {
        const getStarshipsInComponent = async () => {
            const starshipsInComponent = await getStarships();
            dispatch({
                type: "GET-STARSHIPS",
                payload: starshipsInComponent
            });
        };
        getStarshipsInComponent();
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handleStarshipDetails = (item) => {
        navigate(`/starships/${item.uid}`);
    }

    const handleFavorites = (item) => {
        const starshipFavoriteId = item.uid + 200;
        const favoriteExists = favorites.find(favorite => favorite.id === starshipFavoriteId);
        if (!favoriteExists) {
            dispatch({
                type: "ADD-FAVORITES",
                payload: { name: item.name, like: true, id: starshipFavoriteId }
            });
        } else {
            dispatch({
                type: "REMOVE-FAVORITES",
                payload: { name: item.name, like: false, id: starshipFavoriteId }
        });}
    }

   return (
        <div className="container text-center my-4">
            <h3 className="text-center mb-3">Starships</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {starships.map((item) => {
                    const starshipFavoriteId = item.uid + 200;
                    const favoriteTrue = favorites.find(favorite => favorite.id === starshipFavoriteId && favorite.like === true);
                    return (
                        <div className="col" key={item.uid}>
                            <div className="card mb-3">
                                        <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/starships/${item.uid}.jpg`}
                                            onError={handleImageError} className="css-card-image card-img-top" />
                                <div className="col-md-10 d-flex align-items-start">
                                    <div className="card-body text-start">
                                        <h5 className="card-title">{item.name}</h5>
                                        <div className="d-flex justify-content-start gap-3">
                                            <button onClick={() => handleStarshipDetails(item)} className="btn btn-dark">
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
