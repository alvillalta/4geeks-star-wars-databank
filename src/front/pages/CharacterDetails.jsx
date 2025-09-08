import React, { useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";

import { getCharacterDetails } from "../services/star-wars-services.js";

import starWarsImageError from "../assets/star-wars-image-error.jpg";


export const CharacterDetails = () => {

    const navigate = useNavigate();
    const { characterId } = useParams();

    const { store, dispatch } = useGlobalReducer();
    const characterDetails = store.characterDetails;
    const favorites = store.favorites;
    const favoriteTrue = favorites.find(favorite => favorite.id === characterId && favorite.like === true);

    useEffect(() => {
        const getCharacterDetailsInComponent = async () => {
            const characterDetailsInComponent = await getCharacterDetails(characterId);
            dispatch({
                type: "GET-CHARACTER-DETAILS",
                payload: characterDetailsInComponent
            });
        };
        getCharacterDetailsInComponent();
    }, [])


    const handleImageError = (imageError) => {
        event.target.src = starWarsImageError;
    }

    const handleBack = () => {
        navigate("/characters");
    }

    const handleFavorites = (characterId) => {
        const favoriteExists = favorites.find(favorite => favorite.id === characterId);
        if (!favoriteExists) {
            dispatch({
                type: "ADD-FAVORITES",
                payload: { name: characterDetails.name, like: true, id: characterId }
            });
        } else {
            dispatch({
                type: "REMOVE-FAVORITES",
                payload: { name: characterDetails.name, like: false, id: characterId }
            });
        }
    }

    return (
        <div className="container my-4">
            <div className="card mb-3">
                <div className="row g-0">
                    <div className="col-lg-4 d-flex justify-content-center justify-content-md-start">
                        <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/characters/${characterId}.jpg`}
                            onError={handleImageError} className="css-card-image-details rounded-start" />
                    </div>
                    <div className="col-lg-8">
                        <h2 className="card-title py-3 ps-3">{characterDetails.name}</h2>
                        <ul className="list-group">
                            <li className="list-group-item"><b>Gender:</b>{` ${characterDetails.gender}`}</li>
                            <li className="list-group-item"><b>Skin color:</b>{` ${characterDetails.skin_color}`}</li>
                            <li className="list-group-item"><b>Hair color:</b>{` ${characterDetails.hair_color}`}</li>
                            <li className="list-group-item"><b>Height:</b>{` ${characterDetails.height}`}</li>
                            <li className="list-group-item"><b>Eye color:</b>{` ${characterDetails.eye_color}`}</li>
                            <li className="list-group-item"><b>Mass:</b>{` ${characterDetails.mass}`}</li>
                            {/* <li className="list-group-item"><b>Homeworld:</b>{` ${characterDetails.homeworld}`}</li> */}
                            <li className="list-group-item"><b>Birth year:</b>{` ${characterDetails.birth_year}`}</li>
                        </ul>
                        <div className="d-flex justify-content-start gap-3 py-3 ps-3">
                            <button onClick={handleBack} className="btn btn-secondary">Back</button>
                            <button onClick={() => handleFavorites(characterId)}
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