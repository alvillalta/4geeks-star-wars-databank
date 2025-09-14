import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

import { getAgenda, deleteContact } from "../services/contact-services.js"

import defaultContactImageError from "../assets/default-contact-image-error.jpg";

export const ContactList = () => {

    // Declarations
    const navigate = useNavigate();

    const { store, dispatch } = useGlobalReducer();
    const contacts = store.contacts;

    // UseEffect
    useEffect(() => {
        const getAgendaInComponent = async () => {
            const contacts = await getAgenda();
            dispatch({
                type: "GET-AGENDA",
                payload: contacts
            });
        }
        getAgendaInComponent();
    }, [])

    // Handlers
    const handleDeleteContact = async (item) => {
        const contacts = await deleteContact(item.id);
        dispatch({
            type: "GET-AGENDA",
            payload: contacts
        });
    }

    const handleEditContact = (item) => {
        dispatch({
            type: "EDIT-CONTACT",
            payload: item
        })
        navigate("/contacts/edit-contact");
    }

    const handleImageError = (event) => {
        event.target.src = defaultContactImageError;
    }

    // Render
    return (
        <div className="my-4">
            <div className="container">
                <div className="row justify-content-center mb-3">
                    <div className="col-8 d-flex justify-content-between align-items-center">
                        <h3 className="mb-3">Contacts</h3>
                        <Link to="/contacts/add-contact" className="text-dark">
                            <span>Add Contact</span>
                        </Link>
                    </div>
                </div>
                <div className="row justify-content-center mb-3"> 
                    <div className="col-8">
                        {contacts.map(item => {
                            return (
                                <div className="card mb-3" key={item.id}>
                                    <div className="row justify-content-center align-items-center">
                                        <div className="col-md-8 col-lg-3 d-flex justify-content-center align-items-center">
                                            <img src={`https://randomuser.me/api/portraits/women/${item.id}.jpg`} className="img-fluid rounded-circle w-75"
                                                onError={handleImageError} />
                                        </div>
                                        <div className="col-lg-5 d-flex flex-column justify-content-center align-items-center">
                                            <div className="card-body p-3">
                                                <h5 className="card-title py-2">{item.name}</h5>
                                                <p className="card-text mb-1"><i className="fa-solid fa-envelope pe-2"></i>{item.email}</p>
                                                <p className="card-text mb-1"><i className="fa-solid fa-phone pe-2 pe-2"></i>{item.phone}</p>
                                                <p className="card-text mb-1"><i className="fa-solid fa-location-pin pe-2"></i>{item.address}</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 d-flex justify-content-center justify-content-lg-end p-3">
                                            <button onClick={() => handleEditContact(item)} type="button" className="btn btn-dark mx-3"><i className="fa-solid fa-pen"></i></button>
                                            <button onClick={() => handleDeleteContact(item)} type="button" className="btn btn-danger me-3"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}