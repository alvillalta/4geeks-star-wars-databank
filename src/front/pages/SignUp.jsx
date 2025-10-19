import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/auth.js"


export const SignUp = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleEmail = event => setEmail(event.target.value);
    const handlePassword = event => setPassword(event.target.value);
    const handleRepeatPassword = event => setRepeatPassword(event.target.value);
    const handleFirstName = event => setFirstName(event.target.value);
    const handleLastName = event => setLastName(event.target.value);

    const handleSubmitSignUp = async (event) => {
        event.preventDefault();
        const userToPost = {
            "email": email,
            "password": password,
            "repeat_password": repeatPassword,
            "first_name": firstName,
            "last_name": lastName
        };
        try {
            const userLogged = await signup(userToPost);
            dispatch({
                type: "LOGIN",
                payload: { token: userLogged.access_token, isLogged: true }
            });
            dispatch({
                type: "CURRENT-USER",
                payload: userLogged.results
            });
            navigate("/");
        } catch (error) {
            setEmail("");
            setPassword("");
            setRepeatPassword("");
            dispatch({
                type: "SET-NOTIFICATION",
                payload: error.message 
            });
        }
    };

    const handlePasswordVisibility = (showPassword) => {
        if (showPassword === false) {
            setShowPassword(true);
        } else {
            setShowPassword(false);
        }
    }

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="d-flex justify-content-center my-4">
            <div className="col-10 col-md-6 col-lg-4 rounded-4 bg-white shadow">
                <div className="d-flex align-items-end justify-content-between p-5 pb-4 border-bottom-0">
                    <h1 className="fw-bold mb-0 fs-2">Sign Up</h1>
                    <button onClick={handleCancel} type="button" className="border-0 bg-transparent text-dark">
                        <i className="fa-solid fa-xmark fa-xl"></i>
                    </button>
                </div>
                <div className="p-5 pt-0">
                    <form onSubmit={handleSubmitSignUp}>
                        <div className="mb-3">
                            <label htmlFor="signUpEmail" className="mb-2">
                                Email address
                                <span className="text-body-tertiary">*</span>
                            </label>
                            <input type="email" className="form-control" id="signUpEmail" placeholder="name@example.com"
                                value={email} onChange={handleEmail} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="signUpPassword" className="mb-2">
                                Password
                                <span className="text-body-tertiary">*</span>
                            </label>
                            <div className="input-group">
                                <input type={showPassword ? "text" : "password"} className="form-control" id="signUpPassword" placeholder={showPassword ? "Password" : "**********"}
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
                        <div className="mb-3">
                            <label htmlFor="signUpRepeatPassword" className="mb-2">
                                Repeat Password
                                <span className="text-body-tertiary">*</span>
                            </label>
                            <input type="password" className="form-control" id="signUpRepeatPassword" placeholder="**********"
                                value={repeatPassword} onChange={handleRepeatPassword} required/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="signUpFirstName" className="mb-2">First Name</label>
                            <input type="text" className="form-control" id="signUpFirstName" placeholder="Your first name"
                                value={firstName} onChange={handleFirstName} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="signUpLastName" className="mb-2">Last Name</label>
                            <input type="text" className="form-control" id="signUpLastName" placeholder="Your last name"
                                value={lastName} onChange={handleLastName} />
                        </div>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Sign Up</button>
                        <hr className="my-4" />
                        <p className="text-body-secondary">Already registered? <Link to="/login" className="text-dark">Log In here</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}; 