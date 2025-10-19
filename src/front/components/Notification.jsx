import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Notification = () => {
    const [isClosing, setIsClosing] = useState(false);  
    const { store, dispatch } = useGlobalReducer();
    const notification = store.notificationMessage; 

    useEffect(() => {
        if (notification) {
            setIsClosing(false);
            const timer = setTimeout(() => {
                setIsClosing(true);
                setTimeout(() => {
                    dispatch({
                        type: "CLEAR-NOTIFICATION"
                    });
                }, 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleCloseNotification = () => {
        setIsClosing(true);
        setTimeout(() => {
            dispatch({
                type: "CLEAR-NOTIFICATION"
            });
        }, 300);
    };

    return (notification || isClosing ? 
        <div className={`${isClosing ? "css-opacity-closing" : "css-opacity-1"}`}>
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
            <div className={`${isClosing ? "css-opacity-closing" : "css-opacity-06"} css-z-index-1055 position-fixed top-0 start-0 w-100 h-100 bg-dark`}></div>
        </div>
        :
        <div className="d-none"></div>
    );
};