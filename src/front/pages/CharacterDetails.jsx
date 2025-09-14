import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getCharacterDetails, postCharacterFavorite, deleteCharacterFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";


export const CharacterDetails = () => {
    const navigate = useNavigate();
    const { characterId } = useParams();;
    const { store, dispatch } = useGlobalReducer();
    const characterDetails = store.characterDetails;
    const characterFavorites = store.characterFavorites;
    const isCharacterFavorite = characterFavorites.find(favorite => favorite.character_id === Number(characterId));

    useEffect(() => {
        const initializeCharacterDetails = async () => {
            const characterDetailsGot = await getCharacterDetails(characterId);
            dispatch({
                type: "CHARACTER-DETAILS",
                payload: characterDetailsGot
            });
        };
        initializeCharacterDetails();
        return () => {
            dispatch({ 
                type: "CHARACTER-DETAILS", 
                payload: {} 
            });
        };
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handleBack = () => {
        navigate("/characters");
    }

    const handleCharacterFavorites = async (characterId, isCharacterFavorite) => {
        try {
            if (!isCharacterFavorite) {
                const characterFavorite = await postCharacterFavorite(characterId);
                dispatch({
                    type: "POST-CHARACTER-FAVORITE",
                    payload: characterFavorite
                });
            } else {
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
                            <li className="list-group-item"><b>Birth year:</b>{` ${characterDetails.birth_year}`}</li>
                        </ul>
                        <div className="d-flex justify-content-start gap-3 py-3 ps-3">
                            <button onClick={handleBack} className="btn btn-secondary">Back</button>
                            <button onClick={() => handleCharacterFavorites(characterId, isCharacterFavorite)}
                                type="button" className="p-0 border-0 bg-transparent">
                                <i className={`fa-${isCharacterFavorite ? "solid" : "regular"} fa-xl fa-heart`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}