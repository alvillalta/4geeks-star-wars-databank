import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { recoverPassword } from "../services/auth.js";


export const RecoverPassword = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [recoveryEmail, setRecoveryEmail] = useState("");

    const handleRecoveryEmail = event => setRecoveryEmail(event.target.value);

    const handleSubmitRecoverPassword = async (event) => {
        event.preventDefault();
        const userToRecover = {
            "email": recoveryEmail,
        }
        try {
            const responseStatus = await recoverPassword(userToRecover);
            if (responseStatus === 204) {
                dispatch({
                    type: "SET-NOTIFICATION",
                    payload: "Check your email inbox"
                });
                navigate("/");
            }
        } catch (error) {
            setEmail("");
            dispatch({
                type: "SET-NOTIFICATION",
                payload: error.message 
            });
        }
    }

    const handleCancel = () => {
        navigate("/login");
    }

    return (
        <div className="d-flex justify-content-center my-4">
            <div className="col-10 col-md-6 col-lg-4 rounded-4 shadow">
                <div className="d-flex align-items-end justify-content-between p-5 pb-4 border-bottom-0">
                    <h1 className="fw-bold mb-0 fs-2">Recover Password</h1>
                    <button onClick={handleCancel} type="button" className="border-0 bg-transparent text-dark">
                        <i className="fa-solid fa-xmark fa-xl"></i>
                    </button>
                </div>
                <div className="p-5 pt-0">
                    <form onSubmit={handleSubmitRecoverPassword}>
                        <div className="mb-4">
                            <label htmlFor="recoveryEmail" className="mb-2">Email address<span className="text-body-tertiary">*</span></label>
                            <input type="email" className="form-control rounded-3" id="recoveryEmail" placeholder="name@example.com"
                                value={recoveryEmail} onChange={handleRecoveryEmail} required/>
                        </div>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Send Recovery Mail</button>
                    </form>
                </div>
            </div>
        </div>
    );
}; 