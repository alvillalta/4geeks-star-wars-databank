import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/auth.js";


export const ResetPassword = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleNewPassword = event => setNewPassword(event.target.value);
    const handleConfirmPassword = event => setConfirmPassword(event.target.value);

    const handleSubmitResetPassword = async (event) => {
        event.preventDefault();
        const passwordToReset = {
            "new_password": newPassword,
            "confirm_password": confirmPassword
        }
        try {
            const responseStatus = await resetPassword(passwordToReset);
            if (responseStatus === 204) {
                dispatch({
                    type: "SET-NOTIFICATION",
                    payload: "Password reseted successfully"
                });
                navigate("/login");
            }
        } catch (error) {
            setNewPassword("");
            setConfirmPassword("");
            dispatch({
                type: "SET-NOTIFICATION",
                payload: error.message 
            });
        }
    }

    return (
        <div className="d-flex justify-content-center my-4">
            <div className="col-10 col-md-6 col-lg-4 rounded-4 shadow">
                <div className="d-flex align-items-end justify-content-start p-5 pb-4 border-bottom-0">
                    <h1 className="fw-bold mb-0 fs-2">Reset Password</h1>
                </div>
                <div className="p-5 pt-0">
                    <form onSubmit={handleSubmitResetPassword}>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="mb-2">New Password<span className="text-body-tertiary">*</span></label>
                            <input type="password" className="form-control rounded-3" id="newPassword" placeholder="Password"
                                value={newPassword} onChange={handleNewPassword} required/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="mb-2">Confirm Password<span className="text-body-tertiary">*</span></label>
                            <input type="password" className="form-control rounded-3" id="confirmPassword" placeholder="Password"
                                value={confirmPassword} onChange={handleConfirmPassword} required/>
                        </div>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Confirm</button>
                    </form>
                </div>
            </div>
        </div>
    );
}; 