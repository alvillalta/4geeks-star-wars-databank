import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";
import { getCharacters } from "../services/star-wars-services.js";

import starWarsImageError from "../assets/star-wars-image-error.jpg";


export const Characters = () => {

    //  Declarations
    const navigate = useNavigate();

    const { store, dispatch } = useGlobalReducer();
    const characters = store.characters;
    const favorites = store.favorites;


    //  Fetch characters
    useEffect(() => {
        const getCharactersInComponent = async () => {
            const charactersInComponent = await getCharacters();
            dispatch({
                type: "GET-CHARACTERS",
                payload: charactersInComponent
            });
        };
        getCharactersInComponent();
    }, [])


    //  Handlers
    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handleCharacterDetails = (item) => {
        navigate(`/characters/${item.uid}`);
    }

    const handleFavorites = (item) => {
        const favoriteExists = favorites.find(favorite => favorite.id === item.uid);
        if (!favoriteExists) {
            dispatch({
                type: "ADD-FAVORITES",
                payload: { name: item.name, like: true, id: item.uid }
            });
        } else {
            dispatch({
                type: "REMOVE-FAVORITES",
                payload: { name: item.name, like: false, id: item.uid }
            });
        }
    }

    
    //  Render
    return (
        <div className="container text-center my-4">
            <h3 className="text-center mb-3">Characters</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {characters.map((item) => {

                    //  Map Settings
                    const favoriteTrue = favorites.find(favorite => favorite.id === item.uid && favorite.like === true);
                    return (
                        <div className="col" key={item.uid}>
                            <div className="card mb-3">
                                <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/characters/${item.uid}.jpg`}
                                    onError={handleImageError} className="css-card-image card-img-top"/>
                                <div className="col-md-10 d-flex align-items-start">
                                    <div className="card-body text-start">
                                        <h5 className="card-title">{item.name}</h5>
                                        <div className="d-flex justify-content-start gap-3">
                                            <button onClick={() => handleCharacterDetails(item)} className="btn btn-dark">
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