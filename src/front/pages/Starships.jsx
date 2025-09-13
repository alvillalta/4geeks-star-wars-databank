import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getStarships, postStarshipFavorite, deleteStarshipFavorite } from "../services/star-wars-services.js";
import starWarsImageError from "../assets/star-wars-image-error.jpg";

export const Starships = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const starships = store.starships;
    const starshipFavorites = store.starshipFavorites;

    useEffect(() => {
        const initializeStarships = async () => {
            const starshipsGot = await getStarships();
            dispatch({
                type: "STARSHIPS",
                payload: starshipsGot
            });
        };
        initializeStarships();
    }, [])

    const handleImageError = (event) => {
        event.target.src = starWarsImageError;
    }

    const handleStarshipDetails = (itemId) => {
        navigate(`/starships/${itemId}`);
    }

    const handleStarshipFavorites = async (itemId, isStarshipFavorite) => {
        try {
            if (!isStarshipFavorite) {
                const starshipFavorite = await postStarshipFavorite(itemId);
                dispatch({
                    type: "POST-STARSHIP-FAVORITE",
                    payload: starshipFavorite
                });
            } else {
                const responseStatus = await deleteStarshipFavorite(itemId);
                if (responseStatus == 204) {
                    dispatch({
                        type: "DELETE-STARSHIP-FAVORITE",
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
            <h3 className="text-center mb-3">Starships</h3>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2">
                {starships.map((item) => {
                    const isStarshipFavorite = starshipFavorites.find(favorite => favorite.starship_id === item.id);
                    return (
                        <div className="col" key={item.id}>
                            <div className="card mb-3">
                                        <img src={`https://raw.githubusercontent.com/tbone849/star-wars-guide/refs/heads/master/build/assets/img/starships/${item.id}.jpg`}
                                            onError={handleImageError} className="css-card-image card-img-top" />
                                <div className="col-md-10 d-flex align-items-start">
                                    <div className="card-body text-start">
                                        <h5 className="card-title">{item.name}</h5>
                                        <div className="d-flex justify-content-start gap-3">
                                            <button onClick={() => handleStarshipDetails(item.id)} className="btn btn-dark">
                                                Details
                                            </button>
                                            <button onClick={() => handleStarshipFavorites(item.id, isStarshipFavorite)} type="button" className="p-0 border-0 bg-transparent">
                                                <i className={`fa-${isStarshipFavorite ? "solid" : "regular"} fa-xl fa-heart`}></i></button> 
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
