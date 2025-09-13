import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { putUser, deleteUser } from "../services/star-wars-services.js";


export const Settings = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const currentUser = store.currentUser

    const [firstName, setFirstName] = useState(currentUser.first_name);
    const [lastName, setLastName] = useState(currentUser.last_name);

    const handleFirstName = event => setFirstName(event.target.value);
    const handleLastName = event => setLastName(event.target.value);

    const handleSubmitSettings = async (event) => {
        event.preventDefault();
        const userToPut = {
            "first_name": firstName,
            "last_name": lastName
        };
        try {
            const updatedUser = await putUser(currentUser.id, userToPut);
            dispatch({
                type: "CURRENT-USER",
                payload: updatedUser.results
            });
            navigate("/");
        } catch (error) {
            setFirstName(currentUser.first_name);
            setLastName(currentUser.last_name);
            return alert(error.message);
        }
    }

    const handleDeleteUser = async (event) => {
        event.preventDefault();
        try {
            const responseStatus = await deleteUser(currentUser.id);
            if (responseStatus == 204) {
                dispatch({ type: LOGOUT });
                navigate("/");
            }
        } catch (error) {
            setFirstName(currentUser.first_name);
            setLastName(currentUser.last_name);
            return alert(error.message);
        }
    }

    const handleCancel = () => {
        navigate("/");
    }

    return (
        <div className="d-flex justify-content-center my-4">
            <div className="col-10 col-md-6 col-lg-4 rounded-4 shadow">
                <div className="d-flex align-items-end justify-content-between p-5 pb-4 border-bottom-0">
                    <h1 className="fw-bold mb-0 fs-2">Settings</h1>
                    <button onClick={handleCancel} type="button" className="border-0 bg-transparent text-dark">
                        <i className="fa-solid fa-xmark fa-xl"></i>
                    </button>
                </div>
                <div className="p-5 pt-0">
                    <form onSubmit={handleSubmitSettings}>
                        <div className="mb-4">
                            <label htmlFor="signUpFirstName" className="mb-2">First Name</label>
                            <input type="text" className="form-control rounded-3" id="signUpFirstName" placeholder="Your first name"
                                value={firstName} onChange={handleFirstName} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="signUpLastName" className="mb-2">Last Name</label>
                            <input type="text" className="form-control rounded-3" id="signUpLastName" placeholder="Your last name"
                                value={lastName} onChange={handleLastName} />
                        </div>
                        <button className="w-100 my-2 btn btn-lg rounded-3 btn-dark" type="submit">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
}; 