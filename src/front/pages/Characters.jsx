import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getCharacters, postCharacterFavorite, deleteCharacterFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";


export const Characters = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const characters = store.characters;
    const characterFavorites = store.characterFavorites;

    useEffect(() => {
        const initializeCharacters = async () => {
            const charactersGot = await getCharacters();
            dispatch({
                type: "CHARACTERS",
                payload: charactersGot
            });
        };
        initializeCharacters();
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handleCharacterDetails = (itemId) => {
        navigate(`/characters/${itemId}`);
    }

    const handleCharacterFavorites = async (itemId, isCharacterFavorite) => {
        try {
            if (!isCharacterFavorite) {
                const characterFavorite = await postCharacterFavorite(itemId);
                dispatch({
                    type: "POST-CHARACTER-FAVORITE",
                    payload: characterFavorite
                });
            } else {
                const responseStatus = await deleteCharacterFavorite(itemId);
                if (responseStatus == 204) {
                    dispatch({
                        type: "DELETE-CHARACTER-FAVORITE",
                        payload: itemId
                    });
                }
            } 
        } catch (error) {
            return alert(error.message);
        }
    }
    
    return (
        <div className="container text-center my-4">
            <h3 className="text-center mb-3">Characters</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {characters.map((item) => {
                    const isCharacterFavorite = characterFavorites.find(favorite => favorite.character_id === item.id);
                    return (
                        <div className="col" key={item.id}>
                            <div className="card mb-3">
                                <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/characters/${item.id}.jpg`}
                                    onError={handleImageError} className="css-card-image card-img-top"/>
                                <div className="col-md-10 d-flex align-items-start">
                                    <div className="card-body text-start">
                                        <h5 className="card-title">{item.name}</h5>
                                        <div className="d-flex justify-content-start gap-3">
                                            <button onClick={() => handleCharacterDetails(item.id)} className="btn btn-dark">
                                                Details
                                            </button>
                                            <button onClick={() => handleCharacterFavorites(item.id, isCharacterFavorite)} type="button" className="p-0 border-0 bg-transparent">
                                                <i className={`fa-${isCharacterFavorite ? "solid" : "regular"} fa-xl fa-heart`}></i></button>
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