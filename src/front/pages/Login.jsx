import React, { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth.js"


export const Login = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmail = event => setEmail(event.target.value);
    const handlePassword = event => setPassword(event.target.value);

    const handleSubmitLogin = async (event) => {
        event.preventDefault();
        const userToLogin = {
            "email": email,
            "password": password,
        }
        const userLogged = await login(userToLogin);
        localStorage.setItem("token", userLogged.access_token);
        dispatch({
            type: "LOGIN",
            payload: { token: userLogged.access_token, isLogged: true }
        });
        dispatch({
            type: "CURRENT-USER",
            payload: userLogged.results
        });
        navigate("/");
    }

    const handleCancel = () => {
        setEmail("");
        setPassword("");
        navigate("/");
    }

    return (
        <div className="d-flex justify-content-center my-4">
            <div className="col-10 col-md-6 col-lg-4 rounded-4 shadow">
                <div className="d-flex align-items-end justify-content-between p-5 pb-4 border-bottom-0">
                    <h1 className="fw-bold mb-0 fs-2">Log In</h1>
                    <button onClick={handleCancel} type="button" className="border-0 bg-transparent text-dark">
                        <i className="fa-solid fa-xmark fa-xl"></i>
                    </button>
                </div>
                <div className="p-5 pt-0">
                    <form onSubmit={handleSubmitLogin}>
                        <div className="mb-3">
                            <label htmlFor="loginEmail" className="mb-2">Email address</label>
                            <input type="email" className="form-control rounded-3" id="loginEmail" placeholder="name@example.com"
                                value={email} onChange={handleEmail} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="loginPassword" className="mb-2">Password</label>
                            <input type="password" className="form-control rounded-3" id="loginPassword" placeholder="Password"
                                value={password} onChange={handlePassword} />
                        </div>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Log In</button>
                        <hr className="my-4" />
                        <p className="text-body-secondary">Don't have an account? <Link to="/signup" className="text-dark">Sign up here</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}; 