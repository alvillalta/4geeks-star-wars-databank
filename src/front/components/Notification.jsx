import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Notification = () => {
    const { store, dispatch } = useGlobalReducer();
    const notification = store.notificationMessage; 

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                dispatch({
                    type: "CLEAR-NOTIFICATION"
                });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleCloseNotification = () => {
        dispatch({
            type: "CLEAR-NOTIFICATION"
        });
    };

    return (notification ? 
        <div>
            <div className="css-z-index-2000 position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start my-5">
                <div className="toast show border-black" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header bg-dark d-flex justify-content-between align-items-center text-light px-3">
                        <strong>Disclaimer</strong>
                        <button type="button" onClick={handleCloseNotification} className="border-0 bg-transparent">
                            <i className="fa-solid fa-xmark fa-xl text-light"></i>
                        </button>
                    </div>
                    <div className="toast-body bg-dark-subtle rounded-bottom">
                        <h5 className="text-center">{notification}</h5>
                    </div>
                </div>
            </div>
            <div className="css-opacity position-fixed top-0 start-0 w-100 h-100 bg-dark"></div>
        </div>
        :
        <div className="d-none"></div>
    );
};