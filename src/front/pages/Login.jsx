import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth.js";
import { getFavorites } from "../services/star-wars-services.js";


export const Login = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleEmail = event => setEmail(event.target.value);
    const handlePassword = event => setPassword(event.target.value);

    const handleSubmitLogin = async (event) => {
        event.preventDefault();
        const userToLogin = {
            "email": email,
            "password": password,
        }
        try {
            const userLogged = await login(userToLogin);
            dispatch({
                type: "LOGIN",
                payload: { token: userLogged.access_token, isLogged: true }
            });
            dispatch({
                type: "CURRENT-USER",
                payload: userLogged.results
            });
            console.log("Antes de favorites");
            const favorites = await getFavorites(userLogged.results.id);
            console.log("Después de favorites de favorites");
            dispatch({
                type: "CHARACTER-FAVORITES",
                payload: favorites.characterFavorites
            });
            dispatch({
                type: "PLANET-FAVORITES",
                payload: favorites.planetFavorites
            });
            dispatch({
                type: "STARSHIP-FAVORITES",
                payload: favorites.starshipFavorites
            });
            navigate("/");
        } catch (error) {
            setEmail("");
            setPassword("");
            dispatch({
                type: "SET-NOTIFICATION",
                payload: error.message 
            });
        }
    }

    const handlePasswordVisibility = (showPassword) => {
        if (showPassword === false) {
            setShowPassword(true);
        } else {
            setShowPassword(false);
        }
    }

    const handleCancel = () => {
        navigate("/");
    }

    return (
        <div className="d-flex justify-content-center my-4">
            <div className="col-10 col-md-6 col-lg-4 rounded-4 bg-white shadow">
                <div className="d-flex align-items-end justify-content-between p-5 pb-4 border-bottom-0">
                    <h1 className="fw-bold mb-0 fs-2">Log In</h1>
                    <button onClick={handleCancel} type="button" className="border-0 bg-transparent text-dark">
                        <i className="fa-solid fa-xmark fa-xl"></i>
                    </button>
                </div>
                <div className="p-5 pt-0">
                    <form onSubmit={handleSubmitLogin}>
                        <div className="mb-3">
                            <label htmlFor="loginEmail" className="mb-2">
                                Email address
                                <span className="text-body-tertiary">*</span>
                            </label>
                            <input type="email" className="form-control" id="loginEmail" placeholder="name@example.com"
                                value={email} onChange={handleEmail} required/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="loginPassword" className="mb-2">
                                Password
                                <span className="text-body-tertiary">*</span>
                            </label>
                            <div className="input-group">
                                <input type={showPassword ? "text" : "password"} className="form-control" id="loginPassword" placeholder={showPassword ? "Password" : "**********"}
                                    value={password} onChange={handlePassword} required/>
                                <button type="button" onClick={() => handlePasswordVisibility(showPassword)} className="input-group-text text-dark bg-tertiary">
                                    {showPassword ? 
                                        <i className="fa-solid fa-eye-slash"></i>
                                        :
                                        <i className="fa-solid fa-eye"></i>
                                    }
                                </button>
                            </div>
                        </div>
                        <p className="text-body-secondary mb-4">Forgot your password? <Link to="/recover-password" className="text-dark">Click here</Link></p>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Log In</button>
                        <hr className="my-4" />
                        <p className="text-body-secondary">Don't have an account? <Link to="/signup" className="text-dark">Sign up here</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}; 