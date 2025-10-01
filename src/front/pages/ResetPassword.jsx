import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
/* import { resetPassword } from "../services/auth.js";
 */

export const ResetPassword = () => {
    const navigate = useNavigate();
    const { dispatch } = useGlobalReducer();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

    const handlePasswordVisibility = (showPassword) => {
        if (showPassword === false) {
            setShowPassword(true);
        } else {
            setShowPassword(false);
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
                            <div className="input-group">
                                <input type={showPassword ? "text" : "password"} className="form-control" id="newPassword" placeholder={showPassword ? "Password" : "**********"}
                                    value={newPassword} onChange={handleNewPassword} required/>
                                <button type="button" onClick={() => handlePasswordVisibility(showPassword)} className="input-group-text text-dark bg-tertiary">
                                    {showPassword ? 
                                        <i class="fa-solid fa-eye-slash"></i>
                                        :
                                        <i class="fa-solid fa-eye"></i>
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="mb-2">Confirm Password<span className="text-body-tertiary">*</span></label>
                            <input type="password" className="form-control" id="confirmPassword" placeholder="**********"
                                value={confirmPassword} onChange={handleConfirmPassword} required/>
                        </div>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Confirm</button>
                    </form>
                </div>
            </div>
        </div>
    );
}; 